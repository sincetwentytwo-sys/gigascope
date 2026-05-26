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
