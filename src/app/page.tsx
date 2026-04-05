import { factories, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  return (
    <>
      {/* ── FACTORY GRID — data first, all 8 factories ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">All Factories</h1>
            <p className="font-mono text-[9px] text-dim mt-0.5">
              {factories.length} factories &middot; {getTotalInvestment()} invested &middot; Updated {DATA_LAST_UPDATED}
            </p>
          </div>
          <div className="flex gap-4">
            <a href="/timeline" className="text-xs text-dim hover:text-text transition-colors font-mono tracking-wider">TIMELINE &rarr;</a>
            <a href="/compare" className="text-xs text-dim hover:text-text transition-colors font-mono tracking-wider">COMPARE &rarr;</a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {factories.map((f) => (
            <FactoryCard key={f.id} factory={f} />
          ))}
        </div>
      </section>

      {/* ── News Feed ── */}
      <section className="border-t border-border-custom">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-lg font-bold mb-3">Latest News</h2>
          <NewsFeed />
        </div>
      </section>
    </>
  );
}
