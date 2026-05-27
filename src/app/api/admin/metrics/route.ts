// Admin endpoint — email send-volume metrics dashboard data.
//
// TODO: Open/click counts are NOT counted yet. Wire Resend webhooks at
// POST /api/webhooks/resend (not yet built). When wired, increment
// `metric:open:<type>` and `metric:click:<type>` Redis keys (lifetime
// totals) plus per-day `metric:open:<type>:<YYYY-MM-DD>` /
// `metric:click:<type>:<YYYY-MM-DD>` (90d TTL via same pattern as
// recordEmailSent). The response shape here is forward-compatible — add
// `opens` and `clicks` siblings to `sent` once the data exists.
//
// Auth: shared `isCronAuthorized` (Bearer CRON_SECRET). Same credential the
// cron routes use. No subscriber data is returned, only aggregate counts,
// so the surface is low-risk — but we still gate it to avoid leaking
// send-volume numbers to randoms (those numbers ARE a competitor signal).

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isCronAuthorized } from "@/lib/cronAuth";
import { utcDateKey, type EmailType } from "@/lib/emailMetrics";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// All email types we currently emit. Keep in sync with EmailType in
// /lib/emailMetrics.ts — if a new type ships there, add it here so the
// admin dashboard surfaces it. Missing-key reads return 0, so under-listing
// just hides data; it doesn't crash.
const TYPES: EmailType[] = [
  "welcome",
  "drip-d3",
  "drip-d7",
  "drip-d14",
  "drip-d21",
  "drip-d30",
  "digest",
  "catalyst-alert",
  "permit-alert",
  "x-reminder",
];

// How many trailing UTC days to surface in the per-day breakdown. 7 covers
// "this week" at-a-glance without ballooning the response. Daily keys have
// 90d TTL so increasing this is safe up to ~90.
const DAYS_BACK = 7;

const DAY_MS = 86_400_000;

interface MetricsResponse {
  sent: Record<EmailType, number>;
  // Map<YYYY-MM-DD, Map<EmailType, count>> — only non-zero entries
  // populated, so the JSON stays compact.
  dates: Record<string, Partial<Record<EmailType, number>>>;
  // TODO sentinel — present so callers know opens/clicks are not yet wired.
  // Once /api/webhooks/resend ships, replace with real numbers.
  opens?: Record<EmailType, number>;
  clicks?: Record<EmailType, number>;
}

function parseCount(raw: unknown): number {
  // Upstash returns numbers as JS numbers for INCR-backed keys, but a
  // direct GET of a counter that was INCRed comes back as a string.
  // Defend against both.
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === "string") {
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function GET(req: Request): Promise<NextResponse> {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // Build the date window: today (UTC) and the previous DAYS_BACK-1 days.
  const now = Date.now();
  const dateKeys: string[] = [];
  for (let i = 0; i < DAYS_BACK; i++) {
    dateKeys.push(utcDateKey(now - i * DAY_MS));
  }

  // One MGET for totals + one MGET for per-day. Two round-trips total no
  // matter how many types/days — keeps the admin call cheap. Upstash REST
  // does not support pipelined transactions over arbitrary keys, but MGET
  // is single round-trip.
  const totalKeys = TYPES.map((t) => `metric:sent:${t}:total`);
  const dayKeys: string[] = [];
  for (const d of dateKeys) {
    for (const t of TYPES) dayKeys.push(`metric:sent:${t}:${d}`);
  }

  let totalsRaw: unknown[] = [];
  let daysRaw: unknown[] = [];
  try {
    totalsRaw = totalKeys.length > 0 ? await r.mget<unknown[]>(...totalKeys) : [];
    daysRaw = dayKeys.length > 0 ? await r.mget<unknown[]>(...dayKeys) : [];
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return NextResponse.json({ ok: false, error: "redis_failed", message: err }, { status: 500 });
  }

  // Stitch totals back to typed map.
  const sent: Record<EmailType, number> = Object.fromEntries(
    TYPES.map((t, i) => [t, parseCount(totalsRaw[i])]),
  ) as Record<EmailType, number>;

  // Stitch per-day reads back into dateKey -> type -> count. Only emit
  // non-zero entries to keep the JSON compact.
  const dates: Record<string, Partial<Record<EmailType, number>>> = {};
  let idx = 0;
  for (const d of dateKeys) {
    const dayMap: Partial<Record<EmailType, number>> = {};
    let anyNonZero = false;
    for (const t of TYPES) {
      const c = parseCount(daysRaw[idx]);
      idx++;
      if (c > 0) {
        dayMap[t] = c;
        anyNonZero = true;
      }
    }
    if (anyNonZero) dates[d] = dayMap;
  }

  const body: MetricsResponse = { sent, dates };
  return NextResponse.json({ ok: true, ...body });
}
