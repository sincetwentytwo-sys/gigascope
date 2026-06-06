import Link from "next/link";
import { factories, getSitesByCompany } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import {
  getEmpireStats,
  getLatestCaptures,
  getRecentMilestones,
  formatKm2,
  formatCount,
} from "@/lib/pulse";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";
import CommunityFeed from "@/components/CommunityFeed";
import StockTicker from "@/components/StockTicker";
import SpaceXStats from "@/components/SpaceXStats";
import EmailSignup from "@/components/EmailSignup";
import type { Company } from "@/data/types";

export const revalidate = 1800;

const COMPANY_ORDER: Company[] = ["tesla", "spacex", "xai", "neuralink", "boring"];

type Hero = {
  /** factory.slug used for the link target + scoreboard lookups */
  slug: string;
  /**
   * Optional override for the `/timelapses/<x>.{mp4,jpg,av1.mp4}` asset slug.
   * Used after the 2026-05-27 starbase split: `starbase-launch` is the new
   * site slug, but the existing video files are still named `starbase.*`.
   * Defaults to `slug` when omitted.
   */
  videoSlug?: string;
  kicker: string;
  headlineLead: string;
  headlineTail: string;
};

// Colossus removed from rotation 2026-05-24 — the dramatic change is
// indoor (200K GPU rack install, fan-out, chiller plumbing), invisible
// from orbit. External delta over 12 months is too subtle for a hero
// timelapse. giga-texas (6yr dirt→megafactory+5 ancillary) and starbase
// (sand→OLM tower) carry the visual weight.
const HEROES: Hero[] = [
  {
    // Kicker stays generic about the source (Sentinel-2 + ESRI) without
    // committing to a year range — the headline already says "six years"
    // and a contradicting year span in the kicker just invited "wait,
    // which one is right?" 1-second confusion.
    slug: "giga-texas",
    kicker: "Tesla Gigafactory Texas · Sentinel-2 + ESRI timelapse",
    headlineLead: "Tesla Gigafactory Texas —",
    headlineTail: "bare farmland to megafactory in six years.",
  },
  {
    // 2026-05-27 split: `starbase` site → `starbase-launch` + `starbase-build`.
    // Video files remain on disk as `starbase.*` (renaming would invalidate
    // CDN cache for no win), so we keep the old asset slug via `videoSlug`.
    slug: "starbase-launch",
    videoSlug: "starbase",
    kicker: "SpaceX Starbase · Sentinel-2 + ESRI timelapse",
    headlineLead: "Starbase —",
    headlineTail: "from sand to Starship pad in five years.",
  },
];

