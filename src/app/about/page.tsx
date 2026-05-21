import type { Metadata } from "next";
import { factories } from "@/data/factories";
import { TICKERS, SECTORS } from "@/data/tickers";

export const metadata: Metadata = {
  title: "About — The visual atlas of how the future is being built — GIGASCOPE",
  description:
    "About GIGASCOPE — what we cover, how we source it, why Korean primary sources matter, our reliability policy, and the 5 moats. Not Bloomberg, not Yahoo Finance, not Wikipedia.",
};

const MOATS = [
  { n: "1", title: "Industrial essence", body: "How products actually work — 3D-interactive component breakdowns, first-principles technical descriptions. Not marketing copy, not 'what's hot.'" },
  { n: "2", title: "Physical sites", body: "Where things get built — satellite imagery, construction progress, lat/lng-verified facility maps from Gigafactory Texas to Hsinchu Fab 18." },
  { n: "3", title: "Supply chain visibility", body: "How everything connects — rare earths → semiconductors → AI infrastructure → robots / EVs. Hand-curated edges with primary sources." },
  { n: "4", title: "Future-facing framing", body: "Why it matters — 5-10 year scenarios, frontier-tech context. Not earnings noise." },
  { n: "5", title: "Visual + interactive UX", body: "How you experience it — 3D models, satellite maps, infographics, mobile-first. Spreadsheets are for accountants." },
];

const NOT_THIS = [
  { name: "Yahoo Finance", reason: "We don't compete on real-time stock prices." },
  { name: "Bloomberg Terminal", reason: "We're not a trading workstation." },
  { name: "Crunchbase", reason: "We're not a company database." },
  { name: "Wikipedia", reason: "Static text isn't an atlas." },
  { name: "TechCrunch", reason: "We're not a news outlet." },
];

const SOURCE_TIERS = [
  { tier: "Tier 1 — always preferred", color: "#00875a", items: ["SEC EDGAR (10-K, 20-F, S-1, 8-K)", "DART (한국 공시 — 삼성, SK, LG, 현대, 한화, LIG넥스원)", "Company IR / investor presentations", "Technical whitepapers (Blackwell, EUV, HBM specs)", "Academic literature (arXiv, Google Scholar)", "Government data (USGS minerals, KOSIS, FAA, EIA)"] },
  { tier: "Tier 2 — used with verification", color: "#0066cc", items: ["Reuters, Bloomberg, FT, WSJ (news only, cross-check numbers)", "Trade press (SemiAnalysis, AnandTech, Electrek, InsideEVs)"] },
  { tier: "Tier 3 — skeptical, citation-required", color: "#bf5600", items: ["Wikipedia (entry point only; follow citations)", "Reddit / X (trend signal only — never as fact)", "General blogs (only with verifiable primary-source link)"] },
  { tier: "Never trusted without verification", color: "#e63946", items: ["AI-generated web content with no provenance", "Aggregator sites with no source link", "Press releases in isolation"] },
];

