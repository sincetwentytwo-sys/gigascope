// Unit tests for the weekly-recap aggregation helpers.
//
// Same structure as drips.test.ts and permits.test.ts:
//   1 happy + 3 edge + 2 failure + 2 invariants per testable surface, with
// pinned anchors for deterministic time math (no Date.now()).
//
// `getRecentAnalyses` reads `public/data/analyses.json` off disk, so the
// disk-backed tests anchor `now` to a timestamp that includes / excludes
// the live analyses in that file rather than mocking fs (which would
// break the "fs reads work end-to-end" guarantee the cron depends on).

import { describe, it, expect } from "vitest";
import type { Factory, Milestone, Company } from "@/data/types";
import { factories as liveFactories } from "@/data/factories";
import {
  getRecentlyDoneMilestones,
  getRecentAnalyses,
  getUpcomingCatalysts,
  isRecapMilestone,
  isRecapAnalysis,
  isRecapUpcoming,
} from "./weeklyRecap";

// Minimal Factory factory — all fields the helpers don't read get benign
// defaults so a test only has to declare what's relevant.
function mkFactory(overrides: Partial<Factory> = {}): Factory {
  return {
    id: "test-1",
    slug: "test-site",
    name: "Test Site",
    aka: "TS",
    flag: "🇺🇸",
    location: "Nowhere, USA",
    lat: 0,
    lng: 0,
    company: "tesla",
    status: "operational",
    progress: 50,
    area: "1M sqft",
    capacity: "n/a",
    products: "n/a",
    investment: "$1B",
    employees: "100",
    color: "#000000",
    lastUpdated: "2026-05-20",
    milestones: [],
    timeline: [0, 10, 20, 30, 40, 50, 50],
    ...overrides,
  };
}

function mkMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    date: "2026-05-20",
    text: "Some milestone",
    done: true,
    ...overrides,
  };
}

describe("getRecentlyDoneMilestones", () => {
  // Anchor "now" at 2026-05-27 UTC midnight so the 7-day window is
  // [2026-05-20, 2026-05-27] inclusive.
  const NOW = new Date(Date.UTC(2026, 4, 27));

  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: 7-day window picks up done milestones inside, drops outside, sorted newest-first", () => {
    const factories = [
      mkFactory({
        slug: "a",
        milestones: [
          mkMilestone({ date: "2026-05-25", text: "inside-mid" }),
          mkMilestone({ date: "2026-05-15", text: "way-outside" }),
          mkMilestone({ date: "2026-05-26", text: "inside-recent" }),
          mkMilestone({ date: "2026-05-21", text: "still-open", done: false }),
        ],
      }),
    ];
    const got = getRecentlyDoneMilestones(NOW, factories);
    expect(got.map((m) => m.text)).toEqual(["inside-recent", "inside-mid"]);
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: milestone dated EXACTLY 7d ago is INCLUDED (lower bound inclusive)", () => {
    // 2026-05-20 == NOW - 7d at UTC midnight. Subscriber intuition is "past
    // 7 days" includes both ends, and parseMilestoneDate normalizes day-
    // precision to UTC midnight so the timestamp matches NOW - 7d exactly.
    const factories = [
      mkFactory({ milestones: [mkMilestone({ date: "2026-05-20", text: "on-boundary" })] }),
    ];
    const got = getRecentlyDoneMilestones(NOW, factories);
    expect(got).toHaveLength(1);
    expect(got[0].text).toBe("on-boundary");
  });

  it("edge: empty factories in → empty array out", () => {
    expect(getRecentlyDoneMilestones(NOW, [])).toEqual([]);
  });

  it("edge: invalid date strings filtered silently, no throw", () => {
    const factories = [
      mkFactory({
        milestones: [
          mkMilestone({ date: "eventually", text: "garbage-date" }),
          mkMilestone({ date: "", text: "empty-date" }),
          mkMilestone({ date: "2026-05-25", text: "good-one" }),
        ],
      }),
    ];
    expect(() => getRecentlyDoneMilestones(NOW, factories)).not.toThrow();
    const got = getRecentlyDoneMilestones(NOW, factories);
    expect(got.map((m) => m.text)).toEqual(["good-one"]);
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: undefined / null inputs handled, return []", () => {
    expect(getRecentlyDoneMilestones(NOW, undefined as unknown as Factory[])).toEqual([]);
    expect(getRecentlyDoneMilestones(NOW, null as unknown as Factory[])).toEqual([]);
    expect(getRecentlyDoneMilestones(undefined as unknown as Date, [])).toEqual([]);
    expect(getRecentlyDoneMilestones(new Date(NaN), [])).toEqual([]);
  });

  it("failure: malformed milestone (no date field) skipped, no crash", () => {
    // Cast through unknown — we're testing what happens when a JSON edit
    // omits a required field that TS would normally guard.
    const bad = { text: "no-date-here", done: true } as unknown as Milestone;
    const factories = [mkFactory({ milestones: [bad, mkMilestone({ date: "2026-05-25" })] })];
    expect(() => getRecentlyDoneMilestones(NOW, factories)).not.toThrow();
    const got = getRecentlyDoneMilestones(NOW, factories);
    expect(got).toHaveLength(1);
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: against live factories.json, never throws", () => {
    expect(() => getRecentlyDoneMilestones(NOW, liveFactories)).not.toThrow();
    // Smoke check across a wide anchor sweep — every Saturday for the last
    // year + the next year, run the helper and confirm no crash.
    for (let weeks = -52; weeks <= 52; weeks++) {
      const probe = new Date(NOW.getTime() + weeks * 7 * 86_400_000);
      expect(() => getRecentlyDoneMilestones(probe, liveFactories)).not.toThrow();
    }
  });

  it("invariant: every returned item passes isRecapMilestone type guard", () => {
    // Use a wide-enough anchor sweep that some rows actually come back.
    for (let weeks = -10; weeks <= 10; weeks++) {
      const probe = new Date(NOW.getTime() + weeks * 7 * 86_400_000);
      const rows = getRecentlyDoneMilestones(probe, liveFactories);
      for (const row of rows) expect(isRecapMilestone(row)).toBe(true);
    }
  });
});

