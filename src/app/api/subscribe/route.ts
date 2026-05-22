import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/welcome";

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

// TODO: add HTTPS one-click unsub at /api/unsubscribe?email=X&token=Y, then add second URL form + List-Unsubscribe-Post header.
const UNSUB_HEADERS = {
  "List-Unsubscribe": "<mailto:unsubscribe@gigascope.xyz?subject=unsubscribe>",
};

async function sendWelcome(email: string, tier: "free" | "pro" | "terminal"): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const subject =
    tier === "free"
      ? "You're on the GIGASCOPE daily digest"
      : "You're a charter Investor — $9/mo locked for life";
  try {
    await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to: email,
      subject,
      react: WelcomeEmail({ email, tier }),
      headers: UNSUB_HEADERS,
    });
    return true;
  } catch (e) {
    console.error("resend_send_failed", e);
    return false;
  }
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
  const typedTier = tier as "free" | "pro" | "terminal";

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
