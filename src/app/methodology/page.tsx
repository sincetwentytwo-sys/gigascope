// /methodology — the trust-signal page.
//
// This page exists for one reason: when a skeptical reader asks "where does
// the % come from?", we hand them this URL and they walk away convinced (or
// at least convinced we know the limits). The page surfaces:
//   - Real imagery sources we use, with resolution + refresh cadence
//   - The polygon-trace progress formula
//   - Per-site last-capture date AND timelapse frame count (from the index)
//   - Confidence framework (high / medium / low / speculative) used in JSON
//   - Honest limitations list
//   - Citation policy

import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { factories, DATA_LAST_UPDATED } from "@/data/factories";
import { getEmpireStats, formatCount } from "@/lib/pulse";

type TimelapseMeta = { frames: number; latest: string; builtAt: string };
const timelapseIndexPath = resolve(process.cwd(), "public", "timelapses", "index.json");
const TIMELAPSE_INDEX: Record<string, TimelapseMeta> = existsSync(timelapseIndexPath)
  ? JSON.parse(readFileSync(timelapseIndexPath, "utf8"))
  : {};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Methodology — How we count progress — GIGASCOPE",
  description:
    "Imagery sources, polygon-trace formula, capture cadence, confidence framework, and the honest list of what satellite data cannot tell you. Every site's last-capture date + frame count.",
  alternates: { canonical: "https://gigascope.xyz/methodology" },
  openGraph: {
    title: "Methodology — How we count progress — GIGASCOPE",
    description:
      "Sentinel-2 + ESRI imagery, polygon-trace progress, capture cadence per site, confidence framework, honest limits.",
    url: "https://gigascope.xyz/methodology",
    type: "website",
  },
};

const IMAGERY = [
  {
    name: "ESRI World Imagery",
    res: "~30 cm/pixel (urban) · ~1 m elsewhere",
    refresh: "3-6 months",
    cost: "free",
    status: "live",
    url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9",
  },
  {
    name: "Copernicus Sentinel-2 (L2A, EOX mosaic)",
    res: "10 m/pixel",
    refresh: "annual cloudless mosaic (2024 current)",
    cost: "free",
    status: "live",
    url: "https://s2maps.eu/",
  },
  {
    name: "Planet Labs PlanetScope",
    res: "3 m/pixel",
    refresh: "daily revisit",
    cost: "paid",
    status: "not wired",
    url: "https://www.planet.com/products/planet-imagery/",
  },
  {
    name: "Maxar WorldView",
    res: "30 cm/pixel",
    refresh: "on demand",
    cost: "paid",
    status: "not wired",
    url: "https://www.maxar.com/products/satellite-imagery",
  },
];

const CONFIDENCE_TIERS = [
  {
    tier: "high",
    color: "var(--green)",
    description:
      "Primary source verified (FAA filing, SEC EDGAR, county permit, IR press release) + cross-checked with satellite imagery. Date and event both confirmed.",
  },
  {
    tier: "medium",
    color: "var(--blue)",
    description:
      "Multiple secondary sources agree (trade press, beat reporters, official social posts). No conflicting primary source.",
  },
  {
    tier: "low",
    color: "var(--amber)",
    description:
      "Inferred from satellite delta alone. A structure appeared, but we have not yet matched it to an authoritative filing.",
  },
  {
    tier: "speculative",
    color: "#c4a000",
    description:
      "Company-stated future plan or executive statement. Not yet attempted, may slip or never start.",
  },
];

