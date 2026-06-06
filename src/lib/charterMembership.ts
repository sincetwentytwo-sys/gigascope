// Charter-membership fulfillment — the single source of truth for turning a
// verified payment into paid/charter state, and for the recipient list that
// charter-only emails fan out to.
//
// Both payment webhooks (Stripe scaffold + the live Lemon Squeezy webhook)
// call `activateCharterMember` / `revokeCharterMember` so the Redis schema
// stays identical regardless of provider. Charter-only crons (weekly-recap,
// satellite-check, catalyst-alerts) call `getCharterRecipients` so delivery
// is gated to actual payers — the marketing on /pro promises free users do
// NOT get those, and this is what enforces it.
//
// Redis keys touched:
//   subscribers:emails          SET   — every signup (free + paid); digest list
//   subscribers:charter         SET   — ACTIVE paying charter members; the
//                                       delivery gate for charter-only emails.
//                                       srem'd on cancellation/expiry.
//   subscriber:<email>          HASH  — per-subscriber record (tier, flags, ids)
//   subscribers:timeline        ZSET  — signup/payment timeline
//   subscribers:charter:count   INT   — high-water mark of charter spots ever
//                                       claimed. NEVER decremented (the "first
//                                       100 spots" cap is lifetime, not active
//                                       count). Drives the /pro scarcity badge.

import type { Redis } from "@upstash/redis";

export interface CharterActivation {
  email: string;
  plan: "monthly" | "annual";
  /** "stripe" | "lemonsqueezy" — recorded for support/debugging. */
  source: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  lsCustomerId?: string | null;
  lsSubscriptionId?: string | null;
}

/**
 * Upgrade a subscriber to active charter (paid) status. Mirrors the schema
 * /api/subscribe writes, so one hash holds both waitlist + paid state.
 *
 * Idempotent: re-running for the same active member re-sets the same fields
 * and does NOT double-count the high-water-mark. We use the return value of
 * `sadd subscribers:charter` (1 = newly added, 0 = already present) as the
 * first-activation guard, so webhook retries / subscription_payment_success
 * re-fires don't inflate the counter.
 *
 * Returns true if this was a brand-new activation (caller may then send a
 * welcome email), false if the member was already active.
 */
export async function activateCharterMember(
  r: Redis,
  a: CharterActivation,
): Promise<boolean> {
  const email = a.email.trim().toLowerCase();
  if (!email) return false;

  // sadd returns the count of newly-added members: 1 = first time, 0 = already
  // in the active charter set. This is our idempotency signal.
  const added = await r.sadd("subscribers:charter", email);
  const isNew = added === 1;

  const now = Date.now();
  const record: Record<string, unknown> = {
    email,
    tier: "pro",
    charterMember: true,
    plan: a.plan,
    paySource: a.source,
    paidAt: now,
  };
  if (a.stripeCustomerId !== undefined) record.stripeCustomerId = a.stripeCustomerId;
  if (a.stripeSubscriptionId !== undefined) record.stripeSubscriptionId = a.stripeSubscriptionId;
  if (a.lsCustomerId !== undefined) record.lsCustomerId = a.lsCustomerId;
  if (a.lsSubscriptionId !== undefined) record.lsSubscriptionId = a.lsSubscriptionId;

  await r.sadd("subscribers:emails", email);
  await r.hset(`subscriber:${email}`, record);
  await r.zadd("subscribers:timeline", { score: now, member: email });

  if (isNew) {
    // High-water mark — never decremented. "X of 100 charter spots claimed".
    await r.incr("subscribers:charter:count");
  }
  return isNew;
}

/**
 * Revoke active charter status on cancellation/expiry. Removes the member from
 * the active charter set (so charter-only emails stop) and flips the flag, but
 * leaves `subscribers:emails` (they keep the free digest) and the HWM counter
 * intact — forfeiting charter frees no spot; the 100-cap is lifetime.
 */
export async function revokeCharterMember(r: Redis, email: string): Promise<void> {
  const e = email.trim().toLowerCase();
  if (!e) return;
  await r.srem("subscribers:charter", e);
  await r.hset(`subscriber:${e}`, {
    charterMember: false,
    canceledAt: Date.now(),
  });
}

/**
 * The recipient list for charter-only fan-out emails (weekly recap,
 * satellite-drop alerts, catalyst alerts). Reads the active-charter set
 * maintained by the payment webhooks. Returns [] if the key is empty/cold —
 * which is correct: before any paid signup, charter-only emails go to nobody.
 */
export async function getCharterRecipients(r: Redis): Promise<string[]> {
  const list = await r.smembers("subscribers:charter");
  return Array.isArray(list) ? list : [];
}
