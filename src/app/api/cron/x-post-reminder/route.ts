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
  // Three-message format: header / bare-copy / metadata. The bare-copy block
  // has no parse_mode so long-press-copy on phone yields exactly the X post
  // text — no escape characters, no formatting marks.
  const headerMsg = [
    `*X Post — Day ${draft.day}/7*`,
    `_${escapeMd(draft.theme)}_`,
    "",
    "Copy the next message and paste into X. Long-press → Copy All.",
  ].join("\n");

  const metaLines = [`*Media:* ${escapeMd(draft.mediaHint)}`];
  if (draft.notes) {
    metaLines.push("", `*Notes:* ${escapeMd(draft.notes)}`);
  }
  metaLines.push(
    "",
    `_Reply "done" with the tweet URL after posting so we can track Day-${draft.day} signal._`,
  );

  const ok1 = await sendTelegramMessage(chatId, headerMsg, { disable_web_page_preview: true });
  if (!ok1) return { channel: "telegram", ok: false, reason: "header_failed" };

  const ok2 = await sendTelegramMessage(chatId, draft.text, {
    parse_mode: undefined,
    disable_web_page_preview: true,
  } as Parameters<typeof sendTelegramMessage>[2]);
  if (!ok2) return { channel: "telegram", ok: false, reason: "copy_failed" };

  const ok3 = await sendTelegramMessage(chatId, metaLines.join("\n"), {
    disable_web_page_preview: true,
  });
  if (!ok3) return { channel: "telegram", ok: true, reason: "meta_failed" }; // partial success

  return { channel: "telegram", ok: true };
}

async function sendViaEmail(
  resend: Resend,
  from: string,
  to: string,
  draft: XPostDraft,
): Promise<ChannelResult> {
  const subject = `GIGASCOPE · X Post Day ${draft.day}/7 — ${draft.theme}`;

  // Plain block layout. Mobile mail clients render this with `pre` so the
  // tweet text is monospace and trivially long-press-copyable.
  const safeText = escapeHtml(draft.text);
  const safeTheme = escapeHtml(draft.theme);
  const safeMedia = escapeHtml(draft.mediaHint);
  const safeNotes = draft.notes ? escapeHtml(draft.notes) : "";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;max-width:560px;margin:0 auto;padding:24px;">
  <div style="font-size:11px;letter-spacing:0.1em;color:#888;text-transform:uppercase;margin-bottom:4px;">Day ${draft.day} / 7</div>
  <h2 style="font-size:18px;margin:0 0 16px;">${safeTheme}</h2>

  <div style="font-size:13px;color:#666;margin-bottom:8px;">Tweet text — long-press to copy:</div>
  <pre style="background:#f5f5f5;border:1px solid #e5e5e5;border-radius:6px;padding:14px;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;margin:0 0 20px;">${safeText}</pre>

  <div style="font-size:13px;color:#666;margin-bottom:4px;"><strong>Media:</strong></div>
  <div style="font-size:13px;margin-bottom:16px;word-wrap:break-word;">${safeMedia}</div>

  ${safeNotes ? `<div style="font-size:13px;color:#666;margin-bottom:4px;"><strong>Notes:</strong></div>
  <div style="font-size:13px;margin-bottom:16px;">${safeNotes}</div>` : ""}

  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;">
  <div style="font-size:11px;color:#888;">
    Day ${draft.day} of 7-day X launch cycle.<br>
    Reply with the tweet URL after posting so we can track Day-${draft.day} signal.
  </div>
</body></html>`;

  // Text alternative — same content, no markup. Mobile mail clients that
  // strip HTML still get a fully usable copy surface.
  const text = [
    `GIGASCOPE · X Post Day ${draft.day}/7`,
    draft.theme,
    "",
    "─── Tweet text (copy below) ───",
    draft.text,
    "─── End tweet text ───",
    "",
    `Media: ${draft.mediaHint}`,
    draft.notes ? `\nNotes: ${draft.notes}` : "",
    "",
    `Reply with the tweet URL after posting so we can track Day-${draft.day} signal.`,
  ].join("\n");

  try {
    await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to,
      subject,
      html,
      text,
    });
    return { channel: "email", ok: true };
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 120) : "unknown";
    return { channel: "email", ok: false, reason: `send_failed:${err}` };
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
