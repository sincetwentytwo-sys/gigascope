import { factories, getTotalInvestment } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import GlobeWrapper from "@/components/GlobeWrapper";

export default function Home() {
  // Separate featured (Terafab) from the rest
  const featured = factories.filter((f) => f.featured);
  const rest = factories.filter((f) => !f.featured);

  return (
    <>
      {/* ── HERO: Compact, data-first ── */}
      <section
        className="relative h-[85vh] flex flex-col items-center justify-center overflow-hidden"
        style={{ contain: "strict" }}
      >
        <div className="absolute inset-0 radial-glow pointer-events-none" />

        {/* 3D Globe */}
        <div className="globe-wrapper absolute inset-0 z-0 overflow-hidden">
          <GlobeWrapper />
        </div>

        {/* Minimal radar rings (subtle, not cosplay) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[550px] sm:h-[550px] pointer-events-none opacity-15 z-[1]">
          <svg className="w-full h-full animate-[spin_90s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#00d4ff" strokeWidth="0.1" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="#00d4ff" strokeWidth="0.08" strokeDasharray="1 4" />
          </svg>
        </div>

        {/* Hero content — direct, no fluff */}
        <div className="z-20 text-center max-w-4xl px-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-none">
            GIGASCOPE
          </h1>
          <p className="text-base sm:text-lg text-dim tracking-tight mb-8 max-w-lg mx-auto">
            Track Tesla&apos;s global factory construction with satellite imagery.
          </p>

          {/* Real stats — not decoration */}
          <div className="inline-flex items-center gap-6 sm:gap-10 mb-8 pointer-events-none">
            {[
              { value: "8", label: "Factories" },
              { value: getTotalInvestment(), label: "Invested" },
              { value: "4", label: "Countries" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-xl sm:text-2xl font-bold font-mono text-accent-cyan">{s.value}</div>
                <div className="text-[9px] text-dim tracking-widest uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pointer-events-auto">
            <a
              href="#factories"
              className="px-7 py-3 bg-accent-cyan text-bg font-bold text-xs tracking-widest uppercase hover:bg-accent-cyan/90 transition-colors"
            >
              VIEW FACTORIES
            </a>
            <a
              href="/compare"
              className="px-7 py-3 border border-border-custom text-text text-xs tracking-widest uppercase hover:bg-white/5 transition-colors"
            >
              SATELLITE COMPARE
            </a>
          </div>
        </div>

        {/* Scroll indicator — minimal */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-10 bg-gradient-to-b from-dim/50 to-transparent" />
        </div>
      </section>

      {/* ── TERAFAB SPOTLIGHT — the most important thing first ── */}
      {featured.map((f) => (
        <section key={f.id} className="relative z-10 border-y border-accent-pink/20 bg-accent-pink/[0.02]">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <a href={`/factory/${f.slug}`} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider animate-pulse">NEW</span>
                  <span className="font-mono text-[9px] text-dim tracking-widest">ANNOUNCED MAR 21, 2026</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black group-hover:text-accent-pink transition-colors">
                  {f.flag} {f.name}
                </h2>
                <p className="text-sm text-dim mt-1 max-w-xl">{f.aka} — {f.products}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-mono text-3xl font-black text-accent-pink">{f.investment}</div>
                  <div className="text-[9px] text-dim tracking-widest">INVESTMENT</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-3xl font-black text-accent-cyan">{f.capacity}</div>
                  <div className="text-[9px] text-dim tracking-widest">CAPACITY</div>
                </div>
                <span className="text-dim group-hover:text-text transition-colors text-2xl">→</span>
              </div>
            </a>
          </div>
        </section>
      ))}

      {/* ── FACTORY GRID — no filler, just data ── */}
      <section id="factories" className="relative z-10 max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">All Factories</h2>
          <div className="flex gap-4">
            <a href="/timeline" className="text-xs text-dim hover:text-accent-cyan transition-colors font-mono tracking-wider">TIMELINE →</a>
            <a href="/compare" className="text-xs text-dim hover:text-accent-cyan transition-colors font-mono tracking-wider">COMPARE →</a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rest.map((f) => (
            <FactoryCard key={f.id} factory={f} />
          ))}
        </div>
      </section>

      {/* ── Quick links — functional, not decorative ── */}
      <section className="relative z-10 border-t border-border-custom">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/compare" className="glass-card p-5 group hover:border-accent-cyan/30">
            <div className="text-sm font-bold mb-1 group-hover:text-accent-cyan transition-colors">Satellite Compare</div>
            <p className="text-xs text-dim">Before/after imagery from two satellite sources.</p>
          </a>
          <a href="/timeline" className="glass-card p-5 group hover:border-accent-cyan/30">
            <div className="text-sm font-bold mb-1 group-hover:text-accent-cyan transition-colors">Global Timeline</div>
            <p className="text-xs text-dim">Every milestone across 8 factories, chronologically.</p>
          </a>
          <a href="/about" className="glass-card p-5 group hover:border-accent-cyan/30">
            <div className="text-sm font-bold mb-1 group-hover:text-accent-cyan transition-colors">Data Sources</div>
            <p className="text-xs text-dim">ESRI, Sentinel-2, and how this tracker works.</p>
          </a>
        </div>
      </section>
    </>
  );
}
