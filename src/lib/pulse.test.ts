// Unit tests for pulse.ts — pure helper coverage.
//
// We don't test the full aggregate getters (getEmpireStats etc.) because
// those read live factories.json + timelapses index, which the data team
// can churn. We DO test the pure functions:
//   - parseAreaToKm2: handle all shapes the actual data uses
//   - parseMilestoneDate: handle year / month / day / quarter / half
//   - formatRelativeDate: relative-time bucketing
//   - formatKm2 / formatCount: numeric formatting

import { describe, it, expect } from "vitest";
import {
  parseAreaToKm2,
  parseMilestoneDate,
  formatRelativeDate,
  formatKm2,
  formatCount,
  getAggregateTimeline,
  getEmpireStats,
  getLatestCaptures,
  getRecentMilestones,
  getUpcomingMilestones,
  getVelocityLeaderboard,
  getCompanyBreakdown,
} from "./pulse";

describe("parseAreaToKm2", () => {
  it("happy: '10M sqft' → ~0.929 km²", () => {
    const km2 = parseAreaToKm2("10M sqft");
    expect(km2).not.toBeNull();
    expect(km2!).toBeGreaterThan(0.9);
    expect(km2!).toBeLessThan(1.0);
  });

  it("happy: '550K sqft' → ~0.051 km²", () => {
    const km2 = parseAreaToKm2("550K sqft");
    expect(km2).not.toBeNull();
    expect(km2!).toBeGreaterThan(0.04);
    expect(km2!).toBeLessThan(0.06);
  });

  it("happy: '800+ acres' → ~3.24 km² (+ tolerated)", () => {
    const km2 = parseAreaToKm2("800+ acres");
    expect(km2).not.toBeNull();
    expect(km2!).toBeGreaterThan(3.2);
    expect(km2!).toBeLessThan(3.3);
  });

  it("edge: 'Est. 10M+ sqft' → 'Est.' prefix tolerated", () => {
    const km2 = parseAreaToKm2("Est. 10M+ sqft");
    expect(km2).not.toBeNull();
    expect(km2!).toBeGreaterThan(0.9);
  });

  it("edge: '4.2M sqft (planned)' → parenthetical ignored", () => {
    const km2 = parseAreaToKm2("4.2M sqft (planned)");
    expect(km2).not.toBeNull();
    expect(km2!).toBeGreaterThan(0.38);
    expect(km2!).toBeLessThan(0.40);
  });

  it("edge: '100 ha' → 1 km² (hectare conversion)", () => {
    const km2 = parseAreaToKm2("100 ha");
    expect(km2).toBeCloseTo(1, 4);
  });

  it("failure: '2 launch pads' → null (not an area)", () => {
    expect(parseAreaToKm2("2 launch pads")).toBeNull();
  });

  it("failure: '68 miles (planned)' → null (linear, not area)", () => {
    expect(parseAreaToKm2("68 miles (planned)")).toBeNull();
  });

  it("failure: undefined / empty → null", () => {
    expect(parseAreaToKm2(undefined)).toBeNull();
    expect(parseAreaToKm2("")).toBeNull();
    expect(parseAreaToKm2(null)).toBeNull();
  });
});

describe("parseMilestoneDate", () => {
  it("happy: '2026-05-15' parses to UTC midnight that day", () => {
    expect(parseMilestoneDate("2026-05-15")).toBe(Date.UTC(2026, 4, 15));
  });

  it("happy: '2026-05' pins to mid-month", () => {
    expect(parseMilestoneDate("2026-05")).toBe(Date.UTC(2026, 4, 15));
  });

  it("happy: '2026' pins to Jun 15 (mid-year)", () => {
    expect(parseMilestoneDate("2026")).toBe(Date.UTC(2026, 5, 15));
  });

  it("edge: '2026-Q1' → mid-Feb (month idx 1, day 15)", () => {
    expect(parseMilestoneDate("2026-Q1")).toBe(Date.UTC(2026, 1, 15));
  });

  it("edge: '2026-Q4' → mid-Nov (month idx 10, day 15)", () => {
    expect(parseMilestoneDate("2026-Q4")).toBe(Date.UTC(2026, 10, 15));
  });

  it("edge: '2026-H2' → mid-Sep", () => {
    expect(parseMilestoneDate("2026-H2")).toBe(Date.UTC(2026, 8, 15));
  });

  it("failure: garbage input → null", () => {
    expect(parseMilestoneDate("eventually")).toBeNull();
    expect(parseMilestoneDate("")).toBeNull();
  });
});

describe("formatRelativeDate", () => {
  // Anchor "now" at 2026-05-27 UTC to make the assertions deterministic.
  const NOW = Date.UTC(2026, 4, 27);

  it("today vs yesterday", () => {
    expect(formatRelativeDate("2026-05-27", NOW)).toBe("today");
    expect(formatRelativeDate("2026-05-26", NOW)).toBe("yesterday");
  });

  it("days ago", () => {
    expect(formatRelativeDate("2026-05-22", NOW)).toBe("5d ago");
  });

  it("weeks → months → years", () => {
    expect(formatRelativeDate("2026-05-13", NOW)).toBe("2w ago"); // 14 days
    expect(formatRelativeDate("2026-02-15", NOW)).toMatch(/mo ago$/);
    expect(formatRelativeDate("2024-05-27", NOW)).toMatch(/y ago$/);
  });
});

