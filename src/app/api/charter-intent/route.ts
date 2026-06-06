// Charter-intent fake-door — measures "I'd lock $9" demand WITHOUT charging.
//
// While billing is gated (waitlist mode), the /pro primary CTA records an
// intent click here instead of (or before) collecting the email. This is the
// instrument for the go/no-go kill-criteria: "did the fake-door draw 10-15+
// intent clicks from the warmest traffic?" — measured before flipping real
// billing on, per the validate-before-overhead stance.
//
// Keys:
//   charter:intent:count   INT  — total intent clicks (the headline metric)
//   charter:intent:emails  SET  — distinct emails that expressed intent (if given)
//
// GET returns the current counts so the owner can read the signal without a
// dashboard. POST records a click (+ optional email). Never charges anything.

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
  let email = "";
  try {
    const body = (await req.json()) as { email?: unknown };
    if (typeof body.email === "string") email = body.email.trim().toLowerCase();
  } catch {
    // body is optional — a bare click with no email is still a valid signal.
  }

  const r = getRedis();
  if (!r) {
    // No Redis (local dev) — accept so the UI flow still works.
    return NextResponse.json({ ok: true, stored: false });
  }

  try {
    const count = await r.incr("charter:intent:count");
    let distinct: number | null = null;
    if (email && EMAIL_RX.test(email) && email.length <= 320) {
      await r.sadd("charter:intent:emails", email);
      distinct = await r.scard("charter:intent:emails");
    }
    return NextResponse.json({ ok: true, stored: true, count, distinct });
  } catch {
    // Never fail the user-facing flow over a metric write.
    return NextResponse.json({ ok: true, stored: false });
  }
}

export async function GET() {
  const r = getRedis();
  if (!r) return NextResponse.json({ count: 0, distinct: 0, configured: false });
  try {
    const count = (await r.get<number>("charter:intent:count")) ?? 0;
    const distinct = await r.scard("charter:intent:emails");
    return NextResponse.json({ count, distinct, configured: true });
  } catch {
    return NextResponse.json({ count: 0, distinct: 0, configured: true, error: "redis_failed" });
  }
}
