/**
 * Private companies tracked in the Atlas without a stock ticker.
 *
 * These get their own pages because they're load-bearing in the frontier-tech
 * story — but valuations are estimates, not market-quoted. Always cite the
 * funding round and date for any numeric claim.
 */

import type { SectorId, Source, Facility } from "./tickers";

export interface PrivateCompany {
  slug: string;
  name: string;
  koreanName?: string;
  hq: string;
  ceo?: string;
  founded?: number;
  website?: string;
  sectors: SectorId[];
  /** Estimated valuation in USD billions (use est. label) */
  valuationB?: number;
  /** As-of date for the valuation estimate */
  valuationAsOf?: string;
  /** Source of valuation (round name, journalist scoop) */
  valuationSource?: string;
  thesis: string;
  deepDive?: string;
  bullCase: string[];
  bearCase: string[];
  catalysts?: Array<{ date: string; label: string; confidence?: "high" | "medium" | "low" | "speculative" }>;
  sources?: Source[];
  facilities?: Facility[];
  accent?: string;
  featured?: boolean;
  /** Linked factories slug (if these companies map to factory sites we track) */
  relatedSites?: string[];
  /** Linked products */
  relatedProducts?: string[];
  /** Linked public ticker symbols for comparison */
  relatedTickers?: string[];
}

