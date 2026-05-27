import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { isCronAuthorized } from "@/lib/cronAuth";

export const runtime = "nodejs";
export const maxDuration = 60;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const authorized = isCronAuthorized;

const CACHE_TTL_SECONDS = 48 * 60 * 60; // 48h — cron runs daily, double TTL for safety

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }
  let count: number | null = null;
  let httpStatus: number | null = null;
  let bytes = 0;
  try {
    const res = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json",
      {
        cache: "no-store",
        headers: { "User-Agent": "GIGASCOPE/1.0 (+https://gigascope.xyz)" },
      }
    );
    httpStatus = res.status;
    if (res.ok) {
      const txt = await res.text();
      bytes = txt.length;
      try {
        const json = JSON.parse(txt);
        if (Array.isArray(json) && json.length > 0) {
          count = json.length;
        }
      } catch {
        // ignore parse error — count stays null
      }
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "fetch_failed", message: String(e).slice(0, 120) },
      { status: 502 }
    );
  }
  if (count === null) {
    // Celestrak returned non-OK or unparseable — leave Upstash alone, report status
    return NextResponse.json({ ok: false, error: "no_count", httpStatus, bytes });
  }
  await r.set("starlink:count", count, { ex: CACHE_TTL_SECONDS });
  await r.set("starlink:count:ts", Date.now(), { ex: CACHE_TTL_SECONDS });
  return NextResponse.json({ ok: true, count, httpStatus, bytes, ts: Date.now() });
}

export async function GET(req: Request) {
  return POST(req);
}
