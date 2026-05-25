import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

/**
 * Force-purge of the og:image scrape cache. Used when:
 *   - A publisher just added og:image to articles that previously had none
 *     (and the negative cache is still holding "none").
 *   - A WAF / hotlink-defense rule on a source was relaxed, so previously
 *     blocked images are now fetchable.
 *   - News thumbnails on /news / / look visibly broken and the owner wants
 *     an instant retry rather than waiting for the 2h negative-cache TTL.
 *
 * Safe to call repeatedly: deletes `og:image:*` keys via SCAN+UNLINK in
 * batches. Next ISR render of /news (or any page that calls fetchAllNews)
 * re-scrapes for items with no image. CRON_SECRET-gated, same convention
 * as digest/drips/catalyst-alerts/permit-check.
 *
 * Not wired into vercel.json — manual trigger only.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://gigascope.xyz/api/cron/refresh-og
 */

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  const got = req.headers.get("authorization");
  if (!got) return false;
  return got === `Bearer ${expected}` || got === expected;
}

async function handler(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ error: "redis_not_configured" }, { status: 503 });
  }

  // Optional: ?onlyNegative=1 to delete just "none"-cached entries (keep good
  // hits). Default deletes the lot, which is the more common manual-fix case.
  const url = new URL(req.url);
  const onlyNegative = url.searchParams.get("onlyNegative") === "1";

  let cursor: string | number = 0;
  let scanned = 0;
  let deleted = 0;
  const BATCH = 200;

  // Upstash SCAN returns [cursor, keys[]] per call. Keep going until cursor 0.
  do {
    const [next, keys] = (await r.scan(cursor, {
      match: "og:image:*",
      count: BATCH,
    })) as [string | number, string[]];
    cursor = next;
    scanned += keys.length;
    if (keys.length === 0) continue;

    let toDelete = keys;
    if (onlyNegative) {
      const values = (await r.mget<Array<string | null>>(...keys)) ?? [];
      toDelete = keys.filter((_, i) => values[i] === "none");
    }
    if (toDelete.length > 0) {
      // UNLINK is non-blocking equivalent of DEL — Upstash supports it.
      // Falls back to DEL if UNLINK isn't available on the plan.
      try {
        await r.del(...toDelete);
      } catch (e) {
        return NextResponse.json(
          { error: "del_failed", message: (e as Error).message },
          { status: 500 },
        );
      }
      deleted += toDelete.length;
    }
  } while (cursor !== 0 && cursor !== "0");

  return NextResponse.json({
    ok: true,
    scanned,
    deleted,
    onlyNegative,
    note: "Next /news render will re-scrape og:image for items missing thumbnails. Allow ~30min (ISR revalidate) for changes to appear, or hit the page directly.",
  });
}

export const GET = handler;
export const POST = handler;
