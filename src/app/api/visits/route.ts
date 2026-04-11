import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function todayKey(): string {
  // UTC date (YYYY-MM-DD)
  return new Date().toISOString().slice(0, 10);
}

// Hash IP + UA into a stable id to dedupe visitors within the day,
// without storing any PII.
function visitorId(ip: string, ua: string): string {
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex").slice(0, 16);
}

export async function GET(req: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ today: 0, total: 0, enabled: false });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const id = visitorId(ip, ua);
  const day = todayKey();

  const uniqKey = `visits:${day}:uniques`;
  const viewsKey = `visits:${day}:views`;
  const totalKey = `visits:total`;

  try {
    // Pipeline: register visitor, increment views, read counts
    const pipeline = redis.pipeline();
    pipeline.sadd(uniqKey, id);
    pipeline.expire(uniqKey, 60 * 60 * 48); // keep 48h then auto-clean
    pipeline.incr(viewsKey);
    pipeline.expire(viewsKey, 60 * 60 * 48);
    pipeline.incr(totalKey);
    pipeline.scard(uniqKey);
    pipeline.get(viewsKey);
    pipeline.get(totalKey);

    const results = (await pipeline.exec()) as unknown[];
    const todayUnique = Number(results[5] ?? 0);
    const todayViews = Number(results[6] ?? 0);
    const total = Number(results[7] ?? 0);

    return NextResponse.json({
      today: todayUnique,
      todayViews,
      total,
      enabled: true,
    });
  } catch (err) {
    console.error("Redis visits error:", err);
    return NextResponse.json({ today: 0, total: 0, enabled: false, error: true });
  }
}
