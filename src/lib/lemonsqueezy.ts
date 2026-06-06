// Lemon Squeezy webhook helpers — signature verification + payload parsing.
//
// Lemon Squeezy is the live Merchant-of-Record payment path for GIGASCOPE
// (the Stripe scaffold is dormant). When a customer completes the hosted
// checkout, LS POSTs a webhook to /api/webhooks/lemonsqueezy. LS signs the
// RAW request body with HMAC-SHA256 using the webhook's signing secret and
// sends it hex-encoded in the `X-Signature` header.
//
// These helpers are pure (no Redis, no network) so they unit-test cleanly.

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal shape of the LS webhook payloads we consume. LS sends far more than
 * this; we only type the fields we read. `meta.event_name` selects the handler;
 * `data.attributes.user_email` is the buyer; `data.id` is the subscription id.
 */
export interface LemonWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: Record<string, unknown>;
  };
  data?: {
    id?: string;
    attributes?: {
      user_email?: string;
      user_name?: string;
      variant_name?: string;
      product_name?: string;
      customer_id?: number | string;
      status?: string;
      /** LS marks test-mode objects so we can skip them in production. */
      test_mode?: boolean;
    };
  };
}

/** True when the LS payload is a test-mode object (test card / test store). */
export function isTestModePayload(payload: LemonWebhookPayload): boolean {
  return payload?.data?.attributes?.test_mode === true;
}

/**
 * Verify a Lemon Squeezy webhook signature in constant time.
 *
 * `signature` is the hex string from the `X-Signature` header. We recompute
 * HMAC-SHA256(rawBody, secret) and compare. Returns false on any mismatch,
 * missing input, or malformed hex — never throws.
 */
export function verifyLemonSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string | null | undefined,
): boolean {
  if (!signature || !secret || typeof rawBody !== "string") return false;
  const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expectedHex, "hex");
  let b: Buffer;
  try {
    b = Buffer.from(signature, "hex");
  } catch {
    return false;
  }
  // timingSafeEqual throws on length mismatch — guard first (the length check
  // itself is not secret-dependent, so an early return here leaks nothing).
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Map an LS variant/product name to our internal plan enum. Best-effort:
 * anything that reads annual/yearly → "annual", otherwise "monthly".
 */
export function planFromVariantName(
  name: string | null | undefined,
): "monthly" | "annual" {
  if (name && /annual|yearly|year|\byr\b/i.test(name)) return "annual";
  return "monthly";
}

/**
 * Extract + normalize the buyer email from an LS webhook payload.
 * Returns null if absent or not an email-shaped string.
 */
export function emailFromLemonPayload(payload: LemonWebhookPayload): string | null {
  const e = payload?.data?.attributes?.user_email;
  if (typeof e !== "string") return null;
  const norm = e.trim().toLowerCase();
  return norm.includes("@") ? norm : null;
}
