import { factories, getTotalInvestment, DATA_LAST_UPDATED } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import WorldMap from "@/components/WorldMap";
import NewsFeed from "@/components/NewsFeed";

export default function Home() {
  const featured = factories.filter((f) => f.featured);
  const rest = factories.filter((f) => !f.featured);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-16 sm:py-24">
        {/* World Map */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-full max-w-4xl px-8">
            <WorldMap />
          </div>
        </div>

        <div className="relative z-10 text-center max-w-3xl px-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-3 leading-none">
            GIGASCOPE
          </h1>
          <p className="text-sm sm:text-base text-dim tracking-tight mb-8 max-w-md mx-auto">
            Track Tesla&apos;s global factory construction with satellite imagery.
          </p>

          <div className="inline-flex items-center gap-8 sm:gap-12 mb-8">
            {[
              { value: "8", label: "Factories" },
              { value: getTotalInvestment(), label: "Invested" },
              { value: "4", label: "Countries" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg sm:text-xl font-bold font-mono">{s.value}</div>
                <div className="text-[9px] text-dim tracking-widest uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#factories"
              className="px-6 py-2.5 bg-white text-bg font-bold text-xs tracking-widest uppercase hover:bg-white/90 transition-colors"
            >
              VIEW FACTORIES
            </a>
            <a
              href="/compare"
              className="px-6 py-2.5 border border-border-custom text-text text-xs tracking-widest uppercase hover:bg-white/5 transition-colors"
            >
              SATELLITE COMPARE
            </a>
          </div>
        </div>
      </section>

      {/* ── TERAFAB SPOTLIGHT ── */}
      {featured.map((f) => (
        <section key={f.id} className="border-y border-accent-pink/20 bg-accent-pink/[0.02]">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <a href={`/factory/${f.slug}`} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider">NEW</span>
                  <span className="font-mono text-[9px] text-dim tracking-widest">ANNOUNCED MAR 21, 2026</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black group-hover:text-accent-pink transition-colors">
                  {f.flag} {f.name}
                </h2>
                <p className="text-sm text-dim mt-1 max-w-xl">{f.aka} — {f.products}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-mono text-2xl font-black text-accent-pink">{f.investment}</div>
                  <div className="text-[9px] text-dim tracking-widest">INVESTMENT</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-black">{f.capacity}</div>
                  <div className="text-[9px] text-dim tracking-widest">CAPACITY</div>
                </div>
                <span className="text-dim group-hover:text-text transition-colors text-xl">&rarr;</span>
              </div>
            </a>
          </div>
        </section>
      ))}

      {/* ── FACTORY GRID ── */}
      <section id="factories" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">All Factories</h2>
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
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Latest News</h2>
            <span className="font-mono text-[9px] text-dim">
              Data updated {DATA_LAST_UPDATED}
            </span>
          </div>
          <NewsFeed />
        </div>
      </section>

      {/* ── Quick links ── */}
      <section className="border-t border-border-custom">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="/compare" className="glass-card p-4 group hover:border-white/15">
            <div className="text-sm font-bold mb-1">Satellite Compare</div>
            <p className="text-xs text-dim">Before/after imagery from two satellite sources.</p>
          </a>
          <a href="/timeline" className="glass-card p-4 group hover:border-white/15">
            <div className="text-sm font-bold mb-1">Global Timeline</div>
            <p className="text-xs text-dim">Every milestone across 8 factories, chronologically.</p>
          </a>
          <a href="/about" className="glass-card p-4 group hover:border-white/15">
            <div className="text-sm font-bold mb-1">Data Sources</div>
            <p className="text-xs text-dim">ESRI, Sentinel-2, and how this tracker works.</p>
          </a>
        </div>
      </section>
    </>
  );
}
