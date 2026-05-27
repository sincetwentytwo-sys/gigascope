// Unit tests for the drip windowing predicate. The drip cron route was
// previously untested at the route level — extracting this predicate is the
// minimum surface needed to lock in the catch-up semantics so a future
// refactor can't silently change "[day, day+7)" to "[day, day+7]" or
// "[day-1, day+7)" without a failing test.
//
// Structure: 1 happy + 3 edge + 2 failure + 2 invariants. Same shape as
// x-queue.test.ts.

import { describe, it, expect } from "vitest";
import { isDripEligible } from "./drips";

describe("isDripEligible", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: ageDays exactly equals dripDay — eligible (lower bound inclusive)", () => {
    // The most common production case: subscriber signed up exactly 3 days
    // ago at the same time of day as the cron run. ageDays === 3.0 exactly.
    expect(isDripEligible(3, 3)).toBe(true);
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: ageDays = day + 0.5 — eligible (catch-up still active half a day in)", () => {
    // Cron drift means a subscriber whose signup-time-of-day differs from
    // the cron-time-of-day will routinely be at fractional ageDays. D+3.5
    // is still inside [3, 10).
    expect(isDripEligible(3.5, 3)).toBe(true);
  });

  it("edge: ageDays = day + 6.99 — eligible (last possible moment inside the 7-day window)", () => {
    // Just shy of the exclusive upper bound. This is the "delayed-cron
    // catch-up" sweet spot — infra was down for 6 days, subscriber finally
    // receives D+3 right before the window closes.
    expect(isDripEligible(3 + 6.99, 3)).toBe(true);
  });

  it("edge: ageDays = day + 7 exactly — NOT eligible (upper bound exclusive)", () => {
    // The interval is half-open by design. At ageDays === 10 exactly the
    // D+3 drip is officially "expired". If we had `<=` instead of `<` here,
    // a perfectly-timed cron a week later would re-fire (assuming SET-NX
    // somehow lost the flag, which would be a separate bug).
    expect(isDripEligible(10, 3)).toBe(false);
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: negative ageDays — NOT eligible (clock skew / bad subscriber ts defense)", () => {
    // Shouldn't ever happen — subscriber `ts` is set at signup and lives in
    // the past — but a corrupted ts (manual Redis edit, time-travel test,
    // clock skew on a self-host) could yield negative. Better to skip than
    // to fire D+3 on a subscriber who hasn't signed up yet.
    expect(isDripEligible(-0.1, 3)).toBe(false);
    expect(isDripEligible(-100, 3)).toBe(false);
  });

  it("failure: NaN or Infinity inputs — NOT eligible (defense against parse-failure ts)", () => {
    // The call site parses `ts` via `Number(...)`; a malformed Redis hash
    // value would yield NaN. Skip-on-bad-input keeps the cron healthy.
    expect(isDripEligible(NaN, 3)).toBe(false);
    expect(isDripEligible(3, NaN)).toBe(false);
    expect(isDripEligible(Infinity, 3)).toBe(false);
    expect(isDripEligible(3, Infinity)).toBe(false);
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: window width is exactly 7 days for every dripDay 3/7/14/21/30 (matches DRIPS table in /api/drips/send)", () => {
    // Production drip days. For each one, the window must span exactly 7
    // (lower inclusive, upper exclusive). Sample 4 points per window to
    // confirm shape: lower, mid, just-inside-upper, exact-upper.
    for (const day of [3, 7, 14, 21, 30]) {
      expect(isDripEligible(day, day), `day ${day} lower inclusive`).toBe(true);
      expect(isDripEligible(day + 3.5, day), `day ${day} mid`).toBe(true);
      expect(isDripEligible(day + 6.999, day), `day ${day} just below upper`).toBe(true);
      expect(isDripEligible(day + 7, day), `day ${day} upper exclusive`).toBe(false);
    }
  });

  it("invariant: ageDays well below dripDay — never eligible (no past-firing of future drips)", () => {
    // A 1-day-old subscriber must NEVER receive the D+30 drip. This is the
    // category of bug that would cost real Resend $ and look spammy to the
    // recipient, so it's worth an explicit test.
    expect(isDripEligible(1, 30)).toBe(false);
    expect(isDripEligible(0, 3)).toBe(false);
    expect(isDripEligible(2.99, 3)).toBe(false);
  });
});