const CONFIDENCE_LEVELS = [
  { l: "High", d: "Primary sources + direct verification (10-K, DART, IR, satellite-confirmed).", c: "#00875a" },
  { l: "Medium", d: "Multiple independent secondary sources corroborating; cross-checked.", c: "#0066cc" },
  { l: "Low", d: "Limited evidence or single secondary source. Marked 'est.' in copy.", c: "#bf5600" },
  { l: "Speculative", d: "Plans or unverified announcements. No measurable construction.", c: "#7b2dbd" },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">About GIGASCOPE</h1>
        <p className="text-dim text-base leading-relaxed max-w-2xl">
          GIGASCOPE is the visual atlas of how the future is being built. We cover {TICKERS.length} public companies,
          {" "}{factories.length} factory sites, {SECTORS.length} sectors of the AI / robotics / electrification / quantum / materials / defense build-out — with primary-source citations on everything.
        </p>
      </header>

      {/* 5 Moats */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">What we are (and aren't)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {MOATS.map((m) => (
            <div key={m.n} className="p-4 rounded border border-border-custom">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-dim">{m.n}</span>
                <span className="text-sm font-bold">{m.title}</span>
              </div>
              <p className="text-xs text-dim leading-relaxed">{m.body}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded border border-border-custom">
          <div className="text-sm font-bold mb-2">What we're not</div>
          <ul className="text-xs text-dim flex flex-col gap-1">
            {NOT_THIS.map((n) => (
              <li key={n.name}>
                <span className="font-medium text-text">{n.name}</span> · {n.reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Primary-source policy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Primary-source policy</h2>
        <p className="text-sm text-dim mb-4 max-w-2xl">
          Frontier-tech audiences (Musk fans, semiconductor analysts, rare-earth investors) are detail-obsessed. One wrong number = trust destroyed.
          So every number in our database has a hand-verified primary source attached to it. We never use Wikipedia, Reddit, or AI-generated content as a sole source.
        </p>
        <div className="flex flex-col gap-3">
          {SOURCE_TIERS.map((t) => (
            <div key={t.tier} className="p-4 rounded border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: t.color }}>
              <div className="text-sm font-bold mb-1.5" style={{ color: t.color }}>{t.tier}</div>
              <ul className="text-xs text-dim flex flex-col gap-0.5">
                {t.items.map((it) => <li key={it}>• {it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Korean differentiation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Why Korean coverage is a moat</h2>
        <p className="text-sm text-dim leading-relaxed max-w-2xl">
          Owner is Korean. Most Korean conglomerates (삼성전자, SK하이닉스, LG에너지솔루션, 현대자동차, 한화에어로스페이스, LIG넥스원) are global giants,
          but English-language analyst coverage is thin. DART (전자공시) discloses production capacity, customer concentration, capex roadmap with more granularity than US 10-Qs.
          Bloomberg's Korea desk is thin. Korean media doesn't write in English depth. GIGASCOPE sits in that gap — Korean primary sources translated and integrated, not summarized from English secondaries.
        </p>
      </section>

      {/* Confidence levels */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3">Confidence tags</h2>
        <p className="text-sm text-dim mb-4 max-w-2xl">
          Every milestone, catalyst, and forward-looking statement carries a tag. Tags are visible inline on the relevant page.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONFIDENCE_LEVELS.map((item) => (
            <div key={item.l} className="flex items-start gap-3 p-3 rounded border border-border-custom" style={{ borderLeftWidth: 3, borderLeftColor: item.c }}>
              <div>
                <div className="text-sm font-bold" style={{ color: item.c }}>{item.l}</div>
                <div className="text-xs text-dim leading-relaxed">{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Imagery */}
      <section className="mb-10 p-5 rounded border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: "#bf5600" }}>
        <h2 className="text-lg font-bold mb-2 text-amber-600" style={{ color: "#bf5600" }}>Imagery disclaimer</h2>
        <p className="text-sm text-dim leading-relaxed">
          Satellite imagery displayed on GIGASCOPE is <strong className="text-text">NOT real-time</strong>.
          ESRI World Imagery updates approximately every 3-6 months. Sentinel-2 data is annual cloudless composite.
          For near-real-time imagery, use Copernicus Data Space Ecosystem directly.
        </p>
      </section>

      {/* Tech stack */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3">Built with</h2>
        <div className="flex flex-wrap gap-2">
          {["Next.js 16", "React 19", "TypeScript", "Tailwind 4", "Leaflet", "ESRI World Imagery", "Sentinel-2 (EOX)", "Yahoo Finance", "Upstash Redis", "Vercel"].map((t) => (
            <span key={t} className="px-2.5 py-1 rounded border border-border-custom text-[12px] font-mono">{t}</span>
          ))}
        </div>
        <p className="text-xs text-dim mt-3">
          Open-source code:{" "}
          <a href="https://github.com/sincetwentytwo-sys/gigascope" target="_blank" rel="noopener noreferrer" className="underline">github.com/sincetwentytwo-sys/gigascope</a>
        </p>
      </section>

      {/* Disclaimer */}
      <section className="p-5 rounded border border-border-custom text-xs text-dim leading-relaxed">
        <strong className="text-text">Disclaimer</strong> — GIGASCOPE is an independent community project, not affiliated with Tesla, SpaceX, xAI, Neuralink, Boring Company, NVIDIA, TSMC, Samsung, SK Hynix, or any company tracked here. Atlas data is editorial. Not investment advice. Always verify with primary sources before acting.
      </section>
    </div>
  );
}