function pickHero(slugOverride?: string): Hero {
  if (slugOverride) {
    const found = HEROES.find((h) => h.slug === slugOverride);
    if (found) return found;
  }
  // Daily rotation — deterministic, cache-friendly
  const idx = Math.floor(Date.now() / 86400000) % HEROES.length;
  return HEROES[idx];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const params = await searchParams;
  const hero = pickHero(params?.hero);
  // Asset slug — `videoSlug` lets us reuse legacy timelapse files (named
  // `starbase.*`) for a renamed factory (`starbase-launch`) without
  // rewriting the CDN cache key.
  const heroVideoSlug = hero.videoSlug ?? hero.slug;
  const stats = getEmpireStats();
  const captures = getLatestCaptures(3);
  const milestones = getRecentMilestones(5);
  const announced = factories.filter((f) => f.status === "announced");

  return (
    <>
      {/* ── Full-bleed satellite-timelapse hero — rotates daily ─────────── */}
      <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9", maxHeight: "78vh" }}>
        <video
          key={heroVideoSlug}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/timelapses/${heroVideoSlug}.jpg`}
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* Mobile variant — 480p, ~70% smaller. Browsers pick the matching
              <source> from top to bottom, so this MUST come before the full
              variant. Cellular users get ~600KB instead of ~2MB.
              AV1 sources first (~40-60% smaller than H.264); Safari/iOS lacks
              <video> AV1 support and falls through to the H.264 fallback. */}
          <source
            media="(max-width: 768px)"
            src={`/timelapses/${heroVideoSlug}-mobile.av1.mp4`}
            type='video/mp4; codecs="av01.0.04M.08"'
          />
          <source
            media="(max-width: 768px)"
            src={`/timelapses/${heroVideoSlug}-mobile.mp4`}
            type="video/mp4"
          />
          <source
            src={`/timelapses/${heroVideoSlug}.av1.mp4`}
            type='video/mp4; codecs="av01.0.04M.08"'
          />
          <source src={`/timelapses/${heroVideoSlug}.mp4`} type="video/mp4" />
        </video>

        {/* Gradient overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        {/* Hero copy */}
        <div className="relative h-full flex flex-col justify-end px-6 sm:px-12 pb-10 sm:pb-16 text-white">
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-white/70 mb-3 font-mono">
            {hero.kicker}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-3 max-w-3xl leading-[1.05]">
            {hero.headlineLead}
            <br />
            <span className="text-white/85">{hero.headlineTail}</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mb-6">
            The earliest verifiable signal on Musk&rsquo;s buildout &mdash; county permits and capex filings, tracked first.
            {/* Visible space on mobile (where the <br /> is hidden) — without
                it the two sentences smash together. */}
            <span className="sm:hidden"> </span>
            <br className="hidden sm:block" />
            {stats.sites} sites · {stats.milestonesTracked} milestones · every figure sourced.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/pulse"
              className="px-4 py-2 rounded bg-white text-black text-sm font-bold hover:opacity-85"
            >
              See the pulse →
            </Link>
            <a
              href="#sites"
              className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:border-white"
            >
              All {stats.sites} sites
            </a>
          </div>
        </div>
      </section>

      {/* ── Empire scoreboard — six-cell strip on lg, two-row stack on mobile ── */}
      <section aria-label="Empire scoreboard" className="border-b border-border-custom bg-bg">
        <div className="max-w-[1300px] mx-auto px-6 py-6 sm:py-8">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-px bg-border-custom rounded-md overflow-hidden border border-border-custom">
            <ScoreCell label="Sites" value={String(stats.sites)} sub={`${stats.operationalSites} ops · ${stats.expandingSites} expanding`} href="#sites" />
            <ScoreCell label="Capital" value={stats.totalInvestment} sub="declared investment" />
            <ScoreCell label="Footprint" value={formatKm2(stats.totalFootprintKm2)} sub="industrial area" />
            <ScoreCell label="Captures" value={formatCount(stats.satelliteFrames)} sub={`${stats.timelapseSites} timelapses`} href="/compare" />
            <ScoreCell label="Milestones" value={String(stats.milestonesTracked)} sub={`${stats.milestonesDone} verified`} href="/pulse" />
            <ScoreCell label="Sources" value={String(stats.sourcesCited)} sub="primary links" href="/sources" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-dim font-mono">
            <StockTicker />
            <span className="hidden sm:inline text-border-custom">·</span>
            <SpaceXStats />
            <span className="hidden sm:inline text-border-custom">·</span>
            <span>Last capture {stats.latestCaptureDate || "—"}</span>
            <span className="hidden sm:inline text-border-custom">·</span>
            <Link href="/methodology" className="underline hover:text-text">How we count</Link>
          </div>
        </div>
      </section>

      {/* ── Pulse this week — 2-col: latest captures + recent milestones ──── */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-10 sm:py-14">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1">Pulse</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">What just landed</h2>
            </div>
            <Link href="/pulse" className="text-[13px] text-dim hover:text-text shrink-0">Full scoreboard →</Link>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-x-10 gap-y-8">
          {/* Captures (1.2fr) */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1">Latest captures</div>
                <h2 className="text-xl font-bold tracking-tight">Fresh satellite frames</h2>
              </div>
              <Link href="/pulse" className="text-[13px] text-dim hover:text-text shrink-0">All →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-bold text-sm truncate">{c.flag} {c.name}</h3>
                      <p className="text-[11px] text-dim truncate">{c.location}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Milestones (1fr) */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1">Verified</div>
                <h2 className="text-xl font-bold tracking-tight">Recent milestones</h2>
              </div>
              <Link href="/pulse" className="text-[13px] text-dim hover:text-text shrink-0">All →</Link>
            </div>
            <ol className="flex flex-col">
              {milestones.map((m, i) => {
                const meta = getCompanyMeta(m.company as ReturnType<typeof getCompanyMeta>["id"]);
                return (
                  <li
                    key={`${m.slug}-${i}`}
                    className="grid grid-cols-[64px_1fr] gap-3 py-2.5 border-b border-border-custom last:border-0"
                  >
                    <div className="font-mono text-[10px] text-dim pt-0.5">{m.date}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: meta.color }} />
                        <Link href={`/site/${m.slug}`} className="text-[10px] font-mono uppercase tracking-wider hover:underline" style={{ color: meta.color }}>
                          {m.site}
                        </Link>
                      </div>
                      <p className="text-sm leading-snug">
                        {m.text}
                        {m.sourceUrl && (
                          <a
                            href={m.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-[10px] text-dim hover:text-text underline underline-offset-2"
                          >
                            [src]
                          </a>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        </div>
      </section>

      {/* ── PRIMARY: Musk Empire sites grouped by company ──────────────────── */}
      <section id="sites" className="max-w-[1300px] mx-auto px-6 pt-12 pb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Musk Empire</h2>
            <p className="text-xs text-dim mt-1">
              {stats.sites} sites · monthly to quarterly satellite captures · <Link href="/methodology" className="underline">methodology →</Link>
            </p>
          </div>
          <div className="flex gap-4 text-[13px] text-dim">
            <Link href="/pulse" className="hover:text-text transition-colors">Pulse →</Link>
            <Link href="/compare" className="hover:text-text transition-colors">Compare →</Link>
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {COMPANY_ORDER.map((companyId) => {
            const sites = getSitesByCompany(companyId).filter((f) => f.status !== "announced");
            if (sites.length === 0) return null;
            const meta = getCompanyMeta(companyId);
            return (
              <div key={companyId}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                  <h3 className="text-lg font-bold">{meta.icon} {meta.name}</h3>
                  <span className="text-xs text-dim">{sites.length} site{sites.length > 1 ? "s" : ""}</span>
                  <div className="flex-1 h-px bg-border-custom" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sites.map((f) => (
                    <FactoryCard key={f.id} factory={f} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-dim mt-6">
          Data updated {stats.dataLastUpdated} · Progress estimates based on satellite imagery, official announcements, and public filings. <Link href="/methodology" className="underline">Methodology →</Link>
        </p>
      </section>

      {/* ── Announced Projects ─────────────────────────────────────────────── */}
      {announced.length > 0 && (
        <section className="max-w-[1300px] mx-auto px-6 pb-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold">Announced</h2>
            <span className="text-xs text-dim">{announced.length} project{announced.length > 1 ? "s" : ""} · groundbreaking not started</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {announced.map((f) => (
              <FactoryCard key={f.id} factory={f} variant="announced" />
            ))}
          </div>
        </section>
      )}

      {/* ── Daily digest CTA — primary monetization funnel ────────────────── */}
      <section className="max-w-[900px] mx-auto px-6 pb-16">
        <EmailSignup tier="free" source="home" variant="card" />
      </section>

      {/* ── News + Community ──────────────────────────────────────────────── */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest news</h2>
            <NewsFeed />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest signal</h2>
            <CommunityFeed factoryName="Musk" />
          </div>
        </div>
      </section>
    </>
  );
}

// ── inline scorecard component (same shape as /pulse) ────────────────────
// When `href` is set, the cell becomes a Link that hover-darkens — turns the
// scoreboard into a drill-down launcher instead of a static stat strip.
function ScoreCell({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <>
      <div className="text-[9px] uppercase tracking-widest font-mono text-dim mb-1.5">
        {label}
      </div>
      <div className="text-lg sm:text-2xl font-bold tabular-nums tracking-tight mb-0.5">
        {value}
      </div>
      {sub && <div className="text-[10px] text-dim leading-snug">{sub}</div>}
    </>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="bg-bg p-4 sm:p-5 hover:bg-surface transition-colors block"
      >
        {body}
      </Link>
    );
  }
  return <div className="bg-bg p-4 sm:p-5">{body}</div>;
}
