// Lemon Squeezy webhook receiver — the live Merchant-of-Record fulfillment
// path. Without this route, a completed $9 LS checkout collects real money but
// records NOTHING (no tier upgrade, no charter flag, no spot-counter bump, no
// welcome email). Do not flip LEMONSQUEEZY_CHECKOUT_URL on in production until
// this exists AND the webhook is registered in the LS dashboard with the
// matching signing secret.
//
// Setup (owner, in the LS dashboard → Settings → Webhooks):
//   * URL:    https://gigascope.xyz/api/webhooks/lemonsqueezy
//   * Secret: a random string, also set as LEMONSQUEEZY_WEBHOOK_SECRET in Vercel
//   * Events: subscription_created, subscription_payment_success,
//             subscription_updated, subscription_cancelled, subscription_expired,
//             subscription_paused
//
// Response semantics (LS retries on non-2xx):
//   * 200 — processed or intentionally skipped
//   * 401 — bad/missing signature (misconfig; LS retries, harmless until secret set)
//   * 503 — secret or Redis not configured (graceful, like the Stripe scaffold)
//   * 500 — handler threw after signature passed (LS retries; correct for a
//           transient Redis failure on an otherwise-valid event)

import { NextResponse, after } from "next/server";
import { Redis } from "@upstash/redis";
import {
  verifyLemonSignature,
  planFromVariantName,
  emailFromLemonPayload,
  isTestModePayload,
  type LemonWebhookPayload,
} from "@/lib/lemonsqueezy";
import {
  activateCharterMember,
  revokeCharterMember,
} from "@/lib/charterMembership";
import { sendWelcomeEmail } from "@/lib/welcomeEmail";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    // Graceful degrade — same posture as the Stripe scaffold. LS will retry,
    // which is fine: once the secret lands, the retried event lands too.
    return NextResponse.json(
      { ok: false, error: "lemonsqueezy_not_configured" },
      { status: 503 },
    );
  }

  // Signature is computed over the RAW body bytes — read text before parsing.
  const raw = await req.text();
  const signature = req.headers.get("x-signature");
  if (!verifyLemonSignature(raw, signature, secret)) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  let payload: LemonWebhookPayload;
  try {
    payload = JSON.parse(raw) as LemonWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  const email = emailFromLemonPayload(payload);

  // Test-mode events (LS test card / test store) must NOT touch production:
  // no charter record, no spot-counter bump, no welcome email. Signature is
  // already verified, so we ack 200 and skip — lets the owner click through
  // the test checkout freely without polluting the live "100 spots" counter.
  if (isTestModePayload(payload)) {
    return NextResponse.json({ ok: true, event: eventName, skipped: "test_mode" });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_payment_success":
      case "subscription_resumed":
      case "subscription_unpaused": {
        if (!email) break; // can't record a charter member without an email
        const attrs = payload.data?.attributes;
        const plan = planFromVariantName(attrs?.variant_name ?? attrs?.product_name);
        const isNew = await activateCharterMember(r, {
          email,
          plan,
          source: "lemonsqueezy",
          lsCustomerId:
            attrs?.customer_id != null ? String(attrs.customer_id) : null,
          lsSubscriptionId: payload.data?.id != null ? String(payload.data.id) : null,
        });
        // Welcome only on a genuinely new activation, so payment_success
        // re-fires / retries don't re-send it. Deferred so the webhook
        // responds 200 fast (LS keeps the function alive for `after`).
        if (isNew) {
          after(async () => {
            await sendWelcomeEmail(email, "pro", r);
          });
        }
        break;
      }

      case "subscription_cancelled": {
        // Cancellation in LS means "will not renew" — the member keeps access
        // until the period ends (subscription_expired). Record the intent but
        // do NOT revoke access yet.
        if (email) {
          await r.hset(`subscriber:${email}`, { cancelScheduledAt: Date.now() });
        }
        break;
      }

      case "subscription_expired":
      case "subscription_paused": {
        // Access actually ends here — drop them from the active charter set so
        // charter-only emails stop.
        if (email) await revokeCharterMember(r, email);
        break;
      }

      default:
        // Unhandled event — acknowledge with 200 so LS doesn't retry.
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message.slice(0, 120) : "unknown";
    return NextResponse.json(
      { ok: false, error: "handler_failed", detail: msg },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, event: eventName });
}
