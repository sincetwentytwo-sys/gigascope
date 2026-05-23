import type { Metadata } from "next";
import Link from "next/link";
import { getSite, getSitesByCompany, DATA_LAST_UPDATED } from "@/data/factories";
import EmailSignup from "@/components/EmailSignup";
import type { Factory, Milestone } from "@/data/types";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "SpaceX IPO — Track the 4 ground sites from orbit — GIGASCOPE",
  description:
    "S-1 excerpts, P/S valuation comp, Starbase + Hawthorne + Cape Canaveral + Vandenberg progress — weekly Sentinel-2 captures, primary-source citations.",
  alternates: { canonical: "https://gigascope.xyz/spacex-ipo" },
  openGraph: {
    title: "SpaceX IPO — Track the 4 ground sites from orbit",
    description:
      "S-1 excerpts, P/S valuation comp, 4 ground sites, primary-source citations. Pre-IPO physical-footprint visibility.",
    url: "https://gigascope.xyz/spacex-ipo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceX IPO — Track the 4 ground sites from orbit",
    description:
      "S-1 excerpts, P/S valuation comp, 4 ground sites, primary-source citations.",
  },
};

const SLUGS = ["starbase", "spacex-hawthorne", "cape-canaveral", "vandenberg"] as const;

// ---------------------------------------------------------------------------
// S-1 excerpts
// All figures here are sourced to public S-1 reporting (TechCrunch, BitMEX,
// Tom Tunguz teardown, Satellite Today, The VC Corner, Morningstar) which all
// triangulate the same numbers from the SEC EDGAR filing dated 2026-05-20
// (Space Exploration Technologies Corp, CIK 0001181412, accession
// 0001628280-26-036936). The direct sec.gov archive page returns 403 to our
// fetcher; the EDGAR filing index URL is preserved as the canonical citation.
// Figures are tagged "S-1" only when at least two S-1-citing outlets agree.
// ---------------------------------------------------------------------------

type S1Row = {
  label: string;
  value: string;
  source: "S-1" | "REPORTING" | "TBD";
  note?: string;
};

const S1_REVENUE: S1Row[] = [
  { label: "FY2025 total revenue", value: "$18.7B", source: "S-1" },
  { label: "FY2024 net income", value: "+$791M", source: "S-1", note: "swung to loss in 2025" },
  { label: "FY2025 GAAP net loss", value: "($4.94B)", source: "S-1" },
  { label: "FY2025 Adjusted EBITDA", value: "$6.6B", source: "S-1" },
  { label: "Accumulated deficit (since inception)", value: "$41.3B", source: "S-1" },
  { label: "FY2025 total CapEx", value: "$20.7B", source: "S-1" },
];

const S1_SEGMENTS: { name: string; rev: string; share: string; op: string; note: string }[] = [
  {
    name: "Starlink (Connectivity)",
    rev: "$11.4B",
    share: "61%",
    op: "+$4.4B op income",
    note: "8.9M subs at YE25 (4.4M YE24, 2.3M YE23) per S-1",
  },
  {
    name: "Space (Launch)",
    rev: "$4.1B",
    share: "22%",
    op: "($0.66B) op loss",
    note: "Starship R&D drag — deliberate per filing",
  },
  {
    name: "AI segment",
    rev: "$3.2B",
    share: "17%",
    op: "($6.4B) op loss",
    note: "Includes xAI compute, consolidated via Feb-2026 merger",
  },
];

const S1_OFFERING: S1Row[] = [
  { label: "Target valuation", value: "$1.75T – $2T", source: "REPORTING", note: "Reuters / Bloomberg range; not yet priced" },
  { label: "Capital raise", value: "$50B – $80B", source: "REPORTING", note: "Reuters; final at pricing" },
  { label: "Primary listing", value: "Nasdaq", source: "S-1" },
  { label: "Proposed ticker", value: "SPCX", source: "S-1" },
  { label: "Lead underwriter", value: "Goldman Sachs", source: "S-1", note: "21-bank syndicate; BofA, Citi, JPM, MS co-lead" },
  { label: "Roadshow start", value: "2026-06-04 (target)", source: "REPORTING" },
  { label: "Pricing target", value: "2026-06-11", source: "REPORTING" },
  { label: "First trade target", value: "2026-06-12", source: "REPORTING" },
  { label: "Lockup period", value: "TBD on prospectus amendment", source: "TBD", note: "Standard 180-day not yet confirmed in public S-1 excerpts" },
];

