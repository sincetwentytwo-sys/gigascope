import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import CatalystAlertEmail, { type CatalystAlertWindow } from "@/emails/catalyst-alert";
import { unsubHeaders } from "@/lib/unsubscribe";
import { TICKERS } from "@/data/tickers";
import { factories } from "@/data/factories";

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

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Parse a YYYY-MM-DD string to a UTC midnight timestamp. Returns null for any
// non-ISO format (quarterly "2026-Q3", year-only "2027", half-year "2026-2H").
// T-N alerting requires day-precision; lower-precision dates are skipped.
function parseIsoDateUtc(s: string): number | null {
  const m = s.match(ISO_DATE);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return Date.UTC(y, mo - 1, d);
}

// Today (UTC) at midnight, so day-diff math is stable regardless of when the
// cron runs within the day.
function todayUtcMidnight(now: number): number {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function windowFor(daysUntil: number): CatalystAlertWindow | null {
  if (daysUntil === 7) return "t-7";
  if (daysUntil === 1) return "t-1";
  if (daysUntil === 0) return "t-0";
  return null;
}

function subjectFor(window: CatalystAlertWindow, symbol: string, label: string): string {
  if (window === "t-7") return `GIGASCOPE · T-7: ${symbol} ${label}`;
  if (window === "t-1") return `GIGASCOPE · T-1: ${symbol} ${label}`;
  return `GIGASCOPE · Today: ${symbol} ${label}`;
}

// Stable per-catalyst key: sha256(symbol|date|label) → first 16 hex chars.
// Same scheme used by unsubscribe tokens; collision risk is negligible for the
// expected catalyst volume.
function catalystKey(symbol: string, date: string, label: string): string {
  return crypto
    .createHash("sha256")
    .update(`${symbol}|${date}|${label}`)
    .digest("hex")
    .slice(0, 16);
}

interface EligibleCatalyst {
  symbol: string;
  label: string;
  date: string;
  confidence: string;
  window: CatalystAlertWindow;
  key: string;
}

// 400 days — well beyond a single catalyst's relevance horizon. Flag holds
// long enough that a delayed cron, deploy, or re-run never double-sends.
const FLAG_TTL_SECONDS = 400 * 24 * 60 * 60;

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
  const todayMid = todayUtcMidnight(now);
  const DAY_MS = 86400_000;

  // 1) Collect eligible catalysts across both data sources.
  //    Calendar page (src/app/calendar/page.tsx) renders the union of
  //    TICKERS.catalysts + factories.milestones — we mirror that here.
  //    TODO: most TICKERS catalysts are quarterly/yearly ("2026-Q3", "2027");
  //    only entries with full YYYY-MM-DD dates qualify for T-N alerting.
  const eligible: EligibleCatalyst[] = [];

  for (const t of TICKERS) {
    for (const c of t.catalysts ?? []) {
      const ts = parseIsoDateUtc(c.date);
      if (ts === null) continue;
      const daysUntil = Math.round((ts - todayMid) / DAY_MS);
      const w = windowFor(daysUntil);
      if (!w) continue;
      eligible.push({
        symbol: t.symbol,
        label: c.label,
        date: c.date,
        confidence: c.confidence ?? "unspecified",
        window: w,
        key: catalystKey(t.symbol, c.date, c.label),
      });
    }
  }

  for (const f of factories) {
    for (const m of f.milestones ?? []) {
      if (m.done) continue;
      const ts = parseIsoDateUtc(m.date);
      if (ts === null) continue;
      const daysUntil = Math.round((ts - todayMid) / DAY_MS);
      const w = windowFor(daysUntil);
      if (!w) continue;
      // Use the factory slug as the "symbol" surface — it's what the calendar
      // page shows as the entity tag for milestones.
      eligible.push({
        symbol: f.slug.toUpperCase(),
        label: `${f.name}: ${m.text}`,
        date: m.date,
        confidence: m.confidence ?? "unspecified",
        window: w,
        key: catalystKey(f.slug, m.date, m.text),
      });
    }
  }

  if (eligible.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      skipped: 0,
      totalSubscribers: 0,
      eligibleCatalysts: 0,
      note: "no_eligible_catalysts_today",
    });
  }

  // 2) Pull subscribers.
  //    TODO: gate to charterMember tier once Stripe billing is live.
  const subscribers = await r.smembers("subscribers:emails");
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      skipped: 0,
      totalSubscribers: 0,
      eligibleCatalysts: eligible.length,
      note: "no_subscribers",
    });
  }

  const sent: Array<{ email: string; symbol: string; window: CatalystAlertWindow }> = [];
  const skipped: Array<{ email: string; symbol: string; window: CatalystAlertWindow; reason: string }> = [];

  for (const email of subscribers) {
    for (const c of eligible) {
      const flagKey = `catalyst:alert:sent:${email}:${c.key}:${c.window}`;
      // Atomic claim BEFORE send — same pattern as drips/send. Prevents a
      // double-send if the cron is triggered twice (manual curl + scheduled).
      const acquired = await r.set(flagKey, "1", { nx: true, ex: FLAG_TTL_SECONDS });
      if (!acquired) {
        skipped.push({ email, symbol: c.symbol, window: c.window, reason: "already_sent" });
        continue;
      }

      try {
        await resend.emails.send({
          from: `GIGASCOPE <${from}>`,
          to: email,
          subject: subjectFor(c.window, c.symbol, c.label),
          react: CatalystAlertEmail({
            email,
            catalyst: {
              symbol: c.symbol,
              label: c.label,
              date: c.date,
              confidence: c.confidence,
            },
            window: c.window,
          }),
          headers: unsubHeaders(email),
        });
        sent.push({ email, symbol: c.symbol, window: c.window });
      } catch (e) {
        // Release the flag so a later run can retry.
        await r.del(flagKey);
        const err = e instanceof Error ? e.message.slice(0, 120) : "unknown";
        skipped.push({ email, symbol: c.symbol, window: c.window, reason: "send_failed", ...({ err } as object) });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    sent: sent.length,
    skipped: skipped.length,
    totalSubscribers: subscribers.length,
    eligibleCatalysts: eligible.length,
    sentSamples: sent.slice(0, 5),
    skippedSamples: skipped.slice(0, 5),
  });
}

export async function GET(req: Request) {
  // Vercel cron triggers via GET — delegate to POST so manual curl POST works too.
  return POST(req);
}
