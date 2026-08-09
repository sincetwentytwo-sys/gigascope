// /pulse — the empire-wide dashboard.
//
// Pure server component. Reads two static data sources:
//   - public/data/factories.json (sites, milestones, progress timeline)
//   - public/timelapses/index.json (capture frames + latest date per site)
//
// No client-side state, no network calls, no Redis. Revalidates every 30 min
// so a fresh `update:factories` script run + redeploy will surface within
// half an hour without us having to manually purge.

import type { Metadata } from "next";
import Link from "next/link";
import {
  getEmpireStats,
  getLatestCaptures,
  getRecentMilestones,
  getUpcomingMilestones,
  getVelocityLeaderboard,
  getCompanyBreakdown,
  getAggregateTimeline,
  formatKm2,
  formatCount,
  formatRelativeDate,
} from "@/lib/pulse";
import { TIMELINE_YEARS } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import EmailSignup from "@/components/EmailSignup";
import Sparkline from "@/components/Sparkline";
import { safeJsonLd } from "@/lib/safeJsonLd";
import { factories } from "@/data/factories";

export const revalidate = 1800; // 30 min

const SITE_URL = "https://gigascope.xyz";

export const metadata: Metadata = {
  title: "Pulse — what's moving across the Musk-orbit empire — GIGASCOPE",
  description:
    "Empire-wide scoreboard for the 16 Musk-orbit construction sites. Latest satellite captures, recent verified milestones, upcoming launches and ground-breaks, and per-site progress velocity. Refreshed as new captures and filings land.",
  alternates: { canonical: `${SITE_URL}/pulse` },
  openGraph: {
    title: "Pulse — what's moving across the Musk-orbit empire",
    description:
      "Scoreboard for 16 sites across Tesla, SpaceX, xAI, Neuralink, and The Boring Company. Latest captures, milestones, velocity ranking.",
    url: `${SITE_URL}/pulse`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse — Musk-orbit industrial sites from orbit",
    description: "16 sites · latest captures · verified milestones · velocity ranking.",
  },
};