describe("getRecentAnalyses", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: anchor inside the analyses.json publishedAt window picks up real entries", () => {
    // public/data/analyses.json ships with cortex-2-0-permit-chain dated
    // 2026-05-27T13:00:00Z. Anchor "now" 1d after so it sits inside [-7d, 0].
    const NOW = new Date(Date.UTC(2026, 4, 28, 13, 0, 0));
    const got = getRecentAnalyses(NOW);
    expect(got.length).toBeGreaterThanOrEqual(1);
    expect(got[0].slug).toBe("cortex-2-0-permit-chain-giga-texas-2026-05");
    expect(got[0].publishedAt.startsWith("2026-05-27")).toBe(true);
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: anchor exactly at publishedAt (0ms diff) → INCLUDED", () => {
    // The fixture analysis is published at 2026-05-27T13:00:00Z. Setting
    // NOW to the exact same instant places it at the upper bound, which
    // is inclusive (`ts <= now`).
    const NOW = new Date(Date.parse("2026-05-27T13:00:00Z"));
    const got = getRecentAnalyses(NOW);
    expect(got.length).toBeGreaterThanOrEqual(1);
  });

  it("edge: anchor 1ms BEFORE publishedAt → EXCLUDED (future-dated analyses don't leak)", () => {
    const NOW = new Date(Date.parse("2026-05-27T13:00:00Z") - 1);
    const got = getRecentAnalyses(NOW);
    expect(got.find((a) => a.slug === "cortex-2-0-permit-chain-giga-texas-2026-05")).toBeUndefined();
  });

  it("edge: anchor 8 days after publishedAt → analysis falls OUT of window", () => {
    // 7d + 1ms past 2026-05-27T13:00 — the cutoff is `ts < now - 7d`, so
    // the fixture should be excluded.
    const NOW = new Date(Date.parse("2026-05-27T13:00:00Z") + 7 * 86_400_000 + 1);
    const got = getRecentAnalyses(NOW);
    expect(got.find((a) => a.slug === "cortex-2-0-permit-chain-giga-texas-2026-05")).toBeUndefined();
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: undefined / null / NaN `now` → []", () => {
    expect(getRecentAnalyses(undefined as unknown as Date)).toEqual([]);
    expect(getRecentAnalyses(null as unknown as Date)).toEqual([]);
    expect(getRecentAnalyses(new Date(NaN))).toEqual([]);
  });

  it("failure: anchor far in the past (year 1900) → [] but no throw", () => {
    const NOW = new Date(Date.UTC(1900, 0, 1));
    expect(() => getRecentAnalyses(NOW)).not.toThrow();
    expect(getRecentAnalyses(NOW)).toEqual([]);
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: across a year-long anchor sweep, never throws", () => {
    for (let weeks = -52; weeks <= 52; weeks++) {
      const probe = new Date(Date.UTC(2026, 4, 27) + weeks * 7 * 86_400_000);
      expect(() => getRecentAnalyses(probe)).not.toThrow();
    }
  });

  it("invariant: every returned item passes isRecapAnalysis type guard", () => {
    const NOW = new Date(Date.UTC(2026, 4, 28, 13, 0, 0));
    const rows = getRecentAnalyses(NOW);
    for (const row of rows) expect(isRecapAnalysis(row)).toBe(true);
  });
});