export const PRIVATE_COMPANIES: PrivateCompany[] = [
  {
    slug: "spacex",
    name: "SpaceX",
    hq: "Hawthorne, CA",
    ceo: "Elon Musk",
    founded: 2002,
    website: "https://www.spacex.com",
    sectors: ["musk-empire", "defense-space"],
    valuationB: 350,
    valuationAsOf: "2024-12",
    valuationSource: "Secondary tender offer at $185B → $350B target reported by Bloomberg, FT (Dec 2024).",
    thesis:
      "The only company that has commoditized orbital launch + is on a credible path to interplanetary transport. Starlink is a >$10B-revenue business by 2026, funding Starship development internally.",
    deepDive:
      "SpaceX is the only company in human history that has demonstrated full-stack reusable orbital launch at scale: Falcon 9 has flown 400+ missions with first-stage recovery rates above 95%. The 2025-2026 inflection is Starship — full-stack reusability of a vehicle that can put 100-150 tonnes to LEO, dwarfing every other launcher ever built. The economic gate is Starship reuse cadence; once achieved, launch cost per kg-to-LEO drops by 1-2 orders of magnitude, which unlocks lunar cargo, Mars architecture, and the Starlink V3 satellite generation. Starlink — the orbital broadband constellation — is independently the largest LEO satellite operator (~7,000 active satellites as of mid-2026), generating >$10B in annualized revenue with positive operating cash flow. Starlink's strategic value extends beyond consumer broadband: Starshield is the DoD variant, with multi-billion-dollar contracts under the National Reconnaissance Office's Proliferated Architecture program. The valuation question for a private market: how do you discount the optionality of being the lead provider of orbital infrastructure for the next 30 years vs. Starship execution risk?",
    bullCase: [
      "Starship 2nd-gen integrated flight tests succeeding at production cadence.",
      "Starlink V3 buildout would 5× downlink capacity per satellite.",
      "Starshield (DoD-variant) winning structural national-security contracts.",
      "Optionality on lunar/Mars architecture under contract from NASA Artemis.",
    ],
    bearCase: [
      "Starship reuse remains the binary unproven step.",
      "Starlink consumer ARPU compression in mature markets.",
      "Key-person concentration on Musk + Shotwell.",
      "Single-launch-pad exposure (Boca Chica + LC-39A) until additional sites mature.",
    ],
    catalysts: [
      { date: "2026", label: "Starship orbital refueling demo", confidence: "medium" },
      { date: "2026-2027", label: "Starlink V3 LEO buildout", confidence: "high" },
      { date: "2027", label: "Crewed Artemis III lunar lander mission", confidence: "medium" },
    ],
    sources: [
      { label: "SpaceX official website", url: "https://www.spacex.com", tier: 1 },
      { label: "Starlink coverage map + ARPU disclosures", url: "https://www.starlink.com", tier: 1 },
      { label: "Bloomberg secondary tender reports", url: "https://www.bloomberg.com", tier: 2 },
    ],
    facilities: [
      { name: "Starbase (Boca Chica)", city: "Brownsville, TX", country: "USA", flag: "🇺🇸", lat: 25.997, lng: -97.156, status: "operational", siteSlug: "starbase", blurb: "Starship integrated launch + manufacturing." },
      { name: "Hawthorne HQ + Falcon production", city: "Hawthorne, CA", country: "USA", flag: "🇺🇸", lat: 33.9206, lng: -118.3279, status: "operational" },
      { name: "Cape Canaveral LC-39A", city: "Cape Canaveral, FL", country: "USA", flag: "🇺🇸", lat: 28.6082, lng: -80.6041, status: "operational", siteSlug: "cape-canaveral" },
      { name: "Vandenberg SLC-4", city: "Vandenberg, CA", country: "USA", flag: "🇺🇸", lat: 34.6332, lng: -120.6111, status: "operational" },
    ],
    accent: "#005288",
    featured: true,
    relatedSites: ["starbase", "cape-canaveral", "starlink-bothell"],
    relatedProducts: ["raptor", "falcon9", "starship"],
    relatedTickers: ["RKLB", "TSLA"],
  },
  {
    slug: "xai",
    name: "xAI",
    hq: "San Francisco, CA",
    ceo: "Elon Musk",
    founded: 2023,
    website: "https://x.ai",
    sectors: ["musk-empire", "robotics-ai"],
    valuationB: 75,
    valuationAsOf: "2025-Q4",
    valuationSource: "Series-C raise at $75B reported by FT, WSJ (2025).",
    thesis:
      "Fastest-built frontier-AI compute footprint in history: Colossus 100K H100 cluster operational in 122 days from greenfield. Grok positioned as the X-distributed alternative to OpenAI/Anthropic.",
    bullCase: [
      "Colossus expansion to 200K H100 + 50K H200 underway, plus Colossus 2 (Memphis).",
      "Distribution via X gives day-1 user reach no other foundation-model lab has.",
      "Cross-pollination with Tesla AI4/AI5 + Optimus + FSD provides a unique data corpus.",
    ],
    bearCase: [
      "Grok still trails GPT-5 + Claude 3.5/4 on top-end benchmarks.",
      "Power and water demand from Colossus is generating local opposition.",
      "Burn rate consistent with raising every 12-18 months.",
    ],
    sources: [
      { label: "xAI Colossus announcement", url: "https://x.ai/colossus", tier: 1 },
      { label: "FT — xAI Series C report", url: "https://www.ft.com", tier: 2 },
    ],
    facilities: [
      { name: "Colossus (Memphis)", city: "Memphis, TN", country: "USA", flag: "🇺🇸", lat: 35.1495, lng: -90.0490, status: "expanding", siteSlug: "colossus", blurb: "Largest single AI training cluster on Earth." },
      { name: "xAI HQ", city: "San Francisco, CA", country: "USA", flag: "🇺🇸", lat: 37.7749, lng: -122.4194, status: "operational" },
    ],
    accent: "#7b2dbd",
    featured: true,
    relatedSites: ["colossus"],
    relatedTickers: ["NVDA", "TSLA"],
  },
  {
    slug: "anduril",
    name: "Anduril Industries",
    hq: "Costa Mesa, CA",
    ceo: "Brian Schimpf",
    founded: 2017,
    website: "https://www.anduril.com",
    sectors: ["defense-space", "robotics-ai"],
    valuationB: 28,
    valuationAsOf: "2024-08",
    valuationSource: "Series F at $28B led by Founders Fund (Aug 2024).",
    thesis:
      "The Palmer-Luckey defense-prime challenger. Lattice software platform + Ghost / Roadrunner / Fury hardware programs. Replicator-era poster child for autonomous-weapons procurement reform.",
    bullCase: [
      "DoD Replicator initiative explicitly favors low-cost autonomous platforms — Anduril's wheelhouse.",
      "CCA (Collaborative Combat Aircraft) program win against legacy primes.",
      "Lattice OS is the most-deployed autonomy software in DoD use.",
    ],
    bearCase: [
      "Defense procurement cycles measured in years, not quarters.",
      "Hardware diversification stretches R&D budget.",
      "Pre-IPO discount, no public price discovery yet.",
    ],
    sources: [
      { label: "Anduril press releases", url: "https://www.anduril.com/articles/", tier: 1 },
      { label: "DoD CCA contract awards", url: "https://www.af.mil/News/", tier: 1 },
    ],
    accent: "#000000",
    featured: true,
    relatedTickers: ["PLTR", "LMT"],
  },
  {
    slug: "helion",
    name: "Helion Energy",
    hq: "Everett, WA",
    ceo: "David Kirtley",
    founded: 2013,
    website: "https://www.helionenergy.com",
    sectors: ["fusion-nuclear"],
    valuationB: 5,
    valuationAsOf: "2024-Q2",
    valuationSource: "Series E led by Sam Altman, SoftBank (2024).",
    thesis:
      "Aiming for net-electric fusion using a field-reversed configuration with D-He3 fuel. Microsoft signed a PPA for 50 MW by 2028 — the most aggressive private fusion timeline ever committed in writing.",
    bullCase: [
      "Polaris 7th-gen prototype targeting net electricity in 2024-2025.",
      "MSFT PPA gives a credible commercial timeline (vs ITER's perpetual horizon).",
      "Pulsed-fusion architecture sidesteps continuous-plasma confinement problems.",
    ],
    bearCase: [
      "Net-electric fusion has been '5 years away' for 70 years.",
      "Tritium / Helium-3 fuel-cycle questions unresolved.",
      "MSFT PPA contains performance contingencies; not a hard contract.",
    ],
    sources: [
      { label: "Helion Polaris announcement", url: "https://www.helionenergy.com/articles/", tier: 1 },
      { label: "MSFT-Helion PPA disclosure", url: "https://news.microsoft.com/source/", tier: 1 },
    ],
    accent: "#00875a",
    relatedTickers: ["MSFT", "OKLO"],
  },
  {
    slug: "commonwealth-fusion",
    name: "Commonwealth Fusion Systems",
    hq: "Devens, MA",
    ceo: "Bob Mumgaard",
    founded: 2018,
    website: "https://cfs.energy",
    sectors: ["fusion-nuclear"],
    valuationB: 3,
    valuationAsOf: "2021-Q4",
    valuationSource: "Series B at $1.8B post-money (Dec 2021); reported newer rounds in process.",
    thesis:
      "MIT spinoff using high-temperature superconducting (HTS) magnets for compact tokamak fusion. SPARC demonstration reactor under construction in Devens MA, targeting Q>1 by 2027.",
    bullCase: [
      "HTS magnet breakthrough fundamentally shrinks tokamak size + capex.",
      "Strong technical pedigree (PSFC / MIT) and DoE collaboration.",
      "Path from SPARC demonstration to ARC commercial reactor is articulated.",
    ],
    bearCase: [
      "First-of-a-kind hardware risk.",
      "Cryogenic and high-field magnet manufacturing scaling unproven.",
      "Long timeline before commercial operations.",
    ],
    sources: [
      { label: "Commonwealth Fusion CFS news", url: "https://cfs.energy/news-and-media", tier: 1 },
      { label: "MIT PSFC + SPARC publications", url: "https://www.psfc.mit.edu/research/topics/sparc", tier: 1 },
    ],
    accent: "#0066cc",
    relatedTickers: ["OKLO", "CCJ"],
  },
];

export function listPrivateCompanies(): PrivateCompany[] {
  return PRIVATE_COMPANIES;
}

export function getPrivateCompany(slug: string): PrivateCompany | undefined {
  return PRIVATE_COMPANIES.find((c) => c.slug === slug);
}
