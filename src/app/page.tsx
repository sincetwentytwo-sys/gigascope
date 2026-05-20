import { factories, getSitesByCompany, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";
import CommunityFeed from "@/components/CommunityFeed";
import StockTicker from "@/components/StockTicker";
import SpaceXStats from "@/components/SpaceXStats";
import type { Company } from "@/data/types";

export const revalidate = 1800;

const COMPANY_ORDER: Company[] = ["tesla", "spacex", "xai", "neuralink", "boring"];

export default function Home() {
  const countries = new Set(factories.map((f) => f.flag)).size;
  const announced = factories.filter((f) => f.status === "announced");

  return (
    <>
      {/* Hero */}
      <section className="text-center py-16 sm:py-24 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Musk Empire Tracker
        </h1>
        <p className="text-lg text-dim max-w-lg mx-auto mb-4">
          {factories.length} sites &middot; {getTotalInvestment()} invested &middot; {countries} countries
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <StockTicker />
          <span className="hidden sm:inline text-dim">&middot;</span>
          <SpaceXStats />
        </div>
      </section>

      {/* Announced Projects — uses variant="announced" for gold styling */}
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
          <h2 className="text-2xl font-bold">All Sites</h2>
          <div className="flex gap-4 text-[13px] text-dim">
            <a href="/timeline" className="hover:text-text transition-colors">Timeline &rarr;</a>
            <a href="/compare" className="hover:text-text transition-colors">Compare &rarr;</a>
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
          Updated {DATA_LAST_UPDATED} &middot; Progress estimates based on satellite imagery, official announcements, and public filings.
        </p>
      </section>

      {/* News + Community */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Latest News</h2>
            <NewsFeed />
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
