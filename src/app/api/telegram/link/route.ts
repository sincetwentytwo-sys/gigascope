import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { botStartUrl, encodeStartPayload, isTelegramConfigured } from "@/lib/telegram";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST { email } → { ok, url } where `url` is the t.me deep-link the user
 * clicks to bind their chat to this email. Requires the email to already
 * exist in `subscribers:emails` (no enumeration: same 404 for missing-and-
 * malformed cases keeps the response indistinguishable to a scanner).
 */
export async function POST(req: Request) {
  if (!isTelegramConfigured()) {
    // Graceful-degrade — keeps the API contract clean even before the bot
    // exists. UI can hide the button when this returns 503.
    return NextResponse.json(
      { ok: false, error: "telegram_not_configured" },
      { status: 503 },
    );
  }

  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RX.test(email) || email.length > 320) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  const isMember = await r.sismember("subscribers:emails", email);
  if (!isMember) {
    // Same status code as a malformed email — don't leak which addresses
    // are subscribed.
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const payload = encodeStartPayload(email);
  const url = botStartUrl(payload);

  return NextResponse.json({ ok: true, url });
}
