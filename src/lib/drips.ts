// Drip campaign windowing predicate, extracted for unit-testability.
//
// The drip cron iterates every subscriber × every drip definition and decides
// "should this email go out today?" The predicate is purely a function of
// (subscriber age in days, drip target day). The 7-day catch-up window exists
// so a delayed cron run (incident, deploy, infra outage) doesn't permanently
// miss a drip — the SET-NX flag at the call site guarantees no double-send
// even if the window overlaps multiple cron invocations.

/**
 * Is a subscriber eligible to receive drip `dripDay` based on their account
 * age in days?
 *
 * Window is half-open: `[dripDay, dripDay + 7)`. That is:
 *   - inclusive of `dripDay` itself (a brand-new subscriber on D+3 morning
 *     gets D+3),
 *   - exclusive of `dripDay + 7` (a subscriber whose ageDays just crossed
 *     dripDay+7 has already had 7 daily cron runs to receive it; the SET-NX
 *     flag is the actual dedup, this window just bounds catch-up reach).
 *
 * Edge cases handled explicitly:
 *   - Negative `ageDays` — should not happen in practice (subscriber `ts`
 *     timestamp is in the past), but defend against clock skew / bad data.
 *     Returns false; we never send drips to "future" subscribers.
 *   - Fractional `ageDays` — totally normal (the call site divides ms by
 *     86_400_000 without flooring). At ageDays=3.0 exactly we ARE eligible
 *     for D+3; at ageDays=9.999... we are eligible for D+3 (still inside
 *     [3, 10)) but at ageDays=10.0 we are not.
 */
export function isDripEligible(ageDays: number, dripDay: number): boolean {
  // Guards: NaN propagates through comparisons as false (correct outcome —
  // skip the drip rather than fire on garbage data).
  if (!Number.isFinite(ageDays) || !Number.isFinite(dripDay)) return false;
  if (ageDays < 0) return false;
  return ageDays >= dripDay && ageDays < dripDay + 7;
}
