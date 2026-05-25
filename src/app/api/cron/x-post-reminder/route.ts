import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";
import { dayForToday, getDraft, X_QUEUE_WEEK_1 } from "@/data/x-queue";

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

// Parse YYYY-MM-DD to UTC midnight. Returns null on bad input — caller treats
// that as "launch date not configured" and skips silently.
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

// Escape Telegram Markdown V1 special chars. Matches the pattern in
// catalyst-alerts so output rendering is consistent across cron channels.
function escapeMd(s: string): string {
  return s.replace(/([_*`\[])/g, "\\$1");
}

// 60 days TTL — far longer than the 7-day Week 1 window but cheap insurance
// against a re-trigger (manual curl + scheduled fire on the same day).
const SENT_FLAG_TTL = 60 * 24 * 60 * 60;

interface SendResult {
  ok: boolean;
  reason?: string;
  day?: number;
}

async function sendForDay(
  r: Redis,
  chatId: string,
  todayMid: number,
  day: number,
): Promise<SendResult> {
  const draft = getDraft(day);
  if (!draft) return { ok: false, reason: "no_draft_for_day", day };

  // YYYY-MM-DD key so a single date can only fire once even if X_LAUNCH_START_DATE
  // is later edited (e.g. owner postpones launch). day number alone would
  // collide on a re-launch.
  const dateKey = new Date(todayMid).toISOString().slice(0, 10);
  const flagKey = `x:post:reminder:${dateKey}:day${day}`;
  const acquired = await r.set(flagKey, "1", { nx: true, ex: SENT_FLAG_TTL });
  if (!acquired) return { ok: false, reason: "already_sent", day };

  // Two-message format: (1) the bare copy text so long-press-copy on phone
  // grabs only the post body, no commentary. (2) metadata + media hint +
  // notes. Order matters — owner sees the copy block first.
  const headerMsg = [
    `*X Post — Day ${day}/7*`,
    `_${escapeMd(draft.theme)}_`,
    "",
    "Copy the next message and paste into X. Long-press → Copy All.",
  ].join("\n");

  // The draft text itself — no Markdown escapes, no formatting. Pure copy
  // surface. parse_mode disabled so `_` and `*` in the post body don't get
  // interpreted as italic/bold.
  const copyMsg = draft.text;

  const metaLines = [
    `*Media:* ${escapeMd(draft.mediaHint)}`,
  ];
  if (draft.notes) {
    metaLines.push("", `*Notes:* ${escapeMd(draft.notes)}`);
  }
  metaLines.push(
    "",
    `_Reply "done" with the tweet URL after posting so we can track Day-${day} signal._`,
  );
  const metaMsg = metaLines.join("\n");

  const ok1 = await sendTelegramMessage(chatId, headerMsg, { disable_web_page_preview: true });
  if (!ok1) return { ok: false, reason: "telegram_header_failed", day };

  // No parse_mode on the copy block — owner gets the exact bytes they need.
  // Telegram will still URL-preview the gigascope.xyz link unless we suppress.
  const ok2 = await sendTelegramMessage(chatId, copyMsg, {
    parse_mode: undefined,
    disable_web_page_preview: true,
  } as Parameters<typeof sendTelegramMessage>[2]);
  if (!ok2) {
    // Header went out but copy didn't. Release the flag so the next run can
    // retry the full sequence cleanly.
    await r.del(flagKey);
    return { ok: false, reason: "telegram_copy_failed", day };
  }

  const ok3 = await sendTelegramMessage(chatId, metaMsg, { disable_web_page_preview: true });
  if (!ok3) {
    // Partial send is annoying but recoverable manually. Don't release flag
    // because the copy block already went through.
    return { ok: true, reason: "telegram_meta_failed", day };
  }

  return { ok: true, day };
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!isTelegramConfigured()) {
    return NextResponse.json(
      { ok: false, error: "telegram_not_configured", message: "Set TELEGRAM_BOT_TOKEN in Vercel env." },
      { status: 503 },
    );
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // Resolve owner's Telegram chat_id. Two paths:
  //   1) OWNER_TELEGRAM_CHAT_ID env var — explicit override, useful for dev.
  //   2) Redis lookup by OWNER_EMAIL (default: site owner) — leverages the
  //      same /account deep-link flow subscribers use. Owner just links once
  //      and never has to fish for a chat_id manually.
  let chatId: string | null = process.env.OWNER_TELEGRAM_CHAT_ID ?? null;
  if (!chatId) {
    const ownerEmail = (process.env.OWNER_EMAIL ?? "sincetwentytwo@gmail.com").toLowerCase();
    const lookup = await r.get(`telegram:chat:${ownerEmail}`);
    chatId = typeof lookup === "string" ? lookup : null;
    if (!chatId) {
      return NextResponse.json(
        {
          ok: false,
          error: "owner_chat_id_missing",
          message:
            "Owner Telegram not linked. Subscribe at gigascope.xyz → open /account → tap 'Link Telegram' → message @gigascopebot. OR set OWNER_TELEGRAM_CHAT_ID in Vercel env.",
          checked: { env: "OWNER_TELEGRAM_CHAT_ID", redis: `telegram:chat:${ownerEmail}` },
        },
        { status: 503 },
      );
    }
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
    // Before launch or past Week 1. Two distinct shapes; the diff tells owner
    // whether to wait or whether the queue is exhausted.
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
          : "Week 1 reminder cycle finished. Generator for Week 2+ not built — owner: validate signal first.",
    });
  }

  const result = await sendForDay(r, chatId, todayMid, day);
  return NextResponse.json({
    ok: result.ok,
    day: result.day,
    reason: result.reason,
    launchStart: startRaw,
  });
}

export async function GET(req: Request) {
  // Vercel cron triggers via GET — delegate to POST so manual curl POST works too.
  return POST(req);
}
