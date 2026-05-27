import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome";
import { unsubHeaders } from "@/lib/unsubscribe";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

async function sendWelcome(email: string, tier: "free" | "pro" | "terminal"): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const subject =
    tier === "free"
      ? "You're on the GIGASCOPE daily digest"
      : "You're a charter member — $9/mo locked for life";
  try {
    await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to: email,
      subject,
      react: WelcomeEmail({ email, tier }),
      headers: unsubHeaders(email),
    });
    return true;
  } catch (e) {
    console.error("resend_send_failed", e);
    return false;
  }
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limit: max 5 calls/hour per IP. Each accepted subscribe call costs
// Resend quota + can land us on spam blocklists, so a scanner that floods
// /api/subscribe is real $$$ + reputational damage. Upstash `INCR` is
// atomic so the count is race-safe across concurrent requests.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SEC = 3600;

async function checkRateLimit(r: Redis, ip: string): Promise<boolean> {
  const key = `ratelimit:subscribe:${ip}`;
  try {
    const count = await r.incr(key);
    // Set TTL only on the first call in the window — subsequent INCRs leave
    // the TTL alone, so the window slides forward exactly 1 hour from the
    // first request, not from the most recent one.
    if (count === 1) {
      await r.expire(key, RATE_LIMIT_WINDOW_SEC);
    }
    return count <= RATE_LIMIT_MAX;
  } catch {
    // Fail open on Redis errors — don't block legit signups if Upstash
    // hiccups. The store-side `sadd` will fail too if Redis is truly down,
    // so we won't double-process.
    return true;
  }
}

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
  const typedTier = tier as "free" | "pro" | "terminal";

  // IP-keyed rate limiting. Trust Vercel's canonical `x-real-ip` header first
  // (set by the Vercel CDN, not forwardable from a client). Fall back to the
  // leftmost x-forwarded-for value only when x-real-ip is absent — and only
  // accept x-forwarded-for at all on Vercel, where the CDN guarantees the
  // first value is the real client IP. On any other host we fall through to
  // "unknown", which buckets everyone into one rate-limit slot rather than
  // letting a client spoof its way into infinite individual buckets.
  if (r) {
    const realIp = req.headers.get("x-real-ip")?.trim();
    const xff = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const onVercel = !!process.env.VERCEL;
    const ip = realIp || (onVercel ? xff : undefined) || "unknown";
    const allowed = await checkRateLimit(r, ip);
    if (!allowed) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
  }

  if (!r) {
    // Without Redis, still accept (useful for local dev). The user can plumb
    // KV credentials in Vercel without breaking the API contract.
    const emailed = await sendWelcome(email, typedTier);
    return NextResponse.json({ ok: true, stored: false, emailed, note: "no_redis_configured" });
  }

  const record = { email, tier, source, ts: Date.now() };
  try {
    await r.sadd("subscribers:emails", email);
    await r.hset(`subscriber:${email}`, record);
    await r.zadd("subscribers:timeline", { score: record.ts, member: email });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "redis_failed" }, { status: 500 });
  }

  // Welcome email is best-effort: never fail the subscribe over it.
  const emailed = await sendWelcome(email, typedTier);
  return NextResponse.json({ ok: true, stored: true, emailed });
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