export default function PulsePage() {
  const stats = getEmpireStats();
  const captures = getLatestCaptures(8);
  const recent = getRecentMilestones(10);
  const upcoming = getUpcomingMilestones(8);
  const velocity = getVelocityLeaderboard(6);
  const companies = getCompanyBreakdown();
  const aggregate = getAggregateTimeline(TIMELINE_YEARS);

  // ── Schema.org structured data so search engines see a real dataset ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "GIGASCOPE Pulse — Musk-orbit construction scoreboard",
    description:
      "Aggregate construction-progress metrics across 16 Musk-orbit industrial sites, derived from Sentinel-2 / ESRI satellite captures and primary-source filings.",
    url: `${SITE_URL}/pulse`,
    creator: { "@type": "Organization", name: "GIGASCOPE" },
    keywords: ["satellite", "Tesla", "SpaceX", "xAI", "Neuralink", "Gigafactory", "Starbase"],
    dateModified: stats.dataLastUpdated,
    variableMeasured: [
      "Construction progress per site",
      "Aggregate industrial footprint",
      "Satellite capture cadence",
      "Verified milestone count",
    ],
  };

  return (
    <div className="bg-bg text-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-16">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="relative flex h-2 w-2"
              title="Page rebuilds every 30 minutes from static factories.json + timelapse index — not a real-time feed."
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
            </span>
            <span className="text-[11px] uppercase tracking-widest text-dim font-mono">
              Pulse · empire scoreboard · refreshes every 30 min
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 max-w-3xl leading-[1.05]">
            What the Musk empire is building, right now.
          </h1>
          <p className="text-dim text-base sm:text-lg max-w-2xl leading-relaxed">
            {stats.sites} sites. {stats.countries} countries. Four operating companies (SpaceX
            absorbed xAI in Feb 2026) plus joint ventures. Every Sentinel-2 frame and primary-source filing we have, rolled
            up into one scoreboard. Page rebuilds every 30 minutes as captures and filings land.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono text-dim">
            <span>Data updated {stats.dataLastUpdated}</span>
            <span className="text-border-custom">·</span>
            <span>Latest capture {stats.latestCaptureDate || "—"}</span>
            <span className="text-border-custom">·</span>
            <Link href="/methodology" className="underline hover:text-text">
              How we count →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Scoreboard ─────────────────────────────────────────────────── */}
      <section aria-label="Empire scoreboard" className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border-custom rounded-md overflow-hidden border border-border-custom">
            <ScoreCell label="Sites tracked" value={String(stats.sites)} sub={`${stats.operationalSites} operational · ${stats.expandingSites} expanding`} />
            <ScoreCell label="Footprint" value={formatKm2(stats.totalFootprintKm2)} sub="Sum of measured site areas" />
            <ScoreCell label="Capital deployed" value={stats.totalInvestment} sub="Sum of declared site investment" />
            <ScoreCell label="Satellite frames" value={formatCount(stats.satelliteFrames)} sub={`Across ${stats.timelapseSites} site timelapses`} />
            <ScoreCell label="Milestones logged" value={String(stats.milestonesTracked)} sub={`${stats.milestonesDone} verified done`} />
            <ScoreCell label="Sources cited" value={String(stats.sourcesCited)} sub="Primary-source links" />
          </div>
        </div>
      </section>

      {/* ── Aggregate empire build-out chart ──────────────────────────── */}
      {aggregate.length > 0 && (
        <section aria-label="Empire build-out over time" className="border-b border-border-custom">
          <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14">
            <SectionHeader
              kicker="Aggregate"
              title="Empire build-out, 2020 → today"
              tail="Mean progress across sites with non-zero progress in that year (excludes pre-groundbreaking) · shaded ±3pp band shows typical operator variance"
            />
            <div className="rounded-md border border-border-custom bg-bg p-5 sm:p-6">
              {/* Tall sparkline + axis labels — same component used elsewhere
                  but expanded to fill the section. Anchored to current text
                  color so it picks up theme accents automatically. The
                  band={low,high} prop renders the ±3pp uncertainty strip
                  documented at /methodology#uncertainty. */}
              <div className="text-text">
                <Sparkline
                  values={aggregate.map((a) => a.averageProgress)}
                  band={{
                    low: aggregate.map((a) => Math.max(0, a.averageProgress - 3)),
                    high: aggregate.map((a) => Math.min(100, a.averageProgress + 3)),
                  }}
                  width={1200}
                  height={140}
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth={2}
                  className="w-full h-[140px]"
                />
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-dim">
                <span className="inline-block w-3 h-2 rounded-sm border border-dashed border-text/40 bg-text/15" />
                <span>
                  ±3pp typical error band —{" "}
                  <Link href="/methodology#uncertainty" className="underline hover:text-text">
                    see /methodology
                  </Link>
                </span>
              </div>
              <div className="mt-3 grid grid-cols-7 text-[10px] font-mono text-dim tabular-nums">
                {aggregate.map((a) => (
                  <div key={a.year} className="flex flex-col items-center">
                    <span className="text-text font-bold text-[13px]">{a.averageProgress}%</span>
                    <span>'{String(a.year).slice(-2)}</span>
                    <span className="text-dim/70">n={a.contributingSites}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Latest captures ────────────────────────────────────────────── */}
      <section aria-label="Latest satellite captures" className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14">
          <SectionHeader
            kicker="Captures"
            title="Latest satellite frames"
            tail={`${captures.length} of ${stats.timelapseSites} sites`}
            href="/compare"
            hrefLabel="Compare imagery →"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {captures.map((c) => {
              const meta = getCompanyMeta(c.company as ReturnType<typeof getCompanyMeta>["id"]);
              return (
                <Link
                  key={c.slug}
                  href={`/site/${c.slug}`}
                  className="group rounded-md overflow-hidden border border-border-custom bg-bg hover:border-text transition-colors"
                  style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
                >
                  <div className="relative aspect-video bg-surface overflow-hidden">
                    <img
                      src={`/timelapses/${c.slug}-last.jpg`}
                      alt={`${c.name} most recent satellite capture`}
                      loading="lazy"
                      width={1600}
                      height={900}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/65 text-white/90 text-[9px] font-mono uppercase tracking-wider rounded">
                      {c.latest}
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/65 text-white/90 text-[9px] font-mono rounded">
                      {c.frames}f
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate">{c.flag} {c.name}</h3>
                        <p className="text-[11px] text-dim truncate">{c.location}</p>
                      </div>
                      <span
                        className="font-mono text-[10px] tabular-nums shrink-0"
                        style={{ color: meta.color }}
                      >
                        {c.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Two-column: recent + upcoming ──────────────────────────────── */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
          {/* Recent (done) */}
          <div>
            <SectionHeader
              kicker="Verified"
              title="Recent milestones"
              tail={`${recent.length} most recent`}
            />
            <ol className="flex flex-col">
              {recent.map((m, i) => {
                const meta = getCompanyMeta(m.company as ReturnType<typeof getCompanyMeta>["id"]);
                return (
                  <li
                    key={`${m.slug}-${i}`}
                    className="grid grid-cols-[80px_1fr] gap-3 py-3 border-b border-border-custom last:border-0"
                  >
                    <div className="font-mono text-[10px] text-dim leading-tight pt-0.5">
                      <div>{m.date}</div>
                      <div className="text-dim/70">{formatRelativeDate(m.date)}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: meta.color }}
                        />
                        <Link
                          href={`/site/${m.slug}`}
                          className="text-[11px] font-mono uppercase tracking-wider hover:underline"
                          style={{ color: meta.color }}
                        >
                          {m.site}
                        </Link>
                      </div>
                      <p className="text-sm text-text leading-snug">
                        {m.text}
                        {m.sourceUrl && (
                          <a
                            href={m.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[10px] text-dim hover:text-text underline underline-offset-2"
                          >
                            [source]
                          </a>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Upcoming (not done) */}
          <div>
            <SectionHeader
              kicker="On the runway"
              title="Upcoming next 18 months"
              tail={`${upcoming.length} milestones`}
            />
            <ol className="flex flex-col">
              {upcoming.map((m, i) => {
                const meta = getCompanyMeta(m.company as ReturnType<typeof getCompanyMeta>["id"]);
                const tone =
                  m.daysAway <= 30
                    ? "text-accent-red"
                    : m.daysAway <= 90
                    ? "text-accent-amber"
                    : "text-dim";
                return (
                  <li
                    key={`${m.slug}-up-${i}`}
                    className="grid grid-cols-[80px_1fr] gap-3 py-3 border-b border-border-custom last:border-0"
                  >
                    <div className="font-mono text-[10px] leading-tight pt-0.5">
                      <div className="text-dim">{m.date}</div>
                      <div className={tone}>
                        {m.daysAway <= 0 ? "due" : `in ${m.daysAway}d`}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: meta.color }}
                        />
                        <Link
                          href={`/site/${m.slug}`}
                          className="text-[11px] font-mono uppercase tracking-wider hover:underline"
                          style={{ color: meta.color }}
                        >
                          {m.site}
                        </Link>
                      </div>
                      <p className="text-sm text-text leading-snug">{m.text}</p>
                    </div>
                  </li>
                );
              })}
              {upcoming.length === 0 && (
                <p className="text-sm text-dim">
                  No tracked milestones land in the next 18 months. New filings get added as primary sources publish.
                </p>
              )}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Velocity leaderboard ───────────────────────────────────────── */}
      {velocity.length > 0 && (
        <section className="border-b border-border-custom">
          <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14">
            <SectionHeader
              kicker="Velocity"
              title="Biggest single-year progress jumps"
              tail="Year-over-year delta from progress timeline"
            />
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-custom text-[10px] uppercase tracking-wider text-dim font-mono">
                    <th className="py-2 pr-4 text-left w-8">#</th>
                    <th className="py-2 pr-4 text-left">Site</th>
                    <th className="py-2 pr-3 text-left hidden sm:table-cell">Trajectory</th>
                    <th className="py-2 pr-4 text-right">Prior</th>
                    <th className="py-2 pr-4 text-right">Current</th>
                    <th className="py-2 text-right">Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {velocity.map((row, i) => {
                    const meta = getCompanyMeta(row.company as ReturnType<typeof getCompanyMeta>["id"]);
                    const factory = factories.find((f) => f.slug === row.slug);
                    const timeline = factory?.timeline ?? [];
                    return (
                      <tr key={row.slug} className="border-b border-border-custom last:border-0 hover:bg-surface">
                        <td className="py-3 pr-4 font-mono text-[10px] text-dim">{i + 1}</td>
                        <td className="py-3 pr-4">
                          <Link href={`/site/${row.slug}`} className="flex items-center gap-2 hover:underline">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: meta.color }}
                            />
                            <span className="font-bold text-sm">{row.flag} {row.name}</span>
                          </Link>
                        </td>
                        <td className="py-3 pr-3 hidden sm:table-cell">
                          <div style={{ color: meta.color }}>
                            <Sparkline
                              values={timeline}
                              width={120}
                              height={22}
                              stroke={meta.color}
                              fill={meta.color}
                              strokeWidth={1.5}
                            />
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-mono text-dim tabular-nums">{row.prior}%</td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums">{row.current}%</td>
                        <td className="py-3 text-right font-mono font-bold text-accent-green tabular-nums">
                          +{row.delta}pp
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Status mix bar ─────────────────────────────────────────────── */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-x-12 gap-y-10">
          <div>
            <SectionHeader
              kicker="Mix"
              title="Status across the empire"
              tail={`${stats.sites} sites in scope`}
            />
            <StatusMixBar
              ops={stats.operationalSites}
              expanding={stats.expandingSites}
              construction={stats.constructionSites}
              announced={stats.announcedSites}
              total={stats.sites}
            />
          </div>
          <div>
            <SectionHeader
              kicker="By company"
              title="Average build progress"
              tail="Sites with measurable footprint"
            />
            <div className="flex flex-col gap-3">
              {companies
                .sort((a, b) => b.averageProgress - a.averageProgress)
                .map((row) => {
                  const meta = getCompanyMeta(row.company as ReturnType<typeof getCompanyMeta>["id"]);
                  return (
                    <div key={row.company} className="grid grid-cols-[100px_1fr_56px] gap-3 items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                        <span className="text-[12px] font-mono uppercase tracking-wider truncate">{meta.name}</span>
                      </div>
                      <div className="h-1.5 rounded bg-surface overflow-hidden border border-border-custom">
                        <div className="h-full" style={{ width: `${row.averageProgress}%`, background: meta.color }} />
                      </div>
                      <div className="text-right font-mono text-[12px] tabular-nums">
                        {row.averageProgress}<span className="text-dim">%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <section className="border-b border-border-custom bg-surface">
        <div className="max-w-[1300px] mx-auto px-6 py-7 text-center">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-3">
            Milestones cited against
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-text font-mono">
            <span>FAA filings</span>
            <span className="text-border-custom">·</span>
            <span>SEC EDGAR</span>
            <span className="text-border-custom">·</span>
            <span>USGS</span>
            <span className="text-border-custom">·</span>
            <span>KOSIS</span>
            <span className="text-border-custom">·</span>
            <span>DART</span>
            <span className="text-border-custom">·</span>
            <span>Travis County permits</span>
            <span className="text-border-custom">·</span>
            <span>NASA mission pages</span>
            <span className="text-border-custom">·</span>
            <span>NRC dockets</span>
            <span className="text-border-custom">·</span>
            <span>ClinicalTrials.gov</span>
            <span className="text-border-custom">·</span>
            <span>IR press releases</span>
          </div>
          <p className="text-[11px] text-dim mt-3">
            {stats.sourcesCited}+ primary-source links cited across {stats.sites} sites.{" "}
            <Link href="/methodology" className="underline hover:text-text">Citation policy →</Link>
          </p>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section>
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <EmailSignup tier="free" source="pulse:footer" variant="card" />
        </div>
      </section>
    </div>
  );
}

// ── small subcomponents (kept inline so the file is one-stop-shop) ──────
function ScoreCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-bg p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
        {label}
      </div>
      <div className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight mb-1">
        {value}
      </div>
      {sub && <div className="text-[11px] text-dim leading-snug">{sub}</div>}
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  tail,
  href,
  hrefLabel,
}: {
  kicker: string;
  title: string;
  tail?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1">
          {kicker}
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {tail && <p className="text-[11px] text-dim mt-1 font-mono">{tail}</p>}
      </div>
      {href && (
        <Link href={href} className="text-[13px] text-dim hover:text-text shrink-0">
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}

function StatusMixBar({
  ops,
  expanding,
  construction,
  announced,
  total,
}: {
  ops: number;
  expanding: number;
  construction: number;
  announced: number;
  total: number;
}) {
  const opsPct = (ops / total) * 100;
  const expPct = (expanding / total) * 100;
  const conPct = (construction / total) * 100;
  const annPct = (announced / total) * 100;
  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full rounded-full overflow-hidden border border-border-custom">
        <div className="h-full" style={{ width: `${opsPct}%`, background: "var(--green)" }} />
        <div className="h-full" style={{ width: `${expPct}%`, background: "var(--blue)" }} />
        <div className="h-full" style={{ width: `${conPct}%`, background: "var(--amber)" }} />
        <div className="h-full" style={{ width: `${annPct}%`, background: "#c4a000" }} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono">
        <Legend color="var(--green)" label="Operational" count={ops} />
        <Legend color="var(--blue)" label="Expanding" count={expanding} />
        <Legend color="var(--amber)" label="Construction" count={construction} />
        <Legend color="#c4a000" label="Announced" count={announced} />
      </div>
    </div>
  );
}

function Legend({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
      <span className="text-dim">
        {label} <span className="text-text tabular-nums">{count}</span>
      </span>
    </div>
  );
}
