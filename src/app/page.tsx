import { factories, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 3600;

export default function Home() {
  const featured = factories.find((f) => f.featured);
  const rest = factories.filter((f) => !f.featured);

  return (
    <>
      {/* Hero — Tesla style, big and bold */}
      <section className="text-center py-16 sm:py-24 px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          Tesla Factory Tracker
        </h1>
        <p className="text-lg text-dim max-w-lg mx-auto">
          {factories.length} factories &middot; {getTotalInvestment()} invested &middot; 4 countries
        </p>
      </section>

      {/* Terafab spotlight */}
      {featured && (
        <section className="max-w-[1200px] mx-auto px-6 pb-12">
          <a href={`/factory/${featured.slug}`} className="block bg-text text-bg rounded-2xl p-8 sm:p-10 group hover:opacity-95 transition-opacity">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white/20 text-white">NEW</span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3">
                  {featured.flag} {featured.name}
                </h2>
                <p className="text-bg/60 mt-1">{featured.aka} &mdash; {featured.products}</p>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{featured.investment}</div>
                  <div className="text-[11px] text-bg/50 mt-0.5">Investment</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{featured.capacity}</div>
                  <div className="text-[11px] text-bg/50 mt-0.5">Capacity</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-white" style={{ width: `${featured.progress}%` }} />
              </div>
              <span className="text-sm font-bold text-white">{featured.progress}%</span>
            </div>
          </a>
        </section>
      )}

      {/* Factory grid */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-bold">All Factories</h2>
          <div className="flex gap-4 text-[13px] text-dim">
            <a href="/timeline" className="hover:text-text transition-colors">Timeline &rarr;</a>
            <a href="/compare" className="hover:text-text transition-colors">Compare &rarr;</a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rest.map((f) => (
            <FactoryCard key={f.id} factory={f} />
          ))}
        </div>
        <p className="text-xs text-dim mt-4">Updated {DATA_LAST_UPDATED}</p>
      </section>

      {/* News */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Latest News</h2>
          <NewsFeed />
        </div>
      </section>
    </>
  );
}
