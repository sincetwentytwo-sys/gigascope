// Unit tests for x-queue date math + draft lookup.
//
// Covers the pure functions only — sending logic in the cron route still
// has zero test coverage and that's a known gap (logged in code review).

import { describe, it, expect } from "vitest";
import { dayForToday, getDraft, X_QUEUE_WEEK_1 } from "./x-queue";

const DAY_MS = 86_400_000;

function utcMidnight(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

describe("x-queue", () => {
  // ─────────────────────────────────────────────────────────────
  // Happy path (1)
  // ─────────────────────────────────────────────────────────────
  it("dayForToday returns 1 on launch day, and getDraft(1) returns a fully-shaped Day 1 draft", () => {
    const start = utcMidnight(2026, 5, 26);
    expect(dayForToday(start, start)).toBe(1);

    const d1 = getDraft(1);
    expect(d1).not.toBeNull();
    expect(d1!.day).toBe(1);
    expect(d1!.text.length).toBeGreaterThan(0);
    expect(d1!.replyText.length).toBeGreaterThan(0);
    expect(d1!.mediaHint.length).toBeGreaterThan(0);
    // Day 1 specifically has a pre-prepared mp4 + thumbnail
    expect(d1!.mediaUrl).toMatch(/^https:\/\/gigascope\.xyz\//);
    expect(d1!.previewImageUrl).toMatch(/\.jpg$/);
  });

  // ─────────────────────────────────────────────────────────────
  // Edge cases (3)
  // ─────────────────────────────────────────────────────────────
  it("edge: Day 7 (last day of Week 1) — returns 7, draft exists", () => {
    const start = utcMidnight(2026, 5, 26);
    const day7 = start + 6 * DAY_MS;
    expect(dayForToday(start, day7)).toBe(7);
    expect(getDraft(7)).not.toBeNull();
    expect(getDraft(7)!.day).toBe(7);
  });

  it("edge: Day 8 (one day past Week 1) — returns null (queue exhausted)", () => {
    const start = utcMidnight(2026, 5, 26);
    const day8 = start + 7 * DAY_MS;
    expect(dayForToday(start, day8)).toBeNull();
  });

  it("edge: 1 day before launch — returns null (cron should not fire yet)", () => {
    const start = utcMidnight(2026, 5, 26);
    const dayMinus1 = start - DAY_MS;
    expect(dayForToday(start, dayMinus1)).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // Failure cases (2)
  // ─────────────────────────────────────────────────────────────
  it("failure: getDraft(0) — invalid day index, returns null", () => {
    expect(getDraft(0)).toBeNull();
  });

  it("failure: getDraft(99) — out-of-range day, returns null", () => {
    expect(getDraft(99)).toBeNull();
  });

  // ─────────────────────────────────────────────────────────────
  // Sanity check: queue invariants
  // ─────────────────────────────────────────────────────────────
  it("queue invariant: exactly 7 entries, days 1..7, no duplicates", () => {
    expect(X_QUEUE_WEEK_1).toHaveLength(7);
    const days = X_QUEUE_WEEK_1.map((d) => d.day);
    expect(days).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("queue invariant: every entry has non-empty text + replyText + mediaHint", () => {
    for (const d of X_QUEUE_WEEK_1) {
      expect(d.text.length, `day ${d.day} text empty`).toBeGreaterThan(0);
      expect(d.replyText.length, `day ${d.day} replyText empty`).toBeGreaterThan(0);
      expect(d.mediaHint.length, `day ${d.day} mediaHint empty`).toBeGreaterThan(0);
    }
  });
});
