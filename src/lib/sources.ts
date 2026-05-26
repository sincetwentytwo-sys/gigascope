// Aggregates every primary-source URL we cite across the site, grouped
// for the /sources bibliography page.
//
// Two source tiers:
//   1. Factory-level — entire-factory `sources[]` arrays (FactoryData.sources)
//   2. Milestone-level — per-milestone `sourceUrl` strings
//
// We dedupe by URL, keep the original capture metadata when available, and
// return a stable shape the bibliography page can render without further
// computation.

import { factories } from "@/data/factories";
import type { Factory } from "@/data/types";

export interface SourceEntry {
  url: string;
  // Human-readable label (factory.sources[*].label) or milestone text fallback.
  label: string;
  // YYYY-MM-DD when available (from sources[*].date or milestone.date).
  date?: string;
  // Which milestone or factory section produced this entry.
  context: string;
}

export interface SitesourceGroup {
  site: Factory;
  entries: SourceEntry[];
}

/**
 * Roll up source URLs for one factory: factory-level Sources[] + every
 * milestone with a sourceUrl. Dedupes by URL — the same primary source
 * cited multiple times only appears once per site.
 *
 * Note: factories.json is inconsistent — some entries have `sources: [...]`
 * (proper array of Source objects), others have `sources: { wikipedia... }`
 * (legacy object shape from pre-pivot data). We accept both and only
 * iterate when we're looking at an actual array.
 */
export function getSourcesForFactory(f: Factory): SourceEntry[] {
  const out: SourceEntry[] = [];
  const seen = new Set<string>();

  // Factory-level sources first (typically the highest-quality references).
  // Guard against the legacy object shape — only iterate when it's a real
  // array. Object-shaped `sources` (the Wikipedia-pointer legacy) is treated
  // as "no factory-level cites" since we'd rather under-cite than synthesize.
  if (Array.isArray(f.sources)) {
    for (const s of f.sources) {
      if (!s?.url || seen.has(s.url)) continue;
      seen.add(s.url);
      out.push({
        url: s.url,
        label: s.label || s.url,
        date: s.date,
        context: "factory",
      });
    }
  }

  // Per-milestone sourceUrls.
  for (const m of f.milestones) {
    if (!m.sourceUrl || seen.has(m.sourceUrl)) continue;
    seen.add(m.sourceUrl);
    out.push({
      url: m.sourceUrl,
      label: m.text,
      date: m.date,
      context: `milestone · ${m.date}`,
    });
  }

  return out;
}

/**
 * Site-by-site bibliography. Skips sites with zero cited sources so the
 * /sources page doesn't render empty headers.
 */
export function getAllSourceGroups(): SitesourceGroup[] {
  const groups: SitesourceGroup[] = [];
  for (const f of factories) {
    const entries = getSourcesForFactory(f);
    if (entries.length === 0) continue;
    groups.push({ site: f, entries });
  }
  return groups;
}

/**
 * Categorize a URL by its provider domain — used to render a "by source
 * provider" overview at the top of the /sources page. Returns null for
 * domains we don't have an explicit bucket for, which become "Other".
 */
export function classifySource(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host.endsWith("sec.gov")) return "SEC EDGAR";
    if (host.endsWith("faa.gov")) return "FAA";
    if (host.includes("travis") && host.endsWith(".tx.us")) return "Travis County";
    if (host.endsWith("nasa.gov")) return "NASA";
    if (host.endsWith("usgs.gov")) return "USGS";
    if (host.endsWith("eia.gov")) return "EIA";
    if (host.endsWith("kosis.kr")) return "KOSIS";
    if (host.endsWith("dart.fss.or.kr") || host.endsWith("fss.or.kr")) return "DART";
    if (host.endsWith("nrc.gov")) return "NRC";
    if (host.endsWith("clinicaltrials.gov")) return "ClinicalTrials.gov";
    if (host.endsWith("wikipedia.org")) return "Wikipedia";
    if (host.endsWith("tesla.com") || host.endsWith("spacex.com") || host.endsWith("x.ai") || host.endsWith("neuralink.com") || host.endsWith("boringcompany.com")) return "IR / company site";
    if (host.endsWith(".gov")) return "Other government";
    return null;
  } catch {
    return null;
  }
}

/**
 * Aggregate a count of source URLs per provider bucket, sorted by count
 * descending. Used by the bibliography page header.
 */
export function getSourceProviderCounts(): Array<{ provider: string; count: number }> {
  const counts = new Map<string, number>();
  for (const group of getAllSourceGroups()) {
    for (const entry of group.entries) {
      const provider = classifySource(entry.url) ?? "Other";
      counts.set(provider, (counts.get(provider) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([provider, count]) => ({ provider, count }))
    .sort((a, b) => b.count - a.count);
}
