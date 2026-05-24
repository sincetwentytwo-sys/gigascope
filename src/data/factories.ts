import type { Company, Factory } from "./types";
import localData from "../../public/data/factories.json";

interface FactoryData {
  lastUpdated: string;
  totalInvestment: string;
  timelineYears: number[];
  factories: Factory[];
}

const data: FactoryData = localData as FactoryData;

export const DATA_LAST_UPDATED = data.lastUpdated;
export const TIMELINE_YEARS = data.timelineYears;
export const factories: Factory[] = data.factories;

export function getFactory(slug: string): Factory | undefined {
  return factories.find((f) => f.slug === slug);
}

export const getSite = getFactory;

export function getSitesByCompany(company: Company): Factory[] {
  return factories.filter((f) => f.company === company);
}

/**
 * Parse one `investment` string from factories.json into a USD-billions number.
 * Handles the four shapes the data actually uses:
 *   - "$X-YB"   → midpoint of X and Y
 *   - "$XB+"    → X (the "+" is a hint of "at least", but we don't speculate)
 *   - "$XB"     → X (optionally followed by " (est)")
 *   - "$XM..."  → X / 1000
 * Returns `null` for anything we can't confidently parse so the caller can skip.
 */
function parseInvestmentToBillions(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, "");
  // Range: $X-YB or $X-YM
  const range = cleaned.match(/^\$?(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)([BM])/i);
  if (range) {
    const lo = parseFloat(range[1]);
    const hi = parseFloat(range[2]);
    const mid = (lo + hi) / 2;
    return range[3].toUpperCase() === "M" ? mid / 1000 : mid;
  }
  // Single value: $XB, $XB+, $XM, $XM+, with optional "(est)" suffix
  const single = cleaned.match(/^\$?(\d+(?:\.\d+)?)([BM])/i);
  if (single) {
    const v = parseFloat(single[1]);
    return single[2].toUpperCase() === "M" ? v / 1000 : v;
  }
  return null;
}

/**
 * Dynamic total of declared site investments, rounded to the nearest billion.
 *
 * Caveat: this is a midpoint-of-stated-ranges estimate. Some sites publish
 * ranges (e.g. "$20-25B"), some publish floors ("$10B+"), some are explicitly
 * speculative ("$5B (est)"). We midpoint ranges, take the stated value for
 * floors and points, and divide millions by 1000. Sites without an
 * `investment` field are skipped. The result is an honest order-of-magnitude
 * figure, not an audited number.
 */
export function getTotalInvestment(): string {
  let totalB = 0;
  let counted = 0;
  for (const f of factories) {
    const v = parseInvestmentToBillions(f.investment as string | undefined);
    if (v !== null) {
      totalB += v;
      counted += 1;
    }
  }
  if (counted === 0) return data.totalInvestment;
  const rounded = Math.round(totalB);
  return `~$${rounded}B`;
}
