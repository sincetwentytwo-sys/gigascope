// Unit tests for /lib/permits filterGigaTexas — the matcher behind the
// Travis County permit-alert cron. Wrong matches mean either (a) noise
// alerts about random "TESLA" addresses, or (b) silently-missed Giga
// Texas permits when the address field is blank but geo is correct.
//
// Structure: 1 happy + 3 edge + 2 failure + 2 invariants.

import { describe, it, expect } from "vitest";
import { filterGigaTexas, PERMIT_SOURCE_LABEL } from "./permits";
import type { Permit } from "./permits";

// Minimal Permit factory — fields filterGigaTexas reads are the only ones
// the test touches. Everything else gets benign defaults.
function mkPermit(overrides: Partial<Permit> = {}): Permit {
  return {
    id: "TEST-001",
    address: "1 RANDOM RD",
    city: "AUSTIN",
    zip: "78725",
    type: "Building Permit",
    workClass: "New",
    description: "Generic construction work",
    sqft: 100,
    valuation: 10_000,
    filedAt: "2026-05-20",
    applicant: null,
    contractor: null,
    status: "Issued",
    jurisdiction: null,
    latitude: null,
    longitude: null,
    sourceUrl: "https://example.com/permit/TEST-001",
    ...overrides,
  };
}

describe("filterGigaTexas", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: permit whose address contains 'TESLA' is matched (the SODA query's primary signal)", () => {
    const permits = [mkPermit({ address: "13101 TESLA RD" })];
    expect(filterGigaTexas(permits)).toHaveLength(1);
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: address match is case-insensitive (raw SODA data is sometimes title-cased)", () => {
    const permits = [
      mkPermit({ id: "P-1", address: "13101 tesla rd" }),
      mkPermit({ id: "P-2", address: "13101 Tesla Rd" }),
      mkPermit({ id: "P-3", address: "13101 TESLA RD" }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(3);
  });

  it("edge: blank address but lat/lon inside the ~2.2km box around (30.22, -97.62) still matches", () => {
    // Values held clearly inside (≤0.019° drift). Exact boundary (0.02 abs
    // diff) is fragile against FP error — 30.24 - 30.22 = 0.020000000000000018
    // in JS, so a permit ON the box edge silently fails the `<= 0.02` check.
    // That's a real bug, asserted separately below as a "KNOWN" sentinel.
    const permits = [
      mkPermit({ id: "centroid", address: "", latitude: 30.22, longitude: -97.62 }),
      mkPermit({ id: "near",     address: "", latitude: 30.221, longitude: -97.619 }),
      mkPermit({ id: "inside",   address: "", latitude: 30.239, longitude: -97.601 }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(3);
  });

  it("edge: description containing both 'GIGA' and 'TESLA' is a backup signal even with neutral address + no geo", () => {
    const permits = [
      mkPermit({
        id: "desc-only",
        address: "12345 CONTRACTOR STAGING YARD",
        latitude: null,
        longitude: null,
        description: "GIGA TEXAS TESLA EXPANSION - PHASE 3 ROOF",
      }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(1);
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: permit with random address far from the geo box and unrelated description is REJECTED", () => {
    const permits = [
      mkPermit({
        id: "downtown-austin",
        address: "501 W 6TH ST",
        latitude: 30.272, // ~5km north of Giga Texas
        longitude: -97.74,
        description: "Office renovation",
      }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(0);
  });

  it("failure: lat/lon just outside the box (>0.02° in either axis) without TESLA keyword is REJECTED", () => {
    const permits = [
      // 0.021° away in latitude — 1 unit beyond the bounding box.
      mkPermit({ id: "just-outside", address: "FAR DR", latitude: 30.241, longitude: -97.62, description: "x" }),
      // null lat/lon AND no TESLA/GIGA in fields.
      mkPermit({ id: "no-geo", address: "100 MAIN ST", latitude: null, longitude: null, description: "x" }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(0);
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: empty array in → empty array out", () => {
    expect(filterGigaTexas([])).toEqual([]);
  });

  it("invariant: PERMIT_SOURCE_LABEL is a non-empty attribution string mentioning Austin", () => {
    expect(PERMIT_SOURCE_LABEL.length).toBeGreaterThan(0);
    expect(PERMIT_SOURCE_LABEL).toContain("Austin");
  });

  // ── Known limitations (regression sentinels — keep failing tests honest) ──
  it("KNOWN: substring address match over-matches 'TESLAFAB' / 'Mr. Tesla's' — review #4", () => {
    // This is current behaviour, not desired behaviour. Pinning it so a
    // future word-boundary tightening breaks this test loudly instead of
    // silently changing matching semantics.
    const permits = [
      mkPermit({ id: "false-positive-1", address: "TESLAFAB SUPPLY CO" }),
      mkPermit({ id: "false-positive-2", address: "Mr. Tesla's Pizza" }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(2);
  });

  it("FIXED: FP epsilon now matches permits sitting EXACTLY on the box corner (±0.02°)", () => {
    // 30.24 - 30.22 evaluates to 0.020000000000000018 in IEEE-754, so a bare
    // `dLat <= 0.02` check would reject the geometric corner of the box.
    // permits.ts adds a small `GEO_BOX_EPS` to the half-degree threshold to
    // include the boundary. This test pins the corrected behavior — flipping
    // it would silently re-introduce the FP-drift miss.
    const permits = [
      mkPermit({ id: "corner", address: "", description: "x", latitude: 30.24, longitude: -97.60 }),
    ];
    expect(filterGigaTexas(permits)).toHaveLength(1);
  });
});