describe("getUpcomingCatalysts", () => {
  const NOW = new Date(Date.UTC(2026, 4, 27));

  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: 14-day forward window picks up open milestones, sorted soonest-first", () => {
    const factories = [
      mkFactory({
        slug: "a",
        milestones: [
          mkMilestone({ date: "2026-05-30", text: "in-3d", done: false }),
          mkMilestone({ date: "2026-06-09", text: "in-13d", done: false }),
          mkMilestone({ date: "2026-06-20", text: "too-far", done: false }),
          mkMilestone({ date: "2026-05-25", text: "in-past", done: false }),
          mkMilestone({ date: "2026-05-30", text: "already-done", done: true }),
        ],
      }),
    ];
    const got = getUpcomingCatalysts(NOW, factories);
    expect(got.map((m) => m.text)).toEqual(["in-3d", "in-13d"]);
    expect(got[0].daysAway).toBe(3);
    expect(got[1].daysAway).toBe(13);
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: milestone EXACTLY at now (0d) included; at now + horizonDays (14d) included; at now + horizonDays + 1d excluded", () => {
    const factories = [
      mkFactory({
        slug: "a",
        milestones: [
          mkMilestone({ date: "2026-05-27", text: "today", done: false }),
          mkMilestone({ date: "2026-06-10", text: "exactly-14d", done: false }),
          mkMilestone({ date: "2026-06-11", text: "just-past-window", done: false }),
        ],
      }),
    ];
    const got = getUpcomingCatalysts(NOW, factories);
    expect(got.map((m) => m.text)).toEqual(["today", "exactly-14d"]);
  });

  it("edge: empty arrays in → empty arrays out", () => {
    expect(getUpcomingCatalysts(NOW, [])).toEqual([]);
  });

  it("edge: custom horizonDays respected (7 → window halved)", () => {
    const factories = [
      mkFactory({
        milestones: [
          mkMilestone({ date: "2026-05-30", text: "in-3d", done: false }),
          mkMilestone({ date: "2026-06-05", text: "in-9d-out-with-7d-horizon", done: false }),
        ],
      }),
    ];
    const got = getUpcomingCatalysts(NOW, factories, 7);
    expect(got.map((m) => m.text)).toEqual(["in-3d"]);
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: undefined / null factory list → []", () => {
    expect(getUpcomingCatalysts(NOW, undefined as unknown as Factory[])).toEqual([]);
    expect(getUpcomingCatalysts(NOW, null as unknown as Factory[])).toEqual([]);
    expect(getUpcomingCatalysts(new Date(NaN), [])).toEqual([]);
  });

  it("failure: malformed milestone (no date field) skipped, no crash", () => {
    const bad = { text: "no-date", done: false } as unknown as Milestone;
    const factories = [
      mkFactory({
        milestones: [bad, mkMilestone({ date: "2026-05-30", text: "good", done: false })],
      }),
    ];
    expect(() => getUpcomingCatalysts(NOW, factories)).not.toThrow();
    const got = getUpcomingCatalysts(NOW, factories);
    expect(got).toHaveLength(1);
    expect(got[0].text).toBe("good");
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: against live factories.json, never throws across year-long anchor sweep", () => {
    for (let weeks = -52; weeks <= 52; weeks++) {
      const probe = new Date(NOW.getTime() + weeks * 7 * 86_400_000);
      expect(() => getUpcomingCatalysts(probe, liveFactories)).not.toThrow();
    }
  });

  it("invariant: every returned item passes isRecapUpcoming type guard", () => {
    for (let weeks = -10; weeks <= 10; weeks++) {
      const probe = new Date(NOW.getTime() + weeks * 7 * 86_400_000);
      const rows = getUpcomingCatalysts(probe, liveFactories);
      for (const row of rows) {
        expect(isRecapUpcoming(row)).toBe(true);
        // daysAway always in [0, 14]
        expect(row.daysAway).toBeGreaterThanOrEqual(0);
        expect(row.daysAway).toBeLessThanOrEqual(14);
        // company is one of the canonical six (TS Company union)
        const validCompanies: Company[] = ["tesla", "spacex", "xai", "neuralink", "boring", "joint"];
        expect(validCompanies).toContain(row.company);
      }
    }
  });
});