describe("getAggregateTimeline", () => {
  // Live data integration smoke — we don't pin to exact numbers because the
  // dataset churns; we just sanity-check shape + monotonicity.
  it("returns one row per timeline year, year ascending", () => {
    const rows = getAggregateTimeline([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    expect(rows).toHaveLength(7);
    expect(rows.map((r) => r.year)).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  });

  it("averageProgress is a 0-100 integer for each row", () => {
    const rows = getAggregateTimeline([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    for (const r of rows) {
      expect(Number.isInteger(r.averageProgress)).toBe(true);
      expect(r.averageProgress).toBeGreaterThanOrEqual(0);
      expect(r.averageProgress).toBeLessThanOrEqual(100);
    }
  });

  it("contributingSites grows or stays flat year-over-year (no sites disappear once on)", () => {
    const rows = getAggregateTimeline([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    for (let i = 1; i < rows.length; i++) {
      // Sites with zero progress are excluded, so as more sites break ground
      // the count should monotonically grow. This catches regressions where
      // a site's later-year progress accidentally got set to 0.
      expect(rows[i].contributingSites).toBeGreaterThanOrEqual(rows[i - 1].contributingSites);
    }
  });

  it("empty years array returns []", () => {
    expect(getAggregateTimeline([])).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────
// Integration smoke tests for the aggregate getters. These call the real
// helpers against the live factories.json + timelapses/index.json. We don't
// pin to exact values (those data files churn); we assert shape + invariants.
// ──────────────────────────────────────────────────────────────────────────
describe("aggregate getters — shape + invariants", () => {
  it("getEmpireStats returns a well-formed EmpireStats", () => {
    const stats = getEmpireStats();
    expect(stats.sites).toBeGreaterThanOrEqual(16);
    expect(stats.countries).toBeGreaterThanOrEqual(1);
    expect(stats.satelliteFrames).toBeGreaterThan(0);
    expect(stats.milestonesTracked).toBeGreaterThan(0);
    expect(stats.milestonesDone).toBeLessThanOrEqual(stats.milestonesTracked);
    expect(stats.totalFootprintKm2).toBeGreaterThan(0);
    expect(stats.totalInvestment).toMatch(/^~?\$\d+B/);
    expect(stats.dataLastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("getLatestCaptures returns at most the requested count, sorted desc by date", () => {
    const captures = getLatestCaptures(5);
    expect(captures.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < captures.length; i++) {
      expect(captures[i - 1].latest >= captures[i].latest).toBe(true);
    }
    for (const c of captures) {
      expect(c.frames).toBeGreaterThan(0);
      expect(c.slug.length).toBeGreaterThan(0);
    }
  });

  it("getRecentMilestones returns only done=true milestones, sorted desc by date", () => {
    const recent = getRecentMilestones(20);
    // Sorted descending — but compare via parseMilestoneDate timestamp, not
    // raw string. String compare would put '2026-03-15' before '2026-Q1'
    // alphabetically, even though Q1 (mid-Feb) is earlier than March.
    for (let i = 1; i < recent.length; i++) {
      const prev = parseMilestoneDate(recent[i - 1].date) ?? 0;
      const cur = parseMilestoneDate(recent[i].date) ?? 0;
      expect(prev >= cur).toBe(true);
    }
    // All entries have non-empty text + site
    for (const m of recent) {
      expect(m.text.length).toBeGreaterThan(0);
      expect(m.site.length).toBeGreaterThan(0);
    }
  });

  it("getUpcomingMilestones returns within window, sorted asc by days", () => {
    const NOW = Date.UTC(2026, 4, 27); // pin to deterministic anchor
    const upcoming = getUpcomingMilestones(10, NOW);
    for (let i = 1; i < upcoming.length; i++) {
      expect(upcoming[i - 1].daysAway <= upcoming[i].daysAway).toBe(true);
    }
    for (const m of upcoming) {
      expect(m.daysAway).toBeGreaterThanOrEqual(-30);
      expect(m.daysAway).toBeLessThanOrEqual(540);
    }
  });

  it("getVelocityLeaderboard returns positive deltas sorted desc", () => {
    const velocity = getVelocityLeaderboard(10);
    for (let i = 1; i < velocity.length; i++) {
      expect(velocity[i - 1].delta >= velocity[i].delta).toBe(true);
    }
    for (const v of velocity) {
      expect(v.delta).toBeGreaterThan(0);
      expect(v.current).toBeGreaterThan(v.prior);
    }
  });

  it("getCompanyBreakdown returns one row per company with averageProgress in [0,100]", () => {
    const rows = getCompanyBreakdown();
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.sites).toBeGreaterThan(0);
      expect(row.averageProgress).toBeGreaterThanOrEqual(0);
      expect(row.averageProgress).toBeLessThanOrEqual(100);
      expect(row.totalArea).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("format helpers", () => {
  it("formatKm2 — buckets at 10 and 100", () => {
    expect(formatKm2(0)).toBe("—");
    expect(formatKm2(0.93)).toBe("0.93 km²");
    expect(formatKm2(12.34)).toBe("12.3 km²");
    expect(formatKm2(150)).toBe("150 km²");
  });

  it("formatCount — K and M suffixes", () => {
    expect(formatCount(42)).toBe("42");
    expect(formatCount(1500)).toBe("1.5K");
    expect(formatCount(2_300_000)).toBe("2.3M");
  });
});
