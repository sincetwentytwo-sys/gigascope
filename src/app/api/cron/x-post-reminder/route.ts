import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";
import { dayForToday, getDraft, X_QUEUE_WEEK_1, type XPostDraft } from "@/data/x-queue";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Same pattern as other crons — fail closed in prod, open in dev for curl.
    return process.env.NODE_ENV !== "production";
  }
  const got = req.headers.get("authorization");
  if (!got) return false;
  return got === `Bearer ${expected}` || got === expected;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDateUtc(s: string): number | null {
  const m = s.match(ISO_DATE);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return Date.UTC(y, mo - 1, d);
}

function todayUtcMidnight(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// Escape Telegram Markdown V1 special chars.
function escapeMd(s: string): string {
  return s.replace(/([_*`\[])/g, "\\$1");
}

// HTML-escape for the email body so labels with `<`, `>`, `&` don't break the
// rendered template or open XSS-shaped surfaces.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 60 days TTL — far longer than the 7-day Week 1 window but cheap insurance
// against a re-trigger.
const SENT_FLAG_TTL = 60 * 24 * 60 * 60;

interface ChannelResult {
  channel: "telegram" | "email";
  ok: boolean;
  reason?: string;
}

interface SendResult {
  ok: boolean;
  day?: number;
  channels: ChannelResult[];
}

async function sendViaTelegram(chatId: string, draft: XPostDraft): Promise<ChannelResult> {
  // Four-message format mirrors the email's 3-section split so the mobile
  // workflow is consistent: header → main copy → reply copy → metadata.
  // Each copy block has no parse_mode so long-press-copy yields exactly the
  // X post text — no escape characters, no formatting marks.
  const headerMsg = [
    `*X Post — Day ${draft.day}/7*`,
    `_${escapeMd(draft.theme)}_`,
    "",
    "*3 steps:*",
    "1. Post the MAIN block (no link in body — algo penalty).",
    "2. Reply to your own tweet with the REPLY block.",
    "3. Attach the media file.",
  ].join("\n");

  const mainLabel = `*1. MAIN TWEET* — copy below ⬇️`;
  const replyLabel = `*2. REPLY 1* — reply to your own tweet with this ⬇️`;

  const metaLines = [`*3. Media:* ${escapeMd(draft.mediaHint)}`];
  if (draft.mediaUrl) {
    metaLines.push("", `Download: ${draft.mediaUrl}`);
  }
  if (draft.notes) {
    metaLines.push("", `*Notes:* ${escapeMd(draft.notes)}`);
  }
  metaLines.push(
    "",
    `_Reply "done" with the tweet URL after posting so we can track Day-${draft.day} signal._`,
  );

  const ok1 = await sendTelegramMessage(chatId, headerMsg, { disable_web_page_preview: true });
  if (!ok1) return { channel: "telegram", ok: false, reason: "header_failed" };

  // MAIN label + bare copy block (two messages so the copy block stands alone
  // for clean long-press-copy).
  await sendTelegramMessage(chatId, mainLabel, { disable_web_page_preview: true });
  const ok2 = await sendTelegramMessage(chatId, draft.text, {
    parse_mode: undefined,
    disable_web_page_preview: true,
  } as Parameters<typeof sendTelegramMessage>[2]);
  if (!ok2) return { channel: "telegram", ok: false, reason: "main_copy_failed" };

  // REPLY label + bare reply copy.
  await sendTelegramMessage(chatId, replyLabel, { disable_web_page_preview: true });
  const ok3 = await sendTelegramMessage(chatId, draft.replyText, {
    parse_mode: undefined,
    disable_web_page_preview: true,
  } as Parameters<typeof sendTelegramMessage>[2]);
  if (!ok3) return { channel: "telegram", ok: false, reason: "reply_copy_failed" };

  // Meta (preview ON when there's a downloadable media URL so it renders inline).
  const ok4 = await sendTelegramMessage(chatId, metaLines.join("\n"), {
    disable_web_page_preview: !draft.mediaUrl,
  });
  if (!ok4) return { channel: "telegram", ok: true, reason: "meta_failed" }; // partial success

  return { channel: "telegram", ok: true };
}

/**
 * Fetch a publicly-hosted media URL and convert to a Resend-attachable buffer.
 * Returns null on any failure — caller falls back to URL-only mode so a
 * transient blob-host outage never blocks the reminder send.
 *
 * filename is derived from the URL path tail so the attachment shows up in
 * Gmail with a sensible name (e.g. "giga-texas.mp4") rather than a random
 * hash or "attachment.bin".
 */
async function fetchMediaAttachment(
  url: string,
): Promise<{ filename: string; content: Buffer; contentType: string } | null> {
  try {
    // 8s timeout — fetch off Vercel CDN normally takes <500ms; anything beyond
    // 8s means something is wrong and we'd rather degrade than hang the cron.
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.error("media_fetch_failed", { url, status: res.status });
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    // Resend caps attachments at ~40MB total; our X-launch files are <2MB
    // each but defend against accidental misuse if mediaUrl ever points
    // somewhere huge.
    if (buf.byteLength > 30 * 1024 * 1024) {
      console.error("media_too_large", { url, bytes: buf.byteLength });
      return null;
    }
    const tail = url.split("?")[0].split("/").pop() ?? "media.bin";
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    return { filename: tail, content: buf, contentType };
  } catch (e) {
    console.error("media_fetch_exception", { url, error: e instanceof Error ? e.message : "unknown" });
    return null;
  }
}

async function sendViaEmail(
  resend: Resend,
  from: string,
  to: string,
  draft: XPostDraft,
): Promise<ChannelResult> {
  const subject = `GIGASCOPE · X Post Day ${draft.day}/7 — ${draft.theme}`;

  const safeText = escapeHtml(draft.text);
  const safeReply = escapeHtml(draft.replyText);
  const safeTheme = escapeHtml(draft.theme);
  const safeMedia = escapeHtml(draft.mediaHint);
  const safeNotes = draft.notes ? escapeHtml(draft.notes) : "";
  const mediaUrl = draft.mediaUrl ?? null;
  const previewUrl = draft.previewImageUrl ?? null;

  // Pull the media file inline as a real email attachment so owner can save
  // it directly from Gmail mobile → camera roll → swap to X. URL fallback
  // stays as a backup if the fetch fails.
  const attachment = mediaUrl ? await fetchMediaAttachment(mediaUrl) : null;

  // Media block — three states:
  //  (a) Days 1-2 with successful attachment fetch: preview thumbnail +
  //      "Attached above as <filename>" callout. Mobile flow: open email →
  //      tap attachment → Save to Photos → swap to X → attach from gallery.
  //  (b) Days 1-2 with fetch failure: degrades to URL-download button.
  //  (c) Days 3-7 screenshot day-of: just the hint text.
  const mediaBlock = attachment
    ? `
  <div style="font-size:13px;color:#666;margin-bottom:8px;"><strong>Media:</strong> attached as <code style="font-family:ui-monospace,monospace;font-size:12px;background:#f5f5f5;padding:2px 6px;border-radius:3px;">${escapeHtml(attachment.filename)}</code></div>
  ${previewUrl ? `<img src="${escapeHtml(previewUrl)}" alt="${safeMedia}" style="display:block;width:100%;max-width:512px;border:1px solid #e5e5e5;border-radius:6px;margin:0 0 12px;" />` : ""}
  <div style="font-size:13px;color:#666;margin-bottom:20px;">${safeMedia}</div>
  <div style="font-size:11px;color:#888;margin-bottom:20px;">Mobile: tap the attachment above → save to camera roll → open X → attach from gallery.</div>
`
    : mediaUrl
      ? `
  <div style="font-size:13px;color:#666;margin-bottom:8px;"><strong>Media to attach</strong> (attachment fetch failed — use the link below):</div>
  ${previewUrl ? `<a href="${escapeHtml(mediaUrl)}" style="display:block;margin:0 0 12px;"><img src="${escapeHtml(previewUrl)}" alt="${safeMedia}" style="display:block;width:100%;max-width:512px;border:1px solid #e5e5e5;border-radius:6px;" /></a>` : ""}
  <div style="font-size:13px;color:#666;margin-bottom:8px;">${safeMedia}</div>
  <a href="${escapeHtml(mediaUrl)}" download style="display:inline-block;background:#0a0a0a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin-bottom:20px;">⬇ Download file</a>
`
      : `
  <div style="font-size:13px;color:#666;margin-bottom:4px;"><strong>Media:</strong></div>
  <div style="font-size:13px;margin-bottom:20px;word-wrap:break-word;">${safeMedia}</div>
`;

  // Section header used to visually separate the three posting steps:
  //   1. MAIN TWEET (no link — X algo penalty)
  //   2. REPLY 1 (link lives here)
  //   3. ATTACHMENT (already in the email)
  const sectionLabel = (n: number, title: string, color: string) => `
  <div style="display:flex;align-items:center;gap:8px;margin:24px 0 8px;">
    <span style="display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:${color};color:#fff;font-size:12px;font-weight:700;border-radius:50%;">${n}</span>
    <span style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${title}</span>
  </div>`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;max-width:560px;margin:0 auto;padding:24px;">
  <div style="font-size:11px;letter-spacing:0.1em;color:#888;text-transform:uppercase;margin-bottom:4px;">Day ${draft.day} / 7</div>
  <h2 style="font-size:18px;margin:0 0 4px;">${safeTheme}</h2>
  <div style="font-size:12px;color:#888;margin-bottom:8px;">Post in 3 steps: main tweet → reply with link → attach media.</div>

  ${sectionLabel(1, "Main tweet · post first", "#0a0a0a")}
  <div style="font-size:12px;color:#666;margin-bottom:6px;">No link in the main body — X algorithm down-ranks link posts. Long-press to copy:</div>
  <pre style="background:#f5f5f5;border:1px solid #e5e5e5;border-radius:6px;padding:14px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;margin:0 0 8px;">${safeText}</pre>

  ${sectionLabel(2, "Reply 1 · link lives here", "#1d4ed8")}
  <div style="font-size:12px;color:#666;margin-bottom:6px;">After the main tweet posts, reply to your own tweet with this:</div>
  <pre style="background:#eef4ff;border:1px solid #bfdbfe;border-radius:6px;padding:14px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;margin:0 0 8px;">${safeReply}</pre>

  ${sectionLabel(3, "Attachment · for the main tweet", "#059669")}
${mediaBlock}

  ${safeNotes ? `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">
  <div style="font-size:12px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Notes</div>
  <div style="font-size:13px;color:#444;margin-bottom:16px;">${safeNotes}</div>` : ""}

  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">
  <div style="font-size:11px;color:#888;">
    Day ${draft.day} of 7-day X launch cycle.<br>
    Reply to this email with the tweet URL after posting so we can track Day-${draft.day} signal.
  </div>
</body></html>`;

  // Text alternative — same 3-section structure for clients that strip HTML.
  const text = [
    `GIGASCOPE · X Post Day ${draft.day}/7`,
    draft.theme,
    "",
    "═══ 1. MAIN TWEET (no link — post first) ═══",
    draft.text,
    "═══ end main ═══",
    "",
    "═══ 2. REPLY 1 (link — reply to your own tweet) ═══",
    draft.replyText,
    "═══ end reply ═══",
    "",
    "═══ 3. ATTACHMENT ═══",
    `Media: ${draft.mediaHint}`,
    attachment ? `Attached: ${attachment.filename}` : (mediaUrl ? `Download: ${mediaUrl}` : ""),
    draft.notes ? `\nNotes: ${draft.notes}` : "",
    "",
    `Reply to this email with the tweet URL after posting so we can track Day-${draft.day} signal.`,
  ].filter(Boolean).join("\n");

  // Resend SDK returns { data, error } and does NOT throw on API-level errors
  // — it only throws on network/SDK-internal problems. Caller must inspect
  // `error` explicitly, otherwise a domain-not-verified or invalid-to bounces
  // silently with ok:true.
  try {
    const result = await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to,
      subject,
      html,
      text,
      // Resend accepts `attachments: [{ filename, content }]` where content
      // is a Buffer or base64 string. We pass the raw buffer; Resend handles
      // the MIME encoding. Content-type is inferred from filename extension.
      ...(attachment
        ? {
            attachments: [
              {
                filename: attachment.filename,
                content: attachment.content,
              },
            ],
          }
        : {}),
    });
    if (result.error) {
      const msg = (result.error.message ?? "").slice(0, 200);
      const name = result.error.name ?? "ResendError";
      return { channel: "email", ok: false, reason: `resend_api_error:${name}:${msg}` };
    }
    const id = result.data?.id ?? "no-id";
    const attachedTag = attachment ? `:attached(${attachment.filename})` : "";
    return { channel: "email", ok: true, reason: `sent:${id}${attachedTag}` };
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return { channel: "email", ok: false, reason: `send_threw:${err}` };
  }
}

async function sendForDay(
  r: Redis,
  todayMid: number,
  day: number,
  ctx: {
    chatId: string | null;
    ownerEmail: string | null;
    resend: Resend | null;
    fromEmail: string;
  },
): Promise<SendResult> {
  const draft = getDraft(day);
  if (!draft) return { ok: false, channels: [{ channel: "email", ok: false, reason: "no_draft" }] };

  const dateKey = new Date(todayMid).toISOString().slice(0, 10);
  const flagKey = `x:post:reminder:${dateKey}:day${day}`;
  const acquired = await r.set(flagKey, "1", { nx: true, ex: SENT_FLAG_TTL });
  if (!acquired) {
    return { ok: false, day, channels: [{ channel: "email", ok: false, reason: "already_sent" }] };
  }

  // Fire whichever channels are configured. Telegram preferred (better mobile
  // copy UX), email as fallback. If BOTH are configured, send via Telegram only
  // to avoid double-pinging owner. Email serves as the safety net while
  // Telegram bot infra isn't deployed.
  const channels: ChannelResult[] = [];

  if (ctx.chatId) {
    channels.push(await sendViaTelegram(ctx.chatId, draft));
  } else if (ctx.resend && ctx.ownerEmail) {
    channels.push(await sendViaEmail(ctx.resend, ctx.fromEmail, ctx.ownerEmail, draft));
  } else {
    // Neither channel available — release the flag so a follow-up run can
    // succeed after owner configures something.
    await r.del(flagKey);
    return {
      ok: false,
      day,
      channels: [{ channel: "email", ok: false, reason: "no_channel_configured" }],
    };
  }

  const anySuccess = channels.some((c) => c.ok);
  if (!anySuccess) {
    // All attempted channels failed — release flag for retry.
    await r.del(flagKey);
  }

  return { ok: anySuccess, day, channels };
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // Resolve owner identifiers from env / redis.
  const ownerEmail = (process.env.OWNER_EMAIL ?? "sincetwentytwo@gmail.com").toLowerCase();

  // Telegram chat_id resolution: env override → redis lookup → null.
  let chatId: string | null = process.env.OWNER_TELEGRAM_CHAT_ID ?? null;
  if (!chatId && isTelegramConfigured()) {
    const lookup = await r.get(`telegram:chat:${ownerEmail}`);
    chatId = typeof lookup === "string" ? lookup : null;
  }
  // If Telegram bot isn't configured at all, chatId stays null and we fall
  // through to email. A stale env-only chat_id without a bot token would also
  // be useless — defend against that.
  if (chatId && !isTelegramConfigured()) chatId = null;

  // Resend setup. Cron runs even without Resend so a Telegram-only deployment
  // doesn't 503; only fails if BOTH channels are absent.
  const resendKey = process.env.RESEND_API_KEY;
  const resend = resendKey ? new Resend(resendKey) : null;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";

  if (!chatId && !resend) {
    return NextResponse.json(
      {
        ok: false,
        error: "no_channel_configured",
        message:
          "Configure at least one: (a) TELEGRAM_BOT_TOKEN + linked chat, (b) RESEND_API_KEY for email fallback.",
      },
      { status: 503 },
    );
  }

  const startRaw = process.env.X_LAUNCH_START_DATE;
  if (!startRaw) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "launch_not_configured",
      message: "Set X_LAUNCH_START_DATE=YYYY-MM-DD in Vercel env to start the 7-day reminder cycle.",
      queueLength: X_QUEUE_WEEK_1.length,
    });
  }

  const startMid = parseIsoDateUtc(startRaw);
  if (startMid === null) {
    return NextResponse.json(
      { ok: false, error: "invalid_start_date", got: startRaw, expected: "YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const now = Date.now();
  const todayMid = todayUtcMidnight(now);
  const day = dayForToday(startMid, todayMid);

  if (day === null) {
    const DAY_MS = 86400_000;
    const diff = Math.round((todayMid - startMid) / DAY_MS);
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: diff < 0 ? "before_launch" : "week_1_complete",
      daysFromLaunch: diff,
      queueLength: X_QUEUE_WEEK_1.length,
      hint:
        diff < 0
          ? `Launch starts in ${Math.abs(diff)} days (${startRaw}).`
          : "Week 1 reminder cycle finished. Generator for Week 2+ not built — validate signal first.",
    });
  }

  const result = await sendForDay(r, todayMid, day, {
    chatId,
    ownerEmail,
    resend,
    fromEmail,
  });

  return NextResponse.json({
    ok: result.ok,
    day: result.day,
    channels: result.channels,
    launchStart: startRaw,
    routedVia: chatId ? "telegram" : resend ? "email" : "none",
  });
}

export async function GET(req: Request) {
  // Vercel cron triggers via GET — delegate to POST so manual curl POST works too.
  return POST(req);
}
