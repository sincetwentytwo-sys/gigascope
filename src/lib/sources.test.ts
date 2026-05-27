// Unit tests for /lib/sources — the bibliography aggregator behind the
// /sources page.
//
// Structure mirrors the project's house style (see x-queue.test.ts):
//   1 happy path · 3 edge cases · 2 failure cases · live-data invariants
//
// Two pure functions are pinned down:
//   - classifySource(url): URL → provider bucket
//   - getSourcesForFactory(f): factory-level Sources[] + milestone
//                              sourceUrls, deduped, in stable order

import { describe, it, expect } from "vitest";
import {
  classifySource,
  getSourcesForFactory,
  getAllSourceGroups,
  getSourceProviderCounts,
} from "./sources";
import { factories } from "@/data/factories";
import type { Factory } from "@/data/types";

// Minimal Factory factory — only the fields the aggregator reads. Anything
// the aggregator doesn't touch (capacity, products, location, etc.) is set
// to a benign default and never tested.
function mkFactory(overrides: Partial<Factory> = {}): Factory {
  return {
    id: "test",
    slug: "test",
    name: "Test Site",
    aka: "Test",
    flag: "🇺🇸",
    location: "Nowhere, USA",
    lat: 0,
    lng: 0,
    company: "tesla",
    status: "operational",
    progress: 50,
    area: "1M sqft",
    capacity: "—",
    products: "—",
    investment: "$1B",
    employees: "—",
    color: "#000",
    lastUpdated: "2026-05-27",
    milestones: [],
    timeline: [0, 10, 20, 30, 40, 45, 50],
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────
// classifySource — URL → provider bucket
// ─────────────────────────────────────────────────────────────────────
describe("classifySource", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: routes the major providers to their named bucket", () => {
    expect(classifySource("https://www.sec.gov/cgi-bin/browse-edgar?CIK=0001318605")).toBe("SEC EDGAR");
    expect(classifySource("https://www.faa.gov/notice/12345")).toBe("FAA");
    expect(classifySource("https://www.nasa.gov/mission/dragon")).toBe("NASA");
    expect(classifySource("https://en.wikipedia.org/wiki/Gigafactory_Texas")).toBe("Wikipedia");
    expect(classifySource("https://www.tesla.com/IR/q1-2026")).toBe("IR / company site");
    expect(classifySource("https://dart.fss.or.kr/document")).toBe("DART");
    expect(classifySource("https://clinicaltrials.gov/study/NCT05972642")).toBe("ClinicalTrials.gov");
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: strips leading 'www.' before matching, so bare hostnames hit too", () => {
    expect(classifySource("https://sec.gov/path")).toBe("SEC EDGAR");
    expect(classifySource("https://www.sec.gov/path")).toBe("SEC EDGAR");
  });

  it("edge: uppercase URL doesn't break classification (host lowercased)", () => {
    expect(classifySource("HTTPS://WWW.SEC.GOV/path")).toBe("SEC EDGAR");
  });

  it("edge: unknown .gov host buckets as 'Other government', generic .com returns null", () => {
    expect(classifySource("https://traviscountytx.gov/permits/12345")).toBe("Other government");
    expect(classifySource("https://reuters.com/article")).toBeNull();
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: malformed URL returns null without throwing", () => {
    expect(classifySource("not-a-url")).toBeNull();
    expect(classifySource("")).toBeNull();
  });

  it("failure: scheme-less or hostile junk doesn't crash", () => {
    expect(classifySource("sec.gov")).toBeNull(); // no scheme → URL ctor throws → caught
    expect(classifySource("javascript:alert(1)")).toBeNull(); // scheme but no host
  });
});