export default function MethodologyPage() {
  const stats = getEmpireStats();
  const sitesWithTimelapse = factories.filter((f) => TIMELAPSE_INDEX[f.slug]);
  const totalFrames = stats.satelliteFrames;
  const avgFrames = sitesWithTimelapse.length > 0
    ? Math.round(totalFrames / sitesWithTimelapse.length)
    : 0;

  return (
    <div className="bg-bg text-text">
      {/* Hero */}
      <header className="border-b border-border-custom">
        <div className="max-w-[1000px] mx-auto px-6 py-12 sm:py-16">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-3">
            Methodology · how we count
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.05]">
            Where the numbers come from.
          </h1>
          <p className="text-dim text-base sm:text-lg max-w-2xl leading-relaxed">
            Two free satellite sources, polygon traces drawn by hand, and a confidence
            framework that says "speculative" out loud when something is speculative. No black
            box, no robot pixel-counter, no audited capacity claims.
          </p>
          <p className="text-[11px] font-mono text-dim mt-5">
            Last refreshed {DATA_LAST_UPDATED} · Most recent capture {stats.latestCaptureDate || "—"}
          </p>
        </div>
      </header>

      {/* Quick scoreboard */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1000px] mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-custom rounded-md overflow-hidden border border-border-custom">
            <Mini label="Sites tracked" value={String(stats.sites)} sub="static dataset" />
            <Mini label="Satellite frames" value={formatCount(totalFrames)} sub={`avg ${avgFrames} per site`} />
            <Mini label="Milestones" value={String(stats.milestonesTracked)} sub={`${stats.milestonesDone} verified`} />
            <Mini label="Sources cited" value={String(stats.sourcesCited)} sub="primary-source links" />
          </div>
        </div>
      </section>

      <div className="max-w-[1000px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-x-12 gap-y-12">
        <article className="min-w-0">
          {/* 1. Imagery sources */}
          <section id="imagery" className="mb-14">
            <SectionLabel>1 · Imagery</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              The four sources we'd use. The two we actually do.
            </h2>
            <p className="text-dim mb-5 leading-relaxed">
              ESRI World Imagery and Copernicus Sentinel-2 are both free, both with predictable
              refresh, and together cover every site on the list. Planet and Maxar are higher
              cadence + resolution but cost real money — both are on the build list, neither
              is yet wired.
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-custom text-[10px] uppercase tracking-wider text-dim font-mono">
                    <th className="py-2 pr-3 text-left">Source</th>
                    <th className="py-2 pr-3 text-left">Resolution</th>
                    <th className="py-2 pr-3 text-left">Refresh</th>
                    <th className="py-2 pr-3 text-left">Cost</th>
                    <th className="py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {IMAGERY.map((i) => (
                    <tr key={i.name} className="border-b border-border-custom">
                      <td className="py-3 pr-3 align-top">
                        <a
                          href={i.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-text"
                        >
                          {i.name}
                        </a>
                      </td>
                      <td className="py-3 pr-3 text-dim align-top">{i.res}</td>
                      <td className="py-3 pr-3 text-dim align-top">{i.refresh}</td>
                      <td className="py-3 pr-3 text-dim align-top">{i.cost}</td>
                      <td className="py-3 align-top">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border ${
                            i.status === "live"
                              ? "text-accent-green border-accent-green/40 bg-accent-green/10"
                              : "text-dim border-border-custom bg-surface"
                          }`}
                        >
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Progress formula */}
          <section id="progress" className="mb-14">
            <SectionLabel>2 · Progress</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Built area ÷ planned area. Polygons drawn by hand.
            </h2>
            <div className="rounded-md border border-border-custom bg-surface px-5 py-6 mb-5 font-mono text-sm sm:text-base">
              <div className="text-[10px] uppercase tracking-widest text-dim mb-2">Formula</div>
              <div className="text-text">
                Progress % &nbsp;=&nbsp; (Built footprint area) &nbsp;/&nbsp; (Planned footprint area)
              </div>
            </div>
            <ul className="text-sm flex flex-col gap-3">
              <li>
                <strong>Built footprint.</strong>{" "}
                <span className="text-dim">
                  A polygon drawn on the latest cloud-free satellite capture, around finished
                  structures only. Active construction zones are excluded so a half-built
                  building doesn't count as built.
                </span>
              </li>
              <li>
                <strong>Planned footprint.</strong>{" "}
                <span className="text-dim">
                  Official site plans, building permits where public, FAA filings for SpaceX,
                  and zoning records. When a company has published a master plan, we use that.
                </span>
              </li>
              <li>
                <strong>Cross-checks.</strong>{" "}
                <span className="text-dim">
                  County tax records, GIS portals, drone footage from local reporters (cited
                  inline on the site page), and satellite timelapses.
                </span>
              </li>
            </ul>
            <p className="text-[12px] text-dim mt-5 leading-relaxed">
              These are <strong className="text-text">estimates, not audited numbers</strong>.
              A human (the project operator) re-traces the polygons every refresh cycle.
            </p>
          </section>

          {/* 3. Confidence framework */}
          <section id="confidence" className="mb-14">
            <SectionLabel>3 · Confidence</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Every milestone wears one of four labels.
            </h2>
            <p className="text-dim mb-5 leading-relaxed">
              The same tier system is tagged into the JSON dataset (one of{" "}
              <code className="font-mono text-[12px] bg-surface px-1 py-0.5 rounded">high</code>,{" "}
              <code className="font-mono text-[12px] bg-surface px-1 py-0.5 rounded">medium</code>,{" "}
              <code className="font-mono text-[12px] bg-surface px-1 py-0.5 rounded">low</code>,{" "}
              <code className="font-mono text-[12px] bg-surface px-1 py-0.5 rounded">speculative</code>{" "}
              ), so anything you read on the site can be traced back to a specific evidence
              standard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CONFIDENCE_TIERS.map((t) => (
                <div
                  key={t.tier}
                  className="rounded-md border border-border-custom bg-bg p-4"
                  style={{ borderLeftWidth: 3, borderLeftColor: t.color }}
                >
                  <div
                    className="text-[10px] uppercase tracking-widest font-mono mb-2 font-bold"
                    style={{ color: t.color }}
                  >
                    {t.tier}
                  </div>
                  <p className="text-sm text-dim leading-snug">{t.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Capture cadence per site */}
          <section id="cadence" className="mb-14">
            <SectionLabel>4 · Capture cadence</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Every site, every timelapse, every last-capture date.
            </h2>
            <p className="text-dim mb-5 leading-relaxed">
              Live numbers from the build pipeline. The timelapse module pulls one frame per
              capture date; <strong className="text-text">{totalFrames}</strong> frames across{" "}
              <strong className="text-text">{sitesWithTimelapse.length}</strong> sites today.
            </p>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-custom text-[10px] uppercase tracking-wider text-dim font-mono">
                    <th className="py-2 pr-3 text-left">Site</th>
                    <th className="py-2 pr-3 text-left">Status</th>
                    <th className="py-2 pr-3 text-right">Frames</th>
                    <th className="py-2 pr-3 text-right">Last capture</th>
                    <th className="py-2 text-right">Data updated</th>
                  </tr>
                </thead>
                <tbody>
                  {factories.map((f) => {
                    const tl = TIMELAPSE_INDEX[f.slug];
                    return (
                      <tr key={f.slug} className="border-b border-border-custom hover:bg-surface">
                        <td className="py-2.5 pr-3">
                          <Link href={`/site/${f.slug}`} className="hover:underline">
                            {f.flag} {f.name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3 text-dim text-[12px] font-mono uppercase tracking-wider">
                          {f.status}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                          {tl?.frames ?? "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right font-mono text-[12px] text-dim">
                          {tl?.latest ?? "—"}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[12px] text-dim">
                          {f.lastUpdated ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Limitations */}
          <section id="limits" className="mb-14">
            <SectionLabel>5 · Limits</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              What satellites can't tell you.
            </h2>
            <ul className="text-sm flex flex-col gap-3">
              <Limit>Indoor work is invisible. A 100%-built site can be at 0% production capacity until racks land.</Limit>
              <Limit>"Operational" means finished structures plus visible activity, not nameplate output.</Limit>
              <Limit>Cloud cover, sun angle, and seasonal vegetation move the polygon by ±2-3% between captures. We do not report sub-5% deltas as news.</Limit>
              <Limit>Investment dollars are the company's number, not ours — drawn from disclosures, IR decks, and government incentive filings.</Limit>
              <Limit>Announced projects with no visible groundbreaking get the speculative tag and no progress %.</Limit>
              <Limit>This is a one-person tracker, not a satellite intelligence firm. Audited capacity numbers belong to your equity analyst.</Limit>
            </ul>
          </section>

          {/* 6. Citation policy */}
          <section id="sources" className="mb-12">
            <SectionLabel>6 · Sources</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Primary first. Secondary as fallback. Reddit and AI never.
            </h2>
            <p className="text-sm text-dim leading-relaxed mb-3">
              Every verified milestone links to a primary source — FAA notice, SEC EDGAR
              filing, county permit, IR press release, NASA mission page, ClinicalTrials.gov
              entry, NRC docket, or government data table (USGS, EIA, KOSIS, DART). The full
              bibliography lives at{" "}
              <Link href="/sources" className="underline hover:text-text">/sources</Link>{" "}
              — every URL we cite, grouped by site.
            </p>
            <p className="text-sm text-dim leading-relaxed mb-3">
              When sources conflict, both are noted on the site page (for example,{" "}
              <em>company guidance $20-25B, industry estimate $35-45B</em>). When something is
              an estimate, we tag it "est." Milestones without a verified primary-source URL
              are left uncited rather than padded with weak references — under-citing beats
              inventing.
            </p>
            <p className="text-sm text-dim leading-relaxed">
              Pre-pivot site records may still carry a Wikipedia revision pointer as the entry
              reference while migration to primary sources finishes through Q2-Q3 2026. Reddit
              and AI-generated content are never used as a sole source.
            </p>
          </section>

          {/* Contact */}
          <section className="rounded-md border border-border-custom p-5 text-sm bg-surface">
            <strong>Spot a wrong number?</strong>{" "}
            <span className="text-dim">
              Drop it in the{" "}
              <a
                href="https://github.com/sincetwentytwo-sys/gigascope/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text"
              >
                GitHub issue tracker
              </a>{" "}
              with the source URL. We fix and credit.
            </span>
          </section>
        </article>

        {/* TOC sidebar */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-3">
            Contents
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <TocLink href="#imagery">1 · Imagery</TocLink>
            <TocLink href="#progress">2 · Progress formula</TocLink>
            <TocLink href="#confidence">3 · Confidence framework</TocLink>
            <TocLink href="#cadence">4 · Capture cadence</TocLink>
            <TocLink href="#limits">5 · Limits</TocLink>
            <TocLink href="#sources">6 · Citation policy</TocLink>
          </nav>
          <div className="mt-8 rounded-md border border-border-custom p-4 bg-surface">
            <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
              Trust signal
            </div>
            <p className="text-[12px] text-dim leading-snug">
              The same data this page describes is rolled up into the{" "}
              <Link href="/pulse" className="underline hover:text-text">/pulse scoreboard</Link>{" "}
              — read both side by side.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
      {children}
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-bg p-4">
      <div className="text-[9px] uppercase tracking-widest font-mono text-dim mb-1.5">{label}</div>
      <div className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight">{value}</div>
      <div className="text-[10px] text-dim">{sub}</div>
    </div>
  );
}

function Limit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 items-start">
      <span className="text-accent-amber mt-0.5 shrink-0">·</span>
      <span className="text-dim">{children}</span>
    </li>
  );
}

function TocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-dim hover:text-text transition-colors">
      {children}
    </a>
  );
}
