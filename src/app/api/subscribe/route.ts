import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: unknown; tier?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const tier = typeof body.tier === "string" ? body.tier : "free";
  const source = typeof body.source === "string" ? body.source.slice(0, 80) : "unknown";

  if (!EMAIL_RX.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!["free", "pro", "terminal"].includes(tier)) {
    return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
  }

  const r = getRedis();
  if (!r) {
    // Without Redis, still accept (useful for local dev). The user can plumb
    // KV credentials in Vercel without breaking the API contract.
    return NextResponse.json({ ok: true, stored: false, note: "no_redis_configured" });
  }

  const record = { email, tier, source, ts: Date.now() };
  try {
    await r.sadd("subscribers:emails", email);
    await r.hset(`subscriber:${email}`, record);
    await r.zadd("subscribers:timeline", { score: record.ts, member: email });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "redis_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored: true });
}

export async function GET() {
  const r = getRedis();
  if (!r) return NextResponse.json({ count: 0, configured: false });
  try {
    const count = await r.scard("subscribers:emails");
    return NextResponse.json({ count, configured: true });
  } catch {
    return NextResponse.json({ count: 0, configured: true, error: "redis_failed" });
  }
}
