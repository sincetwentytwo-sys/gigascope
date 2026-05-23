// Stripe webhook receiver — preparatory scaffold.
//
// This route follows the same graceful-degrade pattern as `/api/checkout` and
// `/api/subscribe`: when `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` are
// unset, it returns 503 instead of throwing. The moment both env vars land in
// Vercel (after 사업자등록 / Stripe Korea approval), billing is live with no
// code change.
//
// Handled event types:
//   * `checkout.session.completed`     → mark subscriber as charter member,
//                                        increment the high-water-mark counter
//   * `customer.subscription.deleted`  → flip `charterMember: false` (DO NOT
//                                        decrement counter — "first 100 spots
//                                        taken" reflects the HWM, not actives)
//   * `customer.subscription.updated`  → best-effort plan/price refresh
//
// Response semantics (Stripe retries on non-2xx, so be careful):
//   * 200 OK          — event was processed (or intentionally skipped)
//   * 503 Service Unavailable — keys missing; Stripe will retry. Acceptable
//                       during the brief window before env vars are wired up.
//   * 400 Bad Request — bad/missing signature; Stripe will NOT retry these
//                       (correctly — they indicate a misconfig, not a transient
//                       failure)
//   * 500 Internal    — handler threw after signature passed; Stripe WILL retry

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Reverse-lookup an email by stripeCustomerId. The subscriber set is small
// (<1k charter members planned), so a linear scan is fine for now. If/when
// scale demands it, write a `stripeCustomer:<id> → email` index at checkout
// completion time.
async function findEmailByStripeCustomer(r: Redis, customerId: string): Promise<string | null> {
  const emails = await r.smembers("subscribers:emails");
  for (const e of emails) {
    const rec = await r.hget(`subscriber:${e}`, "stripeCustomerId");
    if (rec === customerId) return e;
  }
  return null;
}

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    // Graceful degrade — same pattern as /api/checkout. Stripe will retry,
    // which is fine: once the env vars land, the retried event lands too.
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 400 });
  }

  // Stripe requires the *raw* body bytes to verify the HMAC. App Router
  // hands us the request unparsed, so `req.text()` gives us the raw string.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 120) : "unknown";
    return NextResponse.json(
      { ok: false, error: "invalid_signature", detail: msg },
      { status: 400 },
    );
  }

  const r = getRedis();
  if (!r) {
    // No Redis = nowhere to persist. 503 so Stripe retries once KV is wired up.
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const rawEmail =
          session.customer_details?.email ?? session.customer_email ?? "";
        const email = rawEmail.trim().toLowerCase();
        if (!email) break; // can't index by customer without an email — skip
        const plan = (session.metadata?.plan ?? "monthly") as "monthly" | "annual";
        const stripeCustomerId =
          typeof session.customer === "string" ? session.customer : null;
        const stripeSubscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;

        // Mirror the schema used by /api/subscribe so a single hash holds both
        // waitlist + paid state. `tier: pro` upgrades the user from "free".
        await r.sadd("subscribers:emails", email);
        await r.hset(`subscriber:${email}`, {
          email,
          tier: "pro",
          charterMember: true,
          plan,
          stripeCustomerId,
          stripeSubscriptionId,
          paidAt: Date.now(),
        });
        await r.zadd("subscribers:timeline", { score: Date.now(), member: email });
        // High-water mark counter — never decremented. Drives the "X of 100
        // charter spots taken" badge on /investor.
        await r.incr("subscribers:charter:count");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customer = typeof sub.customer === "string" ? sub.customer : null;
        if (!customer) break;
        const email = await findEmailByStripeCustomer(r, customer);
        if (email) {
          await r.hset(`subscriber:${email}`, {
            charterMember: false,
            canceledAt: Date.now(),
          });
        }
        // Intentionally do NOT touch `subscribers:charter:count` — see header.
        break;
      }

      case "customer.subscription.updated": {
        // Plan switches (monthly ↔ annual, etc.). Best-effort: if we can map
        // the customer to a known email, record the new priceId + timestamp.
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (!priceId) break;
        const customer = typeof sub.customer === "string" ? sub.customer : null;
        if (!customer) break;
        const email = await findEmailByStripeCustomer(r, customer);
        if (email) {
          await r.hset(`subscriber:${email}`, {
            stripePriceId: priceId,
            updatedAt: Date.now(),
          });
        }
        break;
      }

      default:
        // Unhandled event type — Stripe sends many we don't care about
        // (invoice.*, payment_intent.*, etc.). Acknowledge with 200 so it
        // doesn't retry, but don't act on it.
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 120) : "unknown";
    // 500 → Stripe will retry. That's the right semantic for a transient
    // Redis failure (the event itself was valid).
    return NextResponse.json(
      { ok: false, error: "handler_failed", detail: msg },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, type: event.type });
}
