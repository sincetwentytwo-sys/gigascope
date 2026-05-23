import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Downloads — CSV/JSON exports — GIGASCOPE",
  description:
    "Bulk export the GIGASCOPE dataset: factories, tickers, milestones, supply-chain edges, products. CSV or JSON. Free during the Investor early-bird period.",
  alternates: { canonical: "https://gigascope.xyz/downloads" },
  openGraph: {
    title: "Downloads — CSV/JSON exports — GIGASCOPE",
    description:
      "Bulk export the GIGASCOPE dataset: factories, tickers, milestones, supply-chain edges, products. CSV or JSON. Free during the Investor early-bird period.",
    url: "https://gigascope.xyz/downloads",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloads — CSV/JSON exports — GIGASCOPE",
    description:
      "Bulk export the GIGASCOPE dataset: factories, tickers, milestones, supply-chain edges, products. CSV or JSON. Free during the Investor early-bird period.",
  },
};

const DATASETS = [
  { id: "factories",    name: "Factories",       desc: "16 sites with lat/lng, status, area, investment, milestones.", rows: "16" },
  { id: "tickers",      name: "Companies",       desc: "29 public companies — thesis, market cap, sectors, last-verified date.", rows: "29" },
  { id: "milestones",   name: "Milestones",      desc: "All site milestones (done + upcoming) with confidence + lastVerified.", rows: "200+" },
  { id: "supply-chain", name: "Supply chain",    desc: "Directional edges between companies — from/to/flow/criticality.", rows: "33" },
  { id: "products",     name: "Products",        desc: "13 component-breakdown spec headers (slug, name, category, partCount).", rows: "13" },
];

export default function DownloadsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Downloads</h1>
        <p className="text-dim max-w-2xl">
          Bulk export the underlying GIGASCOPE data. CSV or JSON. Free during the Investor early-bird period. Rate-limited.
          Always treat as point-in-time — re-fetch for the latest.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {DATASETS.map((d) => (
          <li key={d.id} className="p-4 rounded border border-border-custom">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{d.name}</div>
                <div className="text-xs text-dim mt-0.5">{d.desc}</div>
                <div className="text-[11px] text-dim mt-1">≈ {d.rows} rows</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a
                  href={`/api/export/${d.id}?format=csv`}
                  className="text-xs px-2.5 py-1 rounded border border-border-custom hover:border-text"
                  download
                >
                  CSV
                </a>
                <a
                  href={`/api/export/${d.id}?format=json`}
                  className="text-xs px-2.5 py-1 rounded border border-border-custom hover:border-text"
                  download
                >
                  JSON
                </a>
              </div>
            </div>
            <div className="text-[10px] font-mono text-dim">/api/export/{d.id}?format=csv|json</div>
          </li>
        ))}
      </ul>

      <section className="mt-10 text-xs text-dim">
        <strong className="text-text">Terms</strong>: GIGASCOPE data is editorial. Cite "GIGASCOPE" and the underlying primary sources
        (linked on each company page) for re-use. Don't republish full bulk exports verbatim — link back.
      </section>
    </div>
  );
}
