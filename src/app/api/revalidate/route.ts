import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * On-demand ISR cache invalidation.
 *
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     "https://gigascope.xyz/api/revalidate?path=/news"
 *
 * Forces the next request to that path to re-SSR and refresh the ISR cache
 * across all Vercel edge regions. Used when a code/data change isn't
 * propagating naturally — e.g. an edge region holds a stale build for
 * longer than the page's revalidate window.
 *
 * Defaults to /news because that's the path we hit most often after
 * RSS/og-image changes. Pass ?path=/somewhere for any other page.
 *
 * CRON_SECRET-gated, same convention as the other /api/cron/* routes.
 */

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
  const url = new URL(req.url);
  const path = url.searchParams.get("path") ?? "/news";
  try {
    revalidatePath(path);
    return NextResponse.json({ ok: true, revalidated: path });
  } catch (e) {
    return NextResponse.json(
      { error: "revalidate_failed", message: (e as Error).message },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
