import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

// Allow-list of feature IDs. Mirrors the ROADMAP_FEATURES list on
// /roadmap. Hard-coded server-side so a malicious POST cannot mint a
// counter for an arbitrary key like `roadmap:vote:<sql_payload>` and
// pollute the keyspace. Keep this in sync with src/app/roadmap/page.tsx.
const VALID_IDS = new Set<string>([
  "satellite-drop-alerts",
  "csv-json-exports",
  "polygon-download",
  "per-site-rss",
  "company-comparison",
  "inference-archive",
  "permit-watchlist",
]);

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Rate limit: 5 votes per hour per IP. Same shape as /api/subscribe.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 3600;

async function checkRateLimit(r: Redis, ip: string): Promise<boolean> {
  const key = `ratelimit:roadmap-vote:${ip}`;
  try {
    const count = await r.incr(key);
    if (count === 1) {
      await r.expire(key, RATE_LIMIT_WINDOW_SEC);
    }
    return count <= RATE_LIMIT_MAX;
  } catch {
    // Fail open on transient INCR errors — we still gate writes below on
    // the sadd dedupe key, so abuse is bounded by 1 vote per IP per
    // feature even if rate-limit accounting briefly fails.
    return true;
  }
}

export async function POST(req: Request) {
  let body: { id?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!VALID_IDS.has(id)) {
    return NextResponse.json({ ok: false, error: "invalid_id" }, { status: 400 });
  }

  const r = getRedis();
  if (!r) {
    // Fail closed on Redis unavailable per spec — return 503, don't
    // block other voters (the client surfaces this as a transient
    // error). Without Redis we have no atomic counter or dedupe set,
    // so accepting the vote would silently drop it.
    return NextResponse.json({ ok: false, error: "redis_unavailable" }, { status: 503 });
  }

  // Trust Vercel's canonical `x-real-ip` first. Fall back to the
  // leftmost x-forwarded-for ONLY on Vercel — see /api/subscribe for the
  // longer rationale. Off-Vercel, `xff` is client-spoofable.
  const realIp = req.headers.get("x-real-ip")?.trim();
  const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const onVercel = !!process.env.VERCEL;
  const ip = realIp || (onVercel ? xff : undefined) || "unknown";

  const allowed = await checkRateLimit(r, ip);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const voteKey = `roadmap:vote:${id}`;
  const dedupeKey = `roadmap:voted:${id}:set`;

  try {
    // SADD returns 1 if the member was new, 0 if it was already in the
    // set. We gate the INCR on that: an IP can vote for the same
    // feature exactly once. Different features → different sets → can
    // vote for each (subject to the hourly rate limit).
    const added = await r.sadd(dedupeKey, ip);
    if (added === 0) {
      // Already voted from this IP. Return the current count so the
      // client can update its UI without requiring a separate fetch.
      const count = Number((await r.get<number>(voteKey)) ?? 0);
      return NextResponse.json(
        { ok: false, error: "already_voted", count },
        { status: 409 },
      );
    }
    const count = await r.incr(voteKey);
    return NextResponse.json({ ok: true, count });
  } catch (e) {
    console.error("roadmap_vote_redis_failed", e);
    return NextResponse.json({ ok: false, error: "redis_failed" }, { status: 503 });
  }
}
