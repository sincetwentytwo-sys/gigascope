import { factories, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 3600;

export default function Home() {
  const featured = factories.find((f) => f.featured);
  const rest = factories.filter((f) => !f.featured);

  return (
    <>
      {/* ── Header — one line, says what this is ── */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Tesla Factory Tracker
        </h1>
        <p className="text-sm text-dim mt-1">
          {factories.length} factories &middot; {getTotalInvestment()} invested &middot; 4 countries
        </p>
      </section>

      {/* ── Terafab spotlight — biggest news, visually distinct ── */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 pb-6">
          <a
            href={`/factory/${featured.slug}`}
            className="block border-2 border-accent-pink/40 bg-accent-pink/[0.04] p-5 sm:p-6 group hover:border-accent-pink/60 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider">NEW</span>
                  <span className="font-mono text-[9px] text-dim">MAR 21, 2026</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black group-hover:text-accent-pink transition-colors">
                  {featured.flag} {featured.name}
                </h2>
                <p className="text-sm text-dim mt-0.5">{featured.aka} &mdash; {featured.products}</p>
              </div>
              <div className="flex gap-6 sm:gap-8">
                <div className="text-right">
                  <div className="font-mono text-xl sm:text-2xl font-black text-accent-pink">{featured.investment}</div>
                  <div className="text-[9px] text-dim tracking-widest">INVESTMENT</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl sm:text-2xl font-black">{featured.capacity}</div>
                  <div className="text-[9px] text-dim tracking-widest">CAPACITY</div>
                </div>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-1 bg-white/5 overflow-hidden">
                <div className="h-full" style={{ width: `${featured.progress}%`, background: featured.color }} />
              </div>
              <span className="font-mono text-xs font-bold" style={{ color: featured.color }}>{featured.progress}%</span>
            </div>
          </a>
        </section>
      )}

      {/* ── Factory grid ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-bold">All Factories</h2>
          <div className="flex gap-4">
            <a href="/timeline" className="text-xs text-dim hover:text-text transition-colors font-mono tracking-wider">TIMELINE &rarr;</a>
            <a href="/compare" className="text-xs text-dim hover:text-text transition-colors font-mono tracking-wider">COMPARE &rarr;</a>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {rest.map((f) => (
            <FactoryCard key={f.id} factory={f} />
          ))}
        </div>
        <p className="font-mono text-[9px] text-dim mt-3">Updated {DATA_LAST_UPDATED}</p>
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
