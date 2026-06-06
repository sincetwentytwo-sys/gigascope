// Email send-volume metrics — minimum-viable shell.
//
// Goal: measure how many emails per type land per day, with zero impact on
// the send hot path. Open/click rates need Resend's webhook setup (not yet
// configured) — when wired, /api/webhooks/resend will increment the same
// `metric:open:<type>` and `metric:click:<type>` keys this module bumps.
//
// Two counters per send:
//   - metric:sent:<type>:total       — running lifetime count
//   - metric:sent:<type>:<YYYY-MM-DD> — per-UTC-day count (TTL 90d, so the
//                                       admin endpoint can show "last N days"
//                                       without unbounded key growth)
//
// All writes are wrapped in try/catch and async-fire-without-awaiting at the
// call site so a Redis hiccup never fails the email send. Drop-on-error is
// correct: under-counting is fine, blocking the user-facing send is not.

import type { Redis } from "@upstash/redis";

// 90 days is more than enough for any "last N days" view we'd want without
// paying for indefinite key growth. The :total counter has no TTL.
const DAY_KEY_TTL_SECONDS = 90 * 24 * 60 * 60;

/** Canonical email-type tags. Stored as values inside Resend `tags[].value`
 *  AND as the `<type>` segment of Redis metric keys, so they MUST stay
 *  lower-case, no spaces, and stable across deploys (renaming a tag would
 *  fragment the time series). */
export type EmailType =
  | "welcome"
  | "drip-d3"
  | "drip-d7"
  | "drip-d14"
  | "drip-d21"
  | "drip-d30"
  | "digest"
  | "catalyst-alert"
  | "permit-alert"
  | "weekly-recap"
  | "x-reminder";

/** UTC YYYY-MM-DD string for a given millisecond timestamp. */
export function utcDateKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

/**
 * Increment send counters for one successful Resend send. Never throws —
 * caller does not need to wrap in try/catch. The function is async because
 * Upstash REST calls are async; caller can choose to await or fire-and-forget.
 *
 * Returns a small status string so the call site can log it if debugging,
 * but the return value is purely diagnostic — it is safe to ignore.
 */
export async function recordEmailSent(
  r: Redis,
  type: EmailType,
  now: number = Date.now(),
): Promise<"ok" | "redis_error"> {
  try {
    const dateKey = utcDateKey(now);
    // Two INCRs + one EXPIRE. We don't need a transaction here — at worst,
    // a partial failure under-counts by one event, which is fine for a
    // dashboard-grade metric.
    await r.incr(`metric:sent:${type}:total`);
    const dayCount = await r.incr(`metric:sent:${type}:${dateKey}`);
    // Set the TTL only on the first increment of the day to keep the window
    // sliding 90 days from the FIRST event of that day, not the most recent.
    if (dayCount === 1) {
      await r.expire(`metric:sent:${type}:${dateKey}`, DAY_KEY_TTL_SECONDS);
    }
    return "ok";
  } catch {
    return "redis_error";
  }
}

/**
 * Build the `tags` array passed to `resend.emails.send({ tags })`. Resend
 * stores these on the message and (once webhooks are wired) echoes them back
 * on open/click events so we can attribute per-type rates.
 *
 * Keep the shape minimal — Resend caps tag VALUES at 256 chars and the
 * dashboard renders large tag sets poorly. One `type` tag is enough today.
 */
export function emailTags(type: EmailType): Array<{ name: string; value: string }> {
  return [{ name: "type", value: type }];
}
