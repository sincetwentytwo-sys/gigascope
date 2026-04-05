import { factories, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  const featured = factories.filter((f) => f.featured);
  const rest = factories.filter((f) => !f.featured);

  return (
    <>
      {/* ── TERAFAB SPOTLIGHT — most important, top of page ── */}
      {featured.map((f) => (
        <section key={f.id} className="border-b border-accent-pink/20 bg-accent-pink/[0.02]">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <a href={`/factory/${f.slug}`} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider">NEW</span>
                  <span className="font-mono text-[9px] text-dim tracking-widest">MAR 21, 2026</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black group-hover:text-accent-pink transition-colors">
                  {f.flag} {f.name}
                </h2>
                <p className="text-sm text-dim mt-0.5">{f.aka} &mdash; {f.products}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-mono text-xl font-black text-accent-pink">{f.investment}</div>
                  <div className="text-[9px] text-dim tracking-widest">INVESTMENT</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-black">{f.capacity}</div>
                  <div className="text-[9px] text-dim tracking-widest">CAPACITY</div>
                </div>
                <span className="text-dim group-hover:text-text transition-colors">&rarr;</span>
              </div>
            </a>
          </div>
        </section>
      ))}

      {/* ── FACTORY GRID — data first, no filler ── */}
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
          {rest.map((f) => (
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
