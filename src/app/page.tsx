import { factories, getTotalInvestment } from "@/data/factories";
import FactoryCard from "@/components/FactoryCard";
import GlobeWrapper from "@/components/GlobeWrapper";

export default function Home() {
  return (
    <>
      {/* ── HERO: Stitch-designed orbital command center ── */}
      <section
        className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ contain: "strict" }}
      >
        {/* Radial glow background */}
        <div className="absolute inset-0 radial-glow pointer-events-none" />

        {/* 3D Globe */}
        <div className="globe-wrapper absolute inset-0 z-0 overflow-hidden">
          <GlobeWrapper />
        </div>

        {/* Radar scope SVG overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] pointer-events-none opacity-30 z-[1]">
          <svg className="w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="0.1" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="0.1" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(0,212,255,0.25)" strokeWidth="0.2" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="18" fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="0.1" strokeDasharray="0.5 2" />
            {/* Sweep line */}
            <rect x="50" y="2" width="0.3" height="48" fill="url(#sweepGrad)" />
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Floating data chips (asymmetric, Stitch-style) */}
        <div className="absolute top-[22%] left-[8%] sm:left-[18%] z-10 pointer-events-none">
          <div className="bg-surface/40 backdrop-blur-md border border-accent-cyan/10 px-4 py-2 rounded-sm shadow-[0_0_20px_rgba(0,212,255,0.08)]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-accent-cyan">8 FACTORIES</span>
            </div>
          </div>
        </div>
        <div className="absolute top-[32%] right-[6%] sm:right-[14%] z-10 pointer-events-none">
          <div className="bg-surface/40 backdrop-blur-md border border-accent-cyan/10 px-4 py-2 rounded-sm shadow-[0_0_20px_rgba(0,212,255,0.08)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-accent-cyan">4 COUNTRIES</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[28%] left-[10%] sm:left-[16%] z-10 pointer-events-none">
          <div className="bg-surface/40 backdrop-blur-md border border-accent-green/10 px-4 py-2 rounded-sm shadow-[0_0_20px_rgba(46,196,182,0.08)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-accent-green">{getTotalInvestment()} INVESTED</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[22%] right-[8%] sm:right-[20%] z-10 pointer-events-none">
          <div className="bg-accent-red/10 backdrop-blur-md border border-accent-red/20 px-4 py-2 rounded-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent-red rounded-full animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-accent-red">LIVE TRACKING</span>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="z-20 text-center max-w-5xl px-4">
          {/* Satellite link badge */}
          <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 border border-border-custom bg-surface/50 backdrop-blur-sm rounded-full">
            <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">SATELLITE LINK ESTABLISHED</span>
            <div className="w-1 h-1 bg-accent-cyan rounded-full animate-pulse" />
            <span className="font-mono text-[9px] tracking-[0.2em] text-accent-cyan uppercase">ORBIT_049</span>
          </div>

          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter mb-4 bg-gradient-to-b from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent leading-none">
            GIGASCOPE
          </h1>
          <p className="text-lg sm:text-xl font-light text-text/80 tracking-tight mb-10">
            Satellite-powered factory intelligence for the orbital age.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <a
              href="#factories"
              className="group relative px-8 py-3.5 bg-gradient-to-br from-accent-cyan to-accent-blue text-bg font-bold text-xs tracking-widest uppercase overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            >
              <span className="relative z-10">EXPLORE FACTORIES</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
            <a
              href="/compare"
              className="px-8 py-3.5 border border-border-custom text-text font-medium text-xs tracking-widest uppercase hover:bg-white/5 transition-colors"
            >
              COMPARE SATELLITE
            </a>
          </div>
        </div>

        {/* Scroll indicator (Stitch-style) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="font-mono text-[9px] tracking-[0.3em] text-dim uppercase">SCROLL FOR TELEMETRY</span>
          <div className="w-5 h-9 border border-border-custom rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-accent-cyan rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Feature modules (Stitch 3-column layout) ── */}
      <section className="relative z-10 py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🛰️", num: "01", label: "OBSERVATION", title: "Satellite Comparison", desc: "Before/after imagery from Sentinel-2 and ESRI World Imagery to track construction changes over time.", href: "/compare" },
            { icon: "📊", num: "02", label: "ANALYSIS", title: "Progress Tracking", desc: "Milestone timelines, year-by-year progress charts, and capacity projections for all 8 global factories.", href: "/timeline" },
            { icon: "🌐", num: "03", label: "INTELLIGENCE", title: "Global Network", desc: "From Terafab's 2nm chip fab to Giga Shanghai's 950K capacity — every factory on one orbital dashboard.", href: "#factories" },
          ].map((m) => (
            <a key={m.num} href={m.href} className="glass-card border-l-2 border-l-accent-cyan/30 border-t-0 border-r-0 border-b-0 rounded-none p-7 flex flex-col gap-5 group hover:border-l-accent-cyan transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-2xl">{m.icon}</span>
                <span className="font-mono text-[9px] text-dim">{m.num} // {m.label}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent-cyan transition-colors">{m.title}</h3>
                <p className="text-xs text-dim leading-relaxed">{m.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── Factory Grid ── */}
      <section id="factories" className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-accent-cyan rounded-full" />
              <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">ACTIVE NETWORK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Global Factories</h2>
          </div>
          <span className="font-mono text-xs text-dim hidden sm:block">
            {factories.length} NODES ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {factories.map((f) => (
            <FactoryCard key={f.id} factory={f} />
          ))}
        </div>
      </section>

      {/* Coordinates overlay (Stitch-style footer detail) */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none hidden sm:flex flex-col items-end gap-0.5">
        <span className="font-mono text-[8px] text-accent-cyan/40 uppercase">LAT: 30.2223° N</span>
        <span className="font-mono text-[8px] text-accent-cyan/40 uppercase">LON: 97.6171° W</span>
        <span className="font-mono text-[8px] text-accent-cyan/40 uppercase">SYS: NOMINAL</span>
      </div>
    </>
  );
}