// ─────────────────────────────────────────────────────────────────────
// getSourcesForFactory — factory + milestone source aggregation
// ─────────────────────────────────────────────────────────────────────
describe("getSourcesForFactory", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: combines factory-level Sources[] + milestone sourceUrls, dedupes by URL", () => {
    const f = mkFactory({
      sources: [
        { url: "https://www.sec.gov/a", label: "SEC 8-K", date: "2026-01" },
      ],
      milestones: [
        { date: "2026-02", text: "Phase 1 done", done: true, sourceUrl: "https://www.faa.gov/b" },
        { date: "2026-03", text: "Phase 2 done", done: true, sourceUrl: "https://www.sec.gov/a" }, // dup of factory-level
      ],
    });
    const entries = getSourcesForFactory(f);
    expect(entries).toHaveLength(2);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://www.sec.gov/a");
    expect(urls).toContain("https://www.faa.gov/b");
    // Factory-level cites come first (higher tier)
    expect(entries[0].context).toBe("factory");
  });

  // ── Edge cases (3) ────────────────────────────────────────────────
  it("edge: factory with NO sources field at all still returns milestone URLs", () => {
    const f = mkFactory({
      milestones: [{ date: "2026-02", text: "x", done: true, sourceUrl: "https://www.sec.gov/x" }],
    });
    const entries = getSourcesForFactory(f);
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://www.sec.gov/x");
    expect(entries[0].context).toMatch(/^milestone/);
  });

  it("edge: legacy object-shape sources is treated as 'no factory-level cites' (no crash)", () => {
    // Some pre-pivot factories.json entries shipped `sources: { wikipedia: "..." }`.
    // The Array.isArray guard exists exactly for this. Force-cast to bypass TS.
    const f = mkFactory({
      sources: { wikipedia: "https://example.com" } as unknown as Factory["sources"],
      milestones: [{ date: "2026-02", text: "x", done: true, sourceUrl: "https://www.sec.gov/x" }],
    });
    const entries = getSourcesForFactory(f);
    expect(entries).toHaveLength(1);
    expect(entries[0].context).toMatch(/^milestone/);
  });

  it("edge: empty-string sourceUrl is treated as 'no source' (not as a 'duplicate empty URL')", () => {
    const f = mkFactory({
      milestones: [
        { date: "2026-01", text: "a", done: true, sourceUrl: "" },
        { date: "2026-02", text: "b", done: true, sourceUrl: "" },
        { date: "2026-03", text: "c", done: true, sourceUrl: "https://www.sec.gov/c" },
      ],
    });
    const entries = getSourcesForFactory(f);
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://www.sec.gov/c");
  });

  // ── Failure cases (2) ─────────────────────────────────────────────
  it("failure: factory with zero sources and zero sourceUrls returns []", () => {
    const f = mkFactory({
      milestones: [
        { date: "2026-01", text: "a", done: true },
        { date: "2026-02", text: "b", done: false },
      ],
    });
    expect(getSourcesForFactory(f)).toEqual([]);
  });

  it("failure: malformed factory-source (url: '') is skipped, valid neighbor still included", () => {
    const f = mkFactory({
      sources: [
        { url: "", label: "missing url", date: "2026-01" },
        { url: "https://www.sec.gov/ok", label: "ok", date: "2026-02" },
      ] as Factory["sources"],
    });
    const entries = getSourcesForFactory(f);
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://www.sec.gov/ok");
  });

  // ── Live-data invariants (against the real factories.json) ───────
  it("invariant: every live factory returns deduped URLs (no URL appears twice in one site)", () => {
    for (const f of factories) {
      const urls = getSourcesForFactory(f).map((e) => e.url);
      expect(new Set(urls).size).toBe(urls.length);
    }
  });

  it("invariant: every entry has a non-empty url + label", () => {
    for (const f of factories) {
      for (const e of getSourcesForFactory(f)) {
        expect(e.url.length).toBeGreaterThan(0);
        expect(e.label.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// getAllSourceGroups + getSourceProviderCounts — page-level invariants
// ─────────────────────────────────────────────────────────────────────
describe("getAllSourceGroups + getSourceProviderCounts", () => {
  it("getAllSourceGroups skips sites with zero cited sources (no empty headers on /sources)", () => {
    for (const g of getAllSourceGroups()) {
      expect(g.entries.length).toBeGreaterThan(0);
    }
  });

  it("getSourceProviderCounts sums to total cite count, sorted desc, each count ≥ 1", () => {
    const counts = getSourceProviderCounts();
    const total = counts.reduce((s, c) => s + c.count, 0);
    const aggregate = getAllSourceGroups().reduce((s, g) => s + g.entries.length, 0);
    expect(total).toBe(aggregate);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1].count >= counts[i].count).toBe(true);
    }
    for (const c of counts) {
      expect(c.count).toBeGreaterThanOrEqual(1);
      expect(c.provider.length).toBeGreaterThan(0);
    }
  });
});
