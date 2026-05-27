// Unit tests for /lib/rss `timeAgo` — the relative-time formatter used by
// every news surface (homepage NewsFeed, /site/[slug] FactoryNewsFeed,
// /feed.xml metadata).
//
// Structure: 1 happy path · 3 edge cases · 2 failure cases · 2 invariants.
// vi.useFakeTimers pins "now" so the buckets land on deterministic values
// regardless of when the test is run on CI.

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timeAgo } from "./rss";

const NOW = new Date("2026-05-27T12:00:00Z").getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("timeAgo", () => {
  // ── Happy path (1) ──────────────────────────────────────────────────
  it("happy: 5 minutes ago renders as '5m ago'", () => {
    const fiveMinAgo = NOW - 5 * 60_000;
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  // ── Edge cases (3) ──────────────────────────────────────────────────
  it("edge: <60s ago renders as 'just now' (sub-minute floor)", () => {
    // 30 seconds ago → Math.round(30000/60000) = 1, NOT < 1, so falls to
    // the "Xm ago" branch as "1m ago". 10 seconds ago → 0 → "just now".
    expect(timeAgo(NOW - 10_000)).toBe("just now");
    expect(timeAgo(NOW)).toBe("just now");
  });

  it("edge: hour and day bucket boundaries (60m → 1h, 24h → 1d)", () => {
    expect(timeAgo(NOW - 59 * 60_000)).toBe("59m ago");
    expect(timeAgo(NOW - 60 * 60_000)).toBe("1h ago");
    expect(timeAgo(NOW - 23 * 3_600_000)).toBe("23h ago");
    expect(timeAgo(NOW - 24 * 3_600_000)).toBe("1d ago");
  });

  it("edge: ≥7 days falls back to an absolute 'Mon D' date", () => {
    const eightDaysAgo = NOW - 8 * 86_400_000;
    // 2026-05-19 in en-US "month: short, day: numeric" formatting
    expect(timeAgo(eightDaysAgo)).toBe("May 19");
  });

  // ── Failure cases (2) ───────────────────────────────────────────────
  it("failure: timestamp === 0 returns '' (sentinel — RSS fallback when pubDate is missing)", () => {
    // The RSS parser uses `timestamp: 0` as the "no pubDate" sentinel. timeAgo
    // must not render "55 years ago" for that — it returns empty so callers
    // can omit the date chip entirely.
    expect(timeAgo(0)).toBe("");
  });

  it("failure: unparseable input returns '' without throwing", () => {
    expect(timeAgo("not-a-date")).toBe("");
    // @ts-expect-error — intentionally exercising the runtime guard
    expect(timeAgo(undefined)).toBe("");
    expect(timeAgo(NaN)).toBe("");
  });

  // ── Invariants ──────────────────────────────────────────────────────
  it("invariant: accepts string / number / Date inputs interchangeably for the same instant", () => {
    const tenMinAgoMs = NOW - 10 * 60_000;
    const tenMinAgoIso = new Date(tenMinAgoMs).toISOString();
    const tenMinAgoDate = new Date(tenMinAgoMs);
    const expected = timeAgo(tenMinAgoMs);
    expect(timeAgo(tenMinAgoIso)).toBe(expected);
    expect(timeAgo(tenMinAgoDate)).toBe(expected);
  });

  it("invariant: future timestamps don't crash — they render as 'just now' (negative diff floors to 0)", () => {
    // A clock-drifted feed could ship a pubDate slightly in the future. The
    // function must not return "-5m ago" or similar nonsense.
    const fiveMinFuture = NOW + 5 * 60_000;
    const out = timeAgo(fiveMinFuture);
    expect(out === "just now" || out === "0m ago").toBe(true);
    expect(out).not.toMatch(/-/);
  });
});