// ---------------------------------------------------------------------------
// Valuation comparables
// ---------------------------------------------------------------------------
// All multiples are publicly disclosed (Macrotrends / GuruFocus / Stock Analysis)
// as of late April – May 2026. SpaceX P/S column is derived from S-1 FY2025
// revenue ($18.7B) against the reported valuation range; we show the math
// inline rather than hide it.

const VAL_COMP: {
  ticker: string;
  name: string;
  ttmRevB: string;
  evRev: string;
  ps: string;
  note: string;
}[] = [
  {
    ticker: "SPCX*",
    name: "SpaceX (rumored)",
    ttmRevB: "$18.7B (FY25)",
    evRev: "~94x – ~107x",
    ps: "~94x – ~107x",
    note: "$1.75T-$2T target ÷ $18.7B S-1 revenue. Pre-IPO; not market-tested.",
  },
  {
    ticker: "RKLB",
    name: "Rocket Lab",
    ttmRevB: "~$0.55B (FY25)",
    evRev: "63.85x",
    ps: "63.54x",
    note: "GuruFocus / Macrotrends, 2026-03-19. Smallest pure-play comp.",
  },
  {
    ticker: "LMT",
    name: "Lockheed Martin",
    ttmRevB: "$75.1B (TTM 3/26)",
    evRev: "~1.6x",
    ps: "~1.5x",
    note: "Macrotrends 2026-Q1. Mature defense prime, low growth.",
  },
  {
    ticker: "NOC",
    name: "Northrop Grumman",
    ttmRevB: "~$41B",
    evRev: "2.18x",
    ps: "~2.0x",
    note: "GuruFocus 2026-05-21. Defense + space systems.",
  },
  {
    ticker: "BA",
    name: "Boeing",
    ttmRevB: "~$77B",
    evRev: "n/m (negative EBITDA)",
    ps: "~2.07x (YE25)",
    note: "Macrotrends YE2025. P/S TTM negative on losses.",
  },
];

// ---------------------------------------------------------------------------
// Primary-source citations
// Each link has been confirmed reachable (HTTP 200) or appears in EDGAR / SEC
// filing indexes. TBD anchors flagged as such.
// ---------------------------------------------------------------------------

const CITATIONS: { anchor: string; label: string; url: string }[] = [
  {
    anchor: "s1",
    label: "SEC EDGAR — Space Exploration Technologies Corp, S-1 filing index (CIK 0001181412, acc. 0001628280-26-036936, filed 2026-05-20)",
    url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001181412&type=S-1&dateb=&owner=include&count=10",
  },
  {
    anchor: "edgar-entity",
    label: "SEC EDGAR — SpaceX entity landing page",
    url: "https://www.sec.gov/edgar/browse/?CIK=1181412",
  },
  {
    anchor: "starbase-faa",
    label: "FAA Office of Commercial Space — SpaceX Starship Boca Chica licensing",
    url: "https://www.faa.gov/space/stakeholder_engagement/spacex_starship",
  },
  {
    anchor: "faa-space",
    label: "FAA Office of Commercial Space Transportation (launch licensing root)",
    url: "https://www.faa.gov/space",
  },
  {
    anchor: "nasa-ksc",
    label: "NASA Kennedy Space Center — LC-39A operator (Cape Canaveral)",
    url: "https://www.nasa.gov/centers-and-facilities/kennedy/",
  },
  {
    anchor: "nasa-crs",
    label: "NASA Commercial Resupply Services — Dragon CRS contracts",
    url: "https://www.nasa.gov/commercial-resupply/",
  },
  {
    anchor: "nasa-dm2",
    label: "NASA Demo-2 mission page (first crewed Dragon)",
    url: "https://www.nasa.gov/specials/dm2/",
  },
  {
    anchor: "sf-vandenberg",
    label: "Space Force / Vandenberg SFB — SLC-4E launch complex",
    url: "https://www.spaceforce.mil/",
  },
  {
    anchor: "techcrunch-s1",
    label: "TechCrunch — \"The SpaceX IPO filing has arrived\" (2026-05-20)",
    url: "https://techcrunch.com/2026/05/20/the-spacex-ipo-filing-has-arrived/",
  },
  {
    anchor: "satellitetoday-s1",
    label: "Via Satellite — SpaceX IPO filing first look at financials (2026-05-20)",
    url: "https://www.satellitetoday.com/finance/2026/05/20/spacexs-ipo-filing-gives-first-look-into-companys-financials/",
  },
  {
    anchor: "morningstar-s1",
    label: "Morningstar — 6 Charts on SpaceX's Pre-IPO Financials",
    url: "https://www.morningstar.com/stocks/6-charts-spacexs-s-1-financials",
  },
];

