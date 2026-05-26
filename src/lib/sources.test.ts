// Tests for /lib/sources — bibliography aggregator. Schema/invariant tests
// against the live factories.json so dataset churn doesn't break them.

import { describe, it, expect } from "vitest";
import {
  getSourcesForFactory,
  getAllSourceGroups,
  getSourceProviderCounts,
  classifySource,
} from "./sources";
import { factories } from "@/data/factories";

describe("getSourcesForFactory", () => {
  it("returns deduped URLs (same URL never appears twice)", () => {
    for (const f of factories) {
      const entries = getSourcesForFactory(f);
      const urls = entries.map((e) => e.url);
      expect(new Set(urls).size).toBe(urls.length);
    }
  });

  it("entries always have a non-empty URL + label", () => {
    for (const f of factories) {
      for (const e of getSourcesForFactory(f)) {
        expect(e.url.length).toBeGreaterThan(0);
        expect(e.label.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("getAllSourceGroups", () => {
  it("skips factories with zero cited sources (no empty headers on /sources)", () => {
    const groups = getAllSourceGroups();
    for (const g of groups) {
      expect(g.entries.length).toBeGreaterThan(0);
    }
  });

  it("preserves factory order from factories.json (stable for predictable scroll position)", () => {
    const groups = getAllSourceGroups();
    const groupSlugs = groups.map((g) => g.site.slug);
    const expectedOrder = factories.filter(
      (f) => getSourcesForFactory(f).length > 0,
    ).map((f) => f.slug);
    expect(groupSlugs).toEqual(expectedOrder);
  });
});

describe("classifySource", () => {
  it("classifies known government domains", () => {
    expect(classifySource("https://www.sec.gov/Archives/edgar/data/12345.htm")).toBe("SEC EDGAR");
    expect(classifySource("https://www.faa.gov/space/")).toBe("FAA");
    expect(classifySource("https://www.nasa.gov/missions/")).toBe("NASA");
    expect(classifySource("https://www.usgs.gov/mineral-data")).toBe("USGS");
    expect(classifySource("https://www.nrc.gov/docs/foo.html")).toBe("NRC");
  });

  it("classifies Korean source domains", () => {
    expect(classifySource("https://kosis.kr/statHtml")).toBe("KOSIS");
    expect(classifySource("https://dart.fss.or.kr/document")).toBe("DART");
  });

  it("classifies ClinicalTrials.gov", () => {
    expect(classifySource("https://clinicaltrials.gov/study/NCT05972642")).toBe("ClinicalTrials.gov");
  });

  it("classifies Wikipedia", () => {
    expect(classifySource("https://en.wikipedia.org/wiki/Gigafactory")).toBe("Wikipedia");
  });

  it("classifies IR / company sites", () => {
    expect(classifySource("https://tesla.com/news")).toBe("IR / company site");
    expect(classifySource("https://www.spacex.com/launches")).toBe("IR / company site");
    expect(classifySource("https://x.ai/blog")).toBe("IR / company site");
  });

  it("returns null for unknown domains so they bucket into Other", () => {
    expect(classifySource("https://example.com")).toBeNull();
    expect(classifySource("https://teslarati.com/article")).toBeNull();
  });

  it("returns null without throwing on malformed URLs", () => {
    expect(classifySource("not-a-url")).toBeNull();
    expect(classifySource("")).toBeNull();
  });
});

describe("getSourceProviderCounts", () => {
  it("returns providers sorted by count descending", () => {
    const counts = getSourceProviderCounts();
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i - 1].count >= counts[i].count).toBe(true);
    }
  });

  it("each provider count is at least 1", () => {
    for (const c of getSourceProviderCounts()) {
      expect(c.count).toBeGreaterThanOrEqual(1);
      expect(c.provider.length).toBeGreaterThan(0);
    }
  });
});
