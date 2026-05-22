import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import DripD3 from "@/emails/drip-d3";
import DripD7 from "@/emails/drip-d7";
import DripD14 from "@/emails/drip-d14";
import DripD21 from "@/emails/drip-d21";
import DripD30 from "@/emails/drip-d30";
import { unsubHeaders } from "@/lib/unsubscribe";

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
};

const DRIPS: DripDef[] = [
  { day: 3, key: "d3", subject: "GIGASCOPE · Three days in — how the digest works", react: DripD3 },
  { day: 7, key: "d7", subject: "GIGASCOPE · How we know it's 78% built", react: DripD7 },
  { day: 14, key: "d14", subject: "GIGASCOPE · Why $9 stays $9 — the charter math", react: DripD14 },
  { day: 21, key: "d21", subject: "GIGASCOPE · Site spotlight — Giga Texas, 6 years from dirt", react: DripD21 },
  { day: 30, key: "d30", subject: "GIGASCOPE · 30 days in — what's worth your attention now", react: DripD30 },
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
    }
  }

  return NextResponse.json({
    ok: true,
    sent: sent.length,
    skipped: skipped.length,
    total: subscribers.length,
    sentSamples: sent.slice(0, 5),
    skippedSamples: skipped.slice(0, 5),
  });
}

export async function GET(req: Request) {
  // Vercel cron triggers via GET — delegate to POST so manual curl POST works too.
  return POST(req);
}