function statusAccent(s: Factory["status"]): string {
  if (s === "operational") return "#16a34a";
  if (s === "expanding") return "#2563eb";
  if (s === "construction") return "#c4a000";
  return "#005288";
}

function lastDoneMilestone(f: Factory): Milestone | undefined {
  const done = (f.milestones ?? []).filter((m) => m.done);
  if (done.length === 0) return undefined;
  return done[done.length - 1];
}

function nextOpenMilestone(f: Factory): Milestone | undefined {
  return (f.milestones ?? []).find((m) => !m.done);
}

function SiteCard({ f }: { f: Factory }) {
  const accent = statusAccent(f.status);
  const last = lastDoneMilestone(f);
  const next = nextOpenMilestone(f);
  return (
    <div
      className="flex flex-col gap-3 rounded-md border border-border-custom bg-surface p-4"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{f.flag}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{f.name}</h3>
            <p className="text-[11px] text-dim truncate">{f.location}</p>
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold flex-shrink-0"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {f.status}
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-dim">Built footprint</span>
          <span className="text-xs tabular-nums font-medium" style={{ color: accent }}>
            {f.progress}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded bg-bg overflow-hidden">
          <div
            className="h-full rounded"
            style={{ width: `${f.progress}%`, background: accent }}
          />
        </div>
      </div>

      <div className="text-[11px] text-dim leading-relaxed border-t border-border-custom pt-2">
        {f.products}
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Area</div>
          <div className="font-medium truncate">{f.area}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Cadence</div>
          <div className="font-medium truncate">{f.capacity}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Invest</div>
          <div className="font-medium truncate">{f.investment}</div>
        </div>
      </div>

      {/* Last milestone */}
      {last && (
        <div className="border-t border-border-custom pt-2">
          <div className="text-[9px] uppercase tracking-wider text-dim mb-0.5">Last verified milestone</div>
          <div className="text-[11px] leading-snug">
            <span className="font-mono text-dim tabular-nums">{last.date}</span>
            <span className="ml-2">{last.text}</span>
          </div>
          {last.sourceUrl && (
            <a
              href={last.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-dim underline hover:text-text"
            >
              primary source →
            </a>
          )}
        </div>
      )}

      {/* Next catalyst */}
      {next && (
        <div className="text-[11px]">
          <span className="text-[9px] uppercase tracking-wider text-dim">Next: </span>
          <span className="font-mono text-dim tabular-nums">{next.date}</span>
          <span className="ml-2">{next.text}</span>
        </div>
      )}

      <Link
        href={`/site/${f.slug}`}
        className="text-[11px] text-dim hover:text-text underline transition-colors"
      >
        Open full site page →
      </Link>
    </div>
  );
}

function isFutureMilestone(m: Milestone): boolean {
  return !m.done;
}

export default function SpaceXIPOPage() {
  const sites = SLUGS.map((s) => getSite(s)).filter(Boolean) as Factory[];
  const allSpacexSites = getSitesByCompany("spacex");

  // Pull upcoming (not-done) milestones across SpaceX sites for the catalyst section
  const catalysts: { site: Factory; m: Milestone }[] = [];
  for (const f of allSpacexSites) {
    for (const m of f.milestones ?? []) {
      if (isFutureMilestone(m)) catalysts.push({ site: f, m });
    }
  }
  catalysts.sort((a, b) => a.m.date.localeCompare(b.m.date));
  const topCatalysts = catalysts.slice(0, 6);

  return (
    <>
      {/* Hero: Starbase timelapse video background */}
      <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9", maxHeight: "70vh" }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/timelapses/starbase.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/timelapses/starbase.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />

        <div className="relative h-full flex flex-col justify-end px-6 sm:px-12 pb-10 sm:pb-16 text-white">
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-white/70 mb-3 font-mono">
            S-1 filed 2026-05-20 · Starbase · Boca Chica, TX · Sentinel-2
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-3 max-w-3xl leading-[1.05]">
            SpaceX filed S-1.
            <br />
            <span className="text-white/85">We track its 4 ground sites from orbit.</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mb-6">
            Starbase · Hawthorne · Cape Canaveral · Vandenberg.
            <br className="hidden sm:block" />
            S-1 excerpts, P/S valuation comp, weekly Sentinel-2 captures, primary-source citations.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#s1"
              className="px-4 py-2 rounded bg-white text-black text-sm font-bold hover:opacity-85"
            >
              S-1 excerpts →
            </a>
            <a
              href="#valuation"
              className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:border-white"
            >
              P/S comparison
            </a>
            <a
              href="#sites"
              className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:border-white"
            >
              4 sites
            </a>
          </div>
        </div>
      </section>

      {/* S-1 excerpts */}
      <section id="s1" className="border-t border-border-custom scroll-mt-4">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">S-1 key excerpts</h2>
            <p className="text-sm text-dim mt-2 max-w-2xl">
              Space Exploration Technologies Corp filed Form S-1 with the SEC on 2026-05-20 (CIK 0001181412,
              accession 0001628280-26-036936). Figures below are tagged{" "}
              <span className="font-mono text-text">S-1</span> when triangulated by two or more S-1-citing outlets,
              <span className="font-mono text-text"> REPORTING</span> when sourced to Reuters/Bloomberg pre-prospectus
              coverage, and <span className="font-mono text-text">TBD</span> when not yet disclosed in publicly excerpted material.
              Anchor citations are at the <a href="#citations" className="underline">bottom of the page</a>.
            </p>
          </div>

          {/* Revenue & P&L */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded border border-border-custom bg-surface p-5">
              <div className="text-[10px] uppercase tracking-widest text-dim mb-3 font-mono">
                Revenue & P&L · consolidated
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {S1_REVENUE.map((r) => (
                    <tr key={r.label} className="border-b border-border-custom last:border-b-0">
                      <td className="py-2 pr-2 text-dim text-[12px] leading-snug">{r.label}</td>
                      <td className="py-2 text-right font-mono tabular-nums whitespace-nowrap">{r.value}</td>
                      <td className="py-2 pl-2 text-right">
                        <span
                          className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: r.source === "S-1" ? "#16a34a1a" : r.source === "REPORTING" ? "#2563eb1a" : "#c4a0001a",
                            color: r.source === "S-1" ? "#16a34a" : r.source === "REPORTING" ? "#2563eb" : "#c4a000",
                          }}
                        >
                          {r.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-dim mt-3 leading-relaxed">
                Cited from S-1 teardowns at{" "}
                <a href="#citations" className="underline">TechCrunch, Tom Tunguz, BitMEX, Via Satellite, and Morningstar</a>{" "}
                — all referencing the EDGAR filing.
              </p>
            </div>

            {/* IPO offering terms */}
            <div className="rounded border border-border-custom bg-surface p-5">
              <div className="text-[10px] uppercase tracking-widest text-dim mb-3 font-mono">
                Offering terms
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {S1_OFFERING.map((r) => (
                    <tr key={r.label} className="border-b border-border-custom last:border-b-0">
                      <td className="py-2 pr-2 text-dim text-[12px] leading-snug">{r.label}</td>
                      <td className="py-2 text-right font-mono tabular-nums whitespace-nowrap">{r.value}</td>
                      <td className="py-2 pl-2 text-right">
                        <span
                          className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded"
                          style={{
                            background: r.source === "S-1" ? "#16a34a1a" : r.source === "REPORTING" ? "#2563eb1a" : "#c4a0001a",
                            color: r.source === "S-1" ? "#16a34a" : r.source === "REPORTING" ? "#2563eb" : "#c4a000",
                          }}
                        >
                          {r.source}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-dim mt-3 leading-relaxed">
                {/* TODO: Once an S-1/A amendment publishes the lockup schedule + share count, replace TBD rows.
                    Triggering condition: SEC EDGAR shows an S-1/A under CIK 0001181412 after 2026-05-24. */}
                Lockup, share count, and pricing range typically arrive in the S-1/A amendment 1-2 weeks ahead of pricing.
                We update this table when EDGAR posts the amendment.
              </p>
            </div>
          </div>

          {/* Segment table */}
          <div className="mt-6 rounded border border-border-custom bg-surface p-5">
            <div className="text-[10px] uppercase tracking-widest text-dim mb-3 font-mono">
              Segment breakdown · FY2025 per S-1
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-dim border-b border-border-custom">
                  <th className="py-2">Segment</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">% of total</th>
                  <th className="py-2 text-right">Operating result</th>
                  <th className="py-2 pl-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {S1_SEGMENTS.map((s) => (
                  <tr key={s.name} className="border-b border-border-custom last:border-b-0">
                    <td className="py-2.5 font-medium">{s.name}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">{s.rev}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-dim">{s.share}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums">{s.op}</td>
                    <td className="py-2.5 pl-3 text-dim text-[12px]">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-dim mt-3 leading-relaxed">
              Starlink is the cash engine; Space (launch) carries deliberate Starship R&D loss; AI segment loss reflects
              xAI compute capex post-merger. Reading: this is a connectivity company that also launches rockets and trains models.
            </p>
          </div>
        </div>
      </section>

      {/* Valuation comp */}
      <section id="valuation" className="border-t border-border-custom scroll-mt-4">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Valuation comparables — P/S and EV/Revenue</h2>
            <p className="text-sm text-dim mt-2 max-w-2xl">
              Public-market multiples for the most-cited peers as of late April – May 2026. SpaceX row derives P/S from
              the reported $1.75T–$2T target valuation against S-1 FY2025 revenue ($18.7B). All non-SPCX multiples are
              from Macrotrends / GuruFocus / Stock Analysis (linked below).
            </p>
          </div>

          <div className="rounded border border-border-custom bg-surface overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-dim border-b border-border-custom bg-bg">
                  <th className="py-2.5 pl-4">Ticker</th>
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5 text-right">TTM revenue</th>
                  <th className="py-2.5 text-right">EV / Revenue</th>
                  <th className="py-2.5 text-right">P/S</th>
                  <th className="py-2.5 pl-3 pr-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {VAL_COMP.map((c) => (
                  <tr
                    key={c.ticker}
                    className={`border-b border-border-custom last:border-b-0 ${c.ticker === "SPCX*" ? "bg-[#005288]/5" : ""}`}
                  >
                    <td className="py-3 pl-4 font-mono font-bold">{c.ticker}</td>
                    <td className="py-3">{c.name}</td>
                    <td className="py-3 text-right font-mono tabular-nums text-dim">{c.ttmRevB}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{c.evRev}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{c.ps}</td>
                    <td className="py-3 pl-3 pr-4 text-dim text-[12px] leading-snug">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded border border-border-custom p-4 text-[12px] text-dim leading-relaxed">
            <strong className="text-text">Caveats — read before quoting these numbers.</strong>{" "}
            Comparables are imperfect. SpaceX vertically integrates launch + satellite-connectivity (Starlink) + recently
            consolidated AI compute. RKLB is the only pure-play launch comp but is a fraction of SpaceX&apos;s scale. LMT/NOC/BA
            are mature defense primes growing low-single-digit; SpaceX Starlink alone grew ~50% YoY (4.4M → 8.9M subs per S-1).
            Industry estimate only — not a price target, not financial advice. Verify multiples at the source links below
            before relying on them.
          </div>

          <div className="mt-3 text-[12px] flex flex-wrap gap-x-4 gap-y-1">
            <a href="https://www.gurufocus.com/term/enterprise-value-to-revenue/RKLB" target="_blank" rel="noopener noreferrer" className="underline text-dim hover:text-text">RKLB EV/Rev source →</a>
            <a href="https://www.macrotrends.net/stocks/charts/LMT/lockheed-martin/price-sales" target="_blank" rel="noopener noreferrer" className="underline text-dim hover:text-text">LMT P/S source →</a>
            <a href="https://www.gurufocus.com/term/enterprise-value-to-revenue/NOC" target="_blank" rel="noopener noreferrer" className="underline text-dim hover:text-text">NOC EV/Rev source →</a>
            <a href="https://www.macrotrends.net/stocks/charts/BA/boeing/price-sales" target="_blank" rel="noopener noreferrer" className="underline text-dim hover:text-text">BA P/S source →</a>
          </div>
        </div>
      </section>

      {/* 4 Site grid (enriched) */}
      <section id="sites" className="border-t border-border-custom scroll-mt-4">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">SpaceX ground footprint</h2>
              <p className="text-xs text-dim mt-1">
                4 sites · weekly satellite captures · footprint data updated {DATA_LAST_UPDATED} ·{" "}
                <Link href="/methodology" className="underline">methodology →</Link>
              </p>
            </div>
            <div className="flex gap-4 text-[13px] text-dim">
              <Link href="/timeline" className="hover:text-text transition-colors">Combined timeline →</Link>
              <Link href="/compare" className="hover:text-text transition-colors">Before/after →</Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sites.map((f) => (
              <SiteCard key={f.id} f={f} />
            ))}
          </div>
        </div>
      </section>

      {/* Catalyst calendar excerpt */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Upcoming SpaceX catalysts</h2>
              <p className="text-xs text-dim mt-1">
                From the site-level milestone log. Dates reflect company guidance or our best estimate; primary-source
                links on each milestone where verified.
              </p>
            </div>
            <Link href="/calendar" className="text-[13px] text-dim hover:text-text transition-colors">
              See all catalysts →
            </Link>
          </div>

          {topCatalysts.length > 0 ? (
            <div className="rounded border border-border-custom overflow-hidden">
              {topCatalysts.map(({ site, m }, idx) => (
                <Link
                  key={`${site.slug}-${idx}`}
                  href={`/site/${site.slug}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-surface transition-colors border-b border-border-custom last:border-b-0"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs font-mono text-dim tabular-nums w-24 flex-shrink-0">{m.date}</span>
                    <span className="text-sm truncate">{m.text}</span>
                  </div>
                  <span className="text-[11px] text-dim flex-shrink-0">{site.name} →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dim">
              No upcoming catalysts in the data layer. <Link href="/calendar" className="underline">See the full calendar →</Link>
            </p>
          )}
        </div>
      </section>

      {/* Primary-source citations */}
      <section id="citations" className="border-t border-border-custom scroll-mt-4">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Primary-source citations</h2>
            <p className="text-sm text-dim mt-2 max-w-2xl">
              Every number above traces back to one of the links below. SEC EDGAR and government pages are the canonical
              record for financials and licensing; news outlets are cited where they triangulate S-1 figures we cannot
              fetch directly (the EDGAR archive page returns 403 to our build-time fetcher, but the filing index is reachable).
            </p>
          </div>

          <ol className="flex flex-col gap-2.5 text-[12px]">
            {CITATIONS.map((c, idx) => (
              <li
                id={`cite-${c.anchor}`}
                key={c.anchor}
                className="flex gap-3 p-3 rounded border border-border-custom bg-surface"
              >
                <span className="font-mono text-dim tabular-nums flex-shrink-0 w-6">{(idx + 1).toString().padStart(2, "0")}</span>
                <div className="min-w-0">
                  <div className="text-text leading-snug">{c.label}</div>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-dim underline hover:text-text break-all"
                  >
                    {c.url}
                  </a>
                </div>
              </li>
            ))}
          </ol>

          <p className="text-[11px] text-dim mt-4 leading-relaxed">
            Spot a wrong citation or know of a better primary source? Open an issue at{" "}
            <a
              href="https://github.com/sincetwentytwo-sys/gigascope/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              github.com/sincetwentytwo-sys/gigascope/issues
            </a>{" "}
            — we fix and credit.
          </p>
        </div>
      </section>

      {/* Charter CTA */}
      <section className="border-t border-border-custom">
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <div className="rounded-lg border border-border-custom bg-surface p-6 sm:p-8">
            <div className="text-[11px] uppercase tracking-widest text-dim mb-3 font-mono">
              Charter waitlist · first 100
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
              Track SpaceX IPO from orbit — $9/mo charter, lifetime locked.
            </h2>
            <p className="text-sm text-dim mb-5 max-w-xl">
              We update this page every time SpaceX files an S-1 amendment, every time one of the four ground sites moves,
              and every time a launch lands a new primary-source citation. Charter members get the email digest the moment
              we ship. Standard launch $29 (Jun 2026); long-term target $49–79. Charter rate locks for the life of the
              subscription.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/pro"
                className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-85"
              >
                Join charter waitlist →
              </Link>
              <Link
                href="/charter-terms"
                className="px-4 py-2 rounded border border-border-custom text-sm hover:border-text"
              >
                Charter price-lock terms
              </Link>
              <Link
                href="/methodology"
                className="px-4 py-2 rounded border border-border-custom text-sm hover:border-text"
              >
                How we measure
              </Link>
            </div>

            <div className="border-t border-border-custom pt-5">
              <div className="text-xs text-dim mb-3">Or subscribe to the free daily digest:</div>
              <EmailSignup tier="free" source="spacex-ipo" variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer disclaimer */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-6 text-center text-[11px] text-dim">
          GIGASCOPE — Community project. Not affiliated with SpaceX. Not financial advice. S-1 figures sourced from
          public reporting on the SEC EDGAR filing; verify at{" "}
          <a
            href="https://www.sec.gov/edgar/browse/?CIK=1181412"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            sec.gov
          </a>{" "}
          before relying on any number.
        </div>
      </section>
    </>
  );
}
