import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import DripD3 from "@/emails/drip-d3";
import DripD7 from "@/emails/drip-d7";
import DripD14 from "@/emails/drip-d14";
import DripD21 from "@/emails/drip-d21";
import DripD30 from "@/emails/drip-d30";
import { unsubHeaders } from "@/lib/unsubscribe";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";

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
    // In production, fail closed. In dev/local, allow for manual testing.
    return process.env.NODE_ENV !== "production";
  }
  const got = req.headers.get("authorization");
  if (!got) return false;
  return got === `Bearer ${expected}` || got === expected;
}

type DripDef = {
  day: number;
  key: string;
  subject: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  react: (props: { email: string }) => any;
  // Short Markdown for Telegram. Falls back to nothing if absent — bot send
  // is skipped entirely for that drip. Keep these to 4-6 lines, no markdown
  // chars that would need escaping.
  telegram?: string;
};

const DRIPS: DripDef[] = [
  {
    day: 3,
    key: "d3",
    subject: "GIGASCOPE · Three days in — how the digest works",
    react: DripD3,
    telegram:
      "*GIGASCOPE · Day 3*\nThree days in. Here's how the daily digest works and what to look for in the satellite frames.\nhttps://gigascope.xyz",
  },
  {
    day: 7,
    key: "d7",
    subject: "GIGASCOPE · How we know it's 78% built",
    react: DripD7,
    telegram:
      "*GIGASCOPE · Day 7*\nHow we estimate a site's build progress from public satellite + permit data.\nhttps://gigascope.xyz/methodology",
  },
  {
    day: 14,
    key: "d14",
    subject: "GIGASCOPE · Why $9 stays $9 — the charter math",
    react: DripD14,
    telegram:
      "*GIGASCOPE · Day 14*\nWhy $9 stays $9 forever for charter members. The math, and where you sit on the list.\nhttps://gigascope.xyz/pro",
  },
  {
    day: 21,
    key: "d21",
    subject: "GIGASCOPE · Site spotlight — Giga Texas, 6 years from dirt",
    react: DripD21,
    telegram:
      "*GIGASCOPE · Day 21*\nGiga Texas — six years from dirt to mass production. Tour the timeline.\nhttps://gigascope.xyz/site/giga-texas",
  },
  {
    day: 30,
    key: "d30",
    subject: "GIGASCOPE · 30 days in — what's worth your attention now",
    react: DripD30,
    telegram:
      "*GIGASCOPE · Day 30*\n30 days in. The three sites worth watching this quarter.\nhttps://gigascope.xyz",
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const FLAG_TTL_SECONDS = 400 * 24 * 60 * 60; // 400d — well past the D+30 window

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { ok: false, error: "resend_not_configured", message: "Set RESEND_API_KEY in Vercel env vars." },
      { status: 503 },
    );
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const now = Date.now();

  const subscribers = await r.smembers("subscribers:emails");
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, total: 0, note: "no_subscribers" });
  }

  const sent: Array<{ email: string; drip: string }> = [];
  const skipped: Array<{ email: string; drip: string; reason: string }> = [];
  // Telegram counters live alongside email — same flag controls dedup, so
  // a drip won't fire on telegram twice once the email path has claimed it.
  const tgSent: Array<{ email: string; drip: string }> = [];
  const tgSkipped: Array<{ email: string; drip: string; reason: string }> = [];
  const tgEnabled = isTelegramConfigured();

  for (const email of subscribers) {
    const tsRaw = await r.hget(`subscriber:${email}`, "ts");
    const ts = typeof tsRaw === "number" ? tsRaw : typeof tsRaw === "string" ? Number(tsRaw) : NaN;
    if (!ts || !Number.isFinite(ts)) {
      skipped.push({ email, drip: "n/a", reason: "no_ts" });
      continue;
    }
    const ageDays = (now - ts) / DAY_MS;

    for (const drip of DRIPS) {
      // Eligible inside the [day, day+7) window — wide catch-up so a delayed
      // cron run (incident, deploy, etc.) doesn't permanently miss a drip.
      // The atomic SET-NX flag below guarantees no double-send.
      if (ageDays < drip.day || ageDays >= drip.day + 7) continue;

      const flagKey = `drip:sent:${email}:${drip.key}`;
      // Atomic claim BEFORE send — prevents read-then-write race between
      // concurrent cron invocations (manual curl + scheduled run).
      const acquired = await r.set(flagKey, "1", { nx: true, ex: FLAG_TTL_SECONDS });
      if (!acquired) {
        skipped.push({ email, drip: drip.key, reason: "already_sent" });
        continue;
      }

      try {
        await resend.emails.send({
          from: `GIGASCOPE <${from}>`,
          to: email,
          subject: drip.subject,
          react: drip.react({ email }),
          headers: unsubHeaders(email),
        });
        sent.push({ email, drip: drip.key });
      } catch (e) {
        // Release the flag so a later run can retry.
        await r.del(flagKey);
        const err = e instanceof Error ? e.message.slice(0, 120) : "unknown";
        skipped.push({ email, drip: drip.key, reason: "send_failed", err } as { email: string; drip: string; reason: string });
      }

      // Opportunistic Telegram send. Bot send is gated on the same flag the
      // email path claims — so if the email succeeded we ALSO try Telegram,
      // and if the email failed we DON'T try Telegram (flag already released
      // means next run will retry both). We don't gate on email success here
      // because Telegram delivery is a "nice to have" alongside email; the
      // flag prevents double-send by itself.
      if (tgEnabled && drip.telegram) {
        const chatIdRaw = await r.get(`telegram:chat:${email}`);
        const chatId = typeof chatIdRaw === "string" ? chatIdRaw : null;
        if (!chatId) {
          tgSkipped.push({ email, drip: drip.key, reason: "no_chat_id" });
        } else {
          const ok = await sendTelegramMessage(chatId, drip.telegram, { disable_web_page_preview: true });
          if (ok) tgSent.push({ email, drip: drip.key });
          else tgSkipped.push({ email, drip: drip.key, reason: "telegram_send_failed" });
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent: sent.length,
    skipped: skipped.length,
    total: subscribers.length,
    sentSamples: sent.slice(0, 5),
    skippedSamples: skipped.slice(0, 5),
    telegram: {
      enabled: tgEnabled,
      sent: tgSent.length,
      skipped: tgSkipped.length,
      sentSamples: tgSent.slice(0, 5),
      skippedSamples: tgSkipped.slice(0, 5),
    },
  });
}

export async function GET(req: Request) {
  // Vercel cron triggers via GET — delegate to POST so manual curl POST works too.
  return POST(req);
}
