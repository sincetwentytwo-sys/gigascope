import type { Metadata } from "next";
import { factories } from "@/data/factories";

export const metadata: Metadata = {
  title: "About — GIGASCOPE",
  description: "About GIGASCOPE — Musk Empire site tracker (Tesla, SpaceX, xAI, Neuralink, Boring) powered by satellite imagery and public data",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-black mb-4">About GIGASCOPE</h1>
        <p className="text-dim text-base leading-relaxed max-w-2xl">
          GIGASCOPE is a community-built dashboard that tracks construction and operations
          progress across 16 Musk Empire sites (Tesla, SpaceX, xAI, Neuralink, Boring Company).
          Satellite imagery comparison, milestone tracking, news, and community discussions in one place.
        </p>
      </div>

      {/* What we track */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">What We Track</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {factories.map((f) => (
            <a
              key={f.id}
              href={`/site/${f.slug}`}
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
            { name: "Sentinel-2 (EOX)", desc: "Annual cloudless composite from Copernicus Sentinel-2", color: "var(--amber)" },
            { name: "Electrek, Teslarati, Not A Tesla App", desc: "Tesla-dedicated news via RSS", color: "var(--text)" },
            { name: "Reuters, Bloomberg, WSJ, FT (via Google News)", desc: "Breaking business coverage filtered by Tesla/SpaceX keywords", color: "var(--dim)" },
            { name: "Reddit r/teslamotors, r/SpaceXLounge, r/teslainvestorsclub", desc: "Community discussions via public RSS", color: "var(--pink)" },
            { name: "Hacker News (Algolia API)", desc: "Tech discussions filtered by points and recency", color: "var(--amber)" },
            { name: "Yahoo Finance", desc: "TSLA live price ticker", color: "var(--cyan)" },
            { name: "Milestones & specs", desc: "Compiled manually from public filings, press releases, and satellite observations", color: "var(--text)" },
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

      {/* Data Confidence & Announced Projects */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Data Confidence &amp; Announced Projects</h2>

        <div className="space-y-5">
          {/* Confidence Levels */}
          <div>
            <div className="text-sm font-medium mb-3">Confidence Levels</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              {[
                { l: "High", d: "Primary sources + direct verification (official filings, verified satellite observations)", c: "var(--cyan)" },
                { l: "Medium", d: "Corroborated by multiple independent reports and public records", c: "var(--amber)" },
                { l: "Low", d: "Estimated from limited evidence or single secondary sources", c: "var(--pink)" },
                { l: "Speculative", d: "Plans or unverified announcements — active construction may not have started", c: "#c4a000" },
              ].map((item) => (
                <div key={item.l} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.c }} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium">{item.l}</div>
                    <div className="text-[11px] text-dim leading-snug">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announced Projects */}
          <div>
            <div className="text-sm font-medium mb-1.5">Announced Projects</div>
            <p className="text-xs text-dim leading-relaxed">
              Projects labeled "Announced" are publicly declared future facilities or major expansions. Ground has not been broken, or no measurable construction progress is visible in current satellite imagery. They use gold (#c4a000) accent styling and a dashed placeholder instead of the progress bar.
            </p>
          </div>
        </div>

        {/* Reliability Policy */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[11px] text-dim leading-relaxed">
            <span className="font-medium text-text">Reliability policy:</span> Every milestone and factory record carries a confidence tag. Data is curated manually from public sources and cross-checked where possible. Last verification dates are recorded when available. We never fabricate progress or invent unannounced sites. All numbers are best-effort estimates and may be outdated. Cross-reference official sources before relying on any figure.
          </p>
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
            "Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4",
            "Leaflet", "Vercel", "Upstash Redis", "ESRI", "Sentinel-2",
          ].map((t) => (
            <span key={t} className="px-3 py-1.5 rounded-full text-xs font-mono glass-card">
              {t}
            </span>
          ))}
        </div>
        <p className="text-xs text-dim mt-4">
          Source code:{" "}
          <a
            href="https://github.com/sincetwentytwo-sys/gigascope"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text"
          >
            github.com/sincetwentytwo-sys/gigascope
          </a>
        </p>
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
