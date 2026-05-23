import { factories, getSitesByCompany, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
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
  slug: string;
  kicker: string;
  headlineLead: string;
  headlineTail: string;
};

const HEROES: Hero[] = [
  {
    slug: "giga-texas",
    kicker: "Tesla Gigafactory Texas · Sentinel-2 · 2020 → 2026",
    headlineLead: "Tesla Gigafactory Texas —",
    headlineTail: "six years from dirt.",
  },
  {
    slug: "starbase",
    kicker: "SpaceX Starbase · Sentinel-2 · 2019 → 2026",
    headlineLead: "Starbase —",
    headlineTail: "from sand to Starship pad in five years.",
  },
  {
    slug: "colossus",
    kicker: "xAI Colossus · Memphis · 2024 → 2026",
    headlineLead: "Memphis Colossus —",
    headlineTail: "200,000 GPUs online in 12 months.",
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
  const countries = new Set(factories.map((f) => f.flag)).size;
  const announced = factories.filter((f) => f.status === "announced");

  return (
    <>
      {/* Full-bleed satellite-timelapse hero — rotates daily across Giga Texas / Starbase / Colossus */}
      <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9", maxHeight: "78vh" }}>
        <video
          key={hero.slug}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`/timelapses/${hero.slug}.jpg`}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={`/timelapses/${hero.slug}.mp4`} type="video/mp4" />
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
            The only place tracking Tesla, SpaceX & xAI from orbit.
            <br className="hidden sm:block" />
            {factories.length} Musk-empire sites, captured weekly.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#sites"
              className="px-4 py-2 rounded bg-white text-black text-sm font-bold hover:opacity-85"
            >
              See all {factories.length} sites →
            </a>
            <a
              href="/methodology"
              className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:border-white"
            >
              How we calculate progress
            </a>
          </div>
        </div>
      </section>

      {/* Live secondary stats — kept small, no atlas extension */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-dim">
          <StockTicker />
          <span className="hidden sm:inline">·</span>
          <SpaceXStats />
          <span className="hidden sm:inline">·</span>
          <span>{countries} countries · {getTotalInvestment()} invested</span>
        </div>
      </section>

      {/* PRIMARY: Musk Empire sites grouped by company */}
      <section id="sites" className="max-w-[1200px] mx-auto px-6 pt-12 pb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Musk Empire</h2>
            <p className="text-xs text-dim mt-1">
              {factories.length} sites · weekly satellite captures · <a href="/methodology" className="underline">methodology →</a>
            </p>
          </div>
          <div className="flex gap-4 text-[13px] text-dim">
            <a href="/timeline" className="hover:text-text transition-colors">Timeline →</a>
            <a href="/compare" className="hover:text-text transition-colors">Compare →</a>
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
          Updated {DATA_LAST_UPDATED} · Progress estimates based on satellite imagery, official announcements, and public filings. <a href="/methodology" className="underline">Methodology →</a>
        </p>
      </section>

      {/* Announced Projects */}
      {announced.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 pb-12">
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

      {/* Daily digest CTA — primary monetization funnel */}
      <section className="max-w-[900px] mx-auto px-6 pb-16">
        <EmailSignup tier="free" source="home" variant="card" />
      </section>

      {/* News + Community */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest news</h2>
            <NewsFeed />
            <a href="/news" className="text-xs text-dim hover:text-text mt-3 inline-block">All news →</a>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Community</h2>
            <CommunityFeed factoryName="Musk" />
          </div>
        </div>
      </section>

    </>
  );
}
