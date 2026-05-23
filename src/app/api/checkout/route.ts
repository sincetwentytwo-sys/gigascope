import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const PLANS = {
  monthly: {
    name: "GIGASCOPE Charter — Monthly (Early Bird)",
    priceCents: 900,
    interval: "month" as const,
  },
  annual: {
    name: "GIGASCOPE Charter — Annual (Early Bird)",
    priceCents: 9900,
    interval: "year" as const,
  },
};

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "stripe_not_configured", message: "Set STRIPE_SECRET_KEY in Vercel env vars." },
      { status: 503 },
    );
  }

  let body: { plan?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const planKey = typeof body.plan === "string" && body.plan in PLANS ? (body.plan as keyof typeof PLANS) : "monthly";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const plan = PLANS[planKey];

  const origin = new URL(req.url).origin;
  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" as Stripe.LatestApiVersion });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: plan.name, description: "Charter pricing — early-bird locked for life. Cancel anytime." },
            unit_amount: plan.priceCents,
            recurring: { interval: plan.interval },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro`,
      allow_promotion_codes: true,
      metadata: { plan: planKey, source: "pro-page" },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ ok: false, error: "stripe_failed", message: msg }, { status: 500 });
  }
}
