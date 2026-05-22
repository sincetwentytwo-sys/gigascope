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
import { listPrivateCompanies } from "@/data/privateCompanies";
import { fetchQuotes } from "@/lib/quotes";
import type { Company } from "@/data/types";

export const revalidate = 1800;

const COMPANY_ORDER: Company[] = ["tesla", "spacex", "xai", "neuralink", "boring"];

export default async function Home() {
  const countries = new Set(factories.map((f) => f.flag)).size;
  const announced = factories.filter((f) => f.status === "announced");
  const featured = featuredTickers();
  const initialQuotes = await fetchQuotes(featured.map((t) => t.yahooSymbol), 300);

  const featuredRows = featured.map((t) => ({
    symbol: t.symbol,
    yahooSymbol: t.yahooSymbol,
    name: t.shortName ?? t.name,
    href: tickerHref(t),
    accent: t.accent,
  }));

  return (
    <>
      {/* Hero — narrow back to Musk Empire as the primary product */}
      <section className="text-center py-14 sm:py-20 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          The satellite tracker
          <br />
          <span className="text-dim font-normal text-2xl sm:text-3xl md:text-4xl">for Tesla, SpaceX & xAI</span>
        </h1>
        <p className="text-base text-dim max-w-2xl mx-auto mb-6">
          {factories.length} Musk-empire sites · weekly satellite captures · catalyst calendar · 3D product breakdowns.
          <br className="hidden sm:block" />
          Plus extended Atlas coverage of the AI build-out — NVIDIA, TSMC, Samsung, SK Hynix.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <StockTicker />
          <span className="hidden sm:inline text-dim">·</span>
          <SpaceXStats />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a href="#sites" className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80">Browse the sites ↓</a>
          <a href="/investor" className="px-4 py-2 rounded border border-border-custom text-sm hover:border-text">Investor tier · $9/mo</a>
        </div>
        <div className="mt-3 text-[11px] text-dim">
          <a href="/methodology" className="underline hover:text-text">How we calculate progress %</a>
          <span className="mx-2">·</span>
          <a href="/about" className="underline hover:text-text">What this is (and isn't)</a>
        </div>
      </section>

      {/* Featured ticker heatmap */}
      {/* PRIMARY: Musk Empire sites — the core product */}
      <section id="sites" className="max-w-[1200px] mx-auto px-6 pb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Musk Empire</h2>
            <p className="text-xs text-dim mt-1">
              {factories.length} sites · weekly satellite captures · <a href="/methodology" className="underline">how we calculate progress %</a>
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

      {/* SECONDARY: Extended Atlas of AI build-out */}
      <section className="border-t border-border-custom mt-8">
        <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-2">
          <div className="text-xs uppercase tracking-wider text-dim mb-1">Extended Atlas</div>
          <h2 className="text-2xl font-bold">The AI build-out, beyond Musk</h2>
          <p className="text-sm text-dim mt-1 max-w-2xl">
            {TICKERS.length} public companies in {SECTORS.length} sectors with facility maps, supply chain, primary-source citations. Secondary coverage — Musk Empire is the core.
          </p>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pt-6 pb-12">
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-lg font-bold">Featured tickers</h3>
          <a href="/markets" className="text-xs text-dim hover:text-text">Full heatmap →</a>
        </div>
        <TickerGrid rows={featuredRows} initialQuotes={initialQuotes} />
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pb-14">
        <div className="flex items-end justify-between mb-3">
          <h3 className="text-lg font-bold">Sectors</h3>
          <a href="/sectors" className="text-xs text-dim hover:text-text">All sectors →</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {SECTORS.map((s) => {
            const ts = tickersBySector(s.id);
            const privates = listPrivateCompanies().filter((c) => c.sectors.includes(s.id));
            const total = ts.length + privates.length;
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
                <div className="text-[10px] text-dim mt-1.5">{total} {total === 1 ? "name" : "names"}</div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/supply-chain" className="p-4 rounded border border-border-custom hover:border-text" style={{ borderLeftWidth: 4, borderLeftColor: "#0066cc" }}>
            <div className="text-sm font-bold mb-1">Supply chain</div>
            <div className="text-[11px] text-dim leading-snug">ASML → TSMC → Hynix → NVIDIA → Tesla. Directional edges with primary sources.</div>
          </a>
          <a href="/learn" className="p-4 rounded border border-border-custom hover:border-text" style={{ borderLeftWidth: 4, borderLeftColor: "#76b900" }}>
            <div className="text-sm font-bold mb-1">Learn</div>
            <div className="text-[11px] text-dim leading-snug">First-principles explainers: HBM, EUV, GAA, CoWoS, qubits, LFP, SMR.</div>
          </a>
          <a href="/private" className="p-4 rounded border border-border-custom hover:border-text" style={{ borderLeftWidth: 4, borderLeftColor: "#7b2dbd" }}>
            <div className="text-sm font-bold mb-1">Private companies</div>
            <div className="text-[11px] text-dim leading-snug">SpaceX, xAI, Anduril, Helion, Commonwealth Fusion — valuation-cited estimates.</div>
          </a>
          <a href="/calendar" className="p-4 rounded border border-border-custom hover:border-text" style={{ borderLeftWidth: 4, borderLeftColor: "#bf5600" }}>
            <div className="text-sm font-bold mb-1">Calendar</div>
            <div className="text-[11px] text-dim leading-snug">Every upcoming catalyst + milestone, chronological, confidence-tagged.</div>
          </a>
        </div>
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
