import { factories, getSitesByCompany, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";
import CommunityFeed from "@/components/CommunityFeed";
import StockTicker from "@/components/StockTicker";
import SpaceXStats from "@/components/SpaceXStats";
import TickerGrid from "@/components/TickerGrid";
import EmailSignup from "@/components/EmailSignup";
import { SECTORS, TICKERS, featuredTickers, tickersBySector, tickerHref } from "@/data/tickers";
import type { Company } from "@/data/types";

export const revalidate = 1800;

const COMPANY_ORDER: Company[] = ["tesla", "spacex", "xai", "neuralink", "boring"];

export default function Home() {
  const countries = new Set(factories.map((f) => f.flag)).size;
  const announced = factories.filter((f) => f.status === "announced");
  const featured = featuredTickers();

  const featuredRows = featured.map((t) => ({
    symbol: t.symbol,
    yahooSymbol: t.yahooSymbol,
    name: t.shortName ?? t.name,
    href: tickerHref(t),
    accent: t.accent,
  }));

  return (
    <>
      {/* Hero */}
      <section className="text-center py-14 sm:py-20 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Industrial intelligence
          <br />
          <span className="text-dim font-normal text-2xl sm:text-3xl md:text-4xl">for the AI build-out</span>
        </h1>
        <p className="text-base text-dim max-w-2xl mx-auto mb-6">
          {factories.length} factories · {TICKERS.length} tickers · {SECTORS.length} sectors · {countries} countries · {getTotalInvestment()} invested.
          One terminal for the Musk Empire, the semiconductor build-out, quantum, materials, defense, and nuclear.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <StockTicker />
          <span className="hidden sm:inline text-dim">·</span>
          <SpaceXStats />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a href="/markets" className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80">Open the markets terminal →</a>
          <a href="/pro" className="px-4 py-2 rounded border border-border-custom text-sm hover:border-text">See Pro tier</a>
        </div>
      </section>

      {/* Featured ticker heatmap */}
      <section className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-2xl font-bold">Featured tickers</h2>
          <a href="/markets" className="text-xs text-dim hover:text-text">Full heatmap →</a>
        </div>
        <TickerGrid rows={featuredRows} />
      </section>

      {/* Sectors strip */}
      <section className="max-w-[1200px] mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-2xl font-bold">Sectors</h2>
          <a href="/sectors" className="text-xs text-dim hover:text-text">All sectors →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SECTORS.map((s) => {
            const ts = tickersBySector(s.id);
            return (
              <a
                key={s.id}
                href={`/sectors/${s.id}`}
                className="block p-3 rounded-md border border-border-custom hover:border-text transition-colors"
                style={{ borderLeftWidth: 4, borderLeftColor: s.color }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm font-bold">{s.name}</span>
                </div>
                <div className="text-[11px] text-dim line-clamp-2">{s.blurb}</div>
                <div className="text-[10px] text-dim mt-1.5">{ts.length} names</div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Announced Projects */}
      {announced.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 pb-10">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold">Announced Projects</h2>
            <span className="text-xs text-dim">
              {announced.length} project{announced.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {announced.map((f) => (
              <FactoryCard key={f.id} factory={f} variant="announced" />
            ))}
          </div>
        </section>
      )}

      {/* Company sections */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold">Musk Empire — all sites</h2>
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
          Updated {DATA_LAST_UPDATED} · Progress estimates based on satellite imagery, official announcements, and public filings.
        </p>
      </section>

      {/* Daily digest CTA */}
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
