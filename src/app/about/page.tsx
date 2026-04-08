import type { Metadata } from "next";
import { factories } from "@/data/factories";

export const metadata: Metadata = {
  title: "About — GIGASCOPE",
  description: "About GIGASCOPE — Tesla factory construction tracker powered by satellite imagery",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-accent-cyan rounded-full" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">MISSION BRIEFING</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">About GIGASCOPE</h1>
        <p className="text-dim text-base leading-relaxed max-w-2xl">
          GIGASCOPE is a community-built dashboard that tracks Tesla factory construction
          progress worldwide using satellite imagery comparison, milestone tracking, and
          3D globe visualization.
        </p>
      </div>

      {/* What we track */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">What We Track</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {factories.map((f) => (
            <a
              key={f.id}
              href={`/factory/${f.slug}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{f.flag} {f.name}</div>
                <div className="text-[0.65rem] text-dim">{f.location}</div>
              </div>
              <span className="font-mono text-xs" style={{ color: f.color }}>{f.progress}%</span>
            </a>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Data Sources</h2>
        <div className="flex flex-col gap-4">
          {[
            { name: "ESRI World Imagery", desc: "High-resolution satellite basemap, updated every 3-6 months", color: "var(--cyan)" },
            { name: "Sentinel-2 by EOX", desc: "Annual cloudless composite mosaic from Copernicus Sentinel-2 satellites", color: "var(--amber)" },
            { name: "CartoDB Dark", desc: "Dark basemap tiles for globe and map backgrounds", color: "var(--dim)" },
            { name: "Google Stitch SDK", desc: "AI-generated UI designs for the dashboard interface", color: "var(--pink)" },
          ].map((s) => (
            <div key={s.name} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
              <div>
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-dim">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Imagery disclaimer */}
      <div className="glass-card p-6 mb-6 border-l-2 border-l-accent-amber/50">
        <h2 className="text-lg font-bold mb-2 text-accent-amber">Imagery Disclaimer</h2>
        <p className="text-xs text-dim leading-relaxed">
          Satellite imagery displayed on GIGASCOPE is <strong className="text-text">NOT real-time</strong>.
          ESRI World Imagery is updated approximately every 3-6 months. Sentinel-2 data is an annual
          cloudless composite. For near-real-time Sentinel-2 imagery (5-day revisit cycle), a free
          Copernicus Data Space Ecosystem account is required.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Built With</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Next.js 16", "TypeScript", "Tailwind CSS", "Leaflet",
            "Vercel", "ESRI", "Sentinel-2",
          ].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full text-xs font-mono glass-card">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold mb-2">Disclaimer</h2>
        <p className="text-xs text-dim leading-relaxed">
          GIGASCOPE is an independent community project. It is <strong className="text-text">not affiliated with,
          authorized by, endorsed by, or in any way officially connected with Tesla, Inc.,
          SpaceX, xAI, or any of their subsidiaries</strong>. All product and company names are trademarks
          of their respective holders. Factory data is compiled from public sources and may
          not be fully accurate or up-to-date.
        </p>
      </div>
    </div>
  );
}
