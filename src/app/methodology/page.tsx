import type { Metadata } from "next";
import { factories, DATA_LAST_UPDATED } from "@/data/factories";

export const metadata: Metadata = {
  title: "Methodology — How we calculate progress % — GIGASCOPE",
  description:
    "Satellite imagery sources, progress calculation, update cadence, limitations. The honest version of where our numbers come from.",
  alternates: { canonical: "https://gigascope.xyz/methodology" },
  openGraph: {
    title: "Methodology — How we calculate progress % — GIGASCOPE",
    description:
      "Satellite imagery sources, progress calculation, update cadence, limitations. The honest version of where our numbers come from.",
    url: "https://gigascope.xyz/methodology",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Methodology — How we calculate progress % — GIGASCOPE",
    description:
      "Satellite imagery sources, progress calculation, update cadence, limitations. The honest version of where our numbers come from.",
  },
};

const IMAGERY = [
  { name: "ESRI World Imagery", res: "~30 cm/pixel (urban) / ~1 m elsewhere", refresh: "every 3–6 months", cost: "free, in use today", url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" },
  { name: "Copernicus Sentinel-2 (EOX cloudless)", res: "10 m/pixel", refresh: "annual cloudless composite", cost: "free, in use today", url: "https://s2maps.eu/" },
  { name: "Planet Labs PlanetScope (aspirational)", res: "3 m/pixel", refresh: "daily revisit", cost: "paid, not yet wired", url: "https://www.planet.com/products/planet-imagery/" },
  { name: "Maxar (aspirational)", res: "30 cm/pixel", refresh: "on demand", cost: "paid, not yet wired", url: "https://www.maxar.com/products/satellite-imagery" },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-[820px] mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Methodology</h1>
        <p className="text-dim leading-relaxed">
          Where the numbers come from. The honest version, including the parts that are still aspirational.
          Last methodology refresh: <span className="font-mono">{DATA_LAST_UPDATED}</span>.
        </p>
      </header>

      {/* Satellite imagery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">1. Satellite imagery sources</h2>
        <p className="text-sm text-dim mb-4 max-w-prose">
          Today we run on ESRI World Imagery + Sentinel-2 — both free, both with predictable refresh cadence. Planet Labs and
          Maxar are on the roadmap; we won't claim daily-revisit numbers until they're actually wired.
        </p>
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase text-dim border-b border-border-custom">
            <tr>
              <th className="py-2">Source</th>
              <th className="py-2">Resolution</th>
              <th className="py-2">Refresh</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {IMAGERY.map((i) => (
              <tr key={i.name} className="border-b border-border-custom">
                <td className="py-2.5">
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="underline">{i.name}</a>
                </td>
                <td className="py-2.5 text-dim">{i.res}</td>
                <td className="py-2.5 text-dim">{i.refresh}</td>
                <td className="py-2.5 text-dim">{i.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Progress calculation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">2. How "Progress %" is calculated</h2>
        <div className="p-4 rounded border border-border-custom bg-surface mb-4">
          <div className="font-mono text-sm">
            Progress % = (Built footprint area) / (Planned footprint area)
          </div>
        </div>
        <ul className="text-sm flex flex-col gap-2 list-disc pl-5">
          <li><strong>Built footprint</strong> — hand-traced polygon on the latest cloud-free satellite capture. Roof + finished structures only. Active construction zones excluded.</li>
          <li><strong>Planned footprint</strong> — official site plans, building permits (where public), FAA filings (for SpaceX), and zoning records. When the company published a master plan, we use that.</li>
          <li><strong>Cross-checks</strong> — county tax records, GIS portals, drone footage from local reporters (sources cited inline on each site), satellite timelapses.</li>
        </ul>
        <p className="text-sm text-dim mt-4">
          Important: these are <strong className="text-text">estimates, not audited numbers</strong>. We don't have a robot doing pixel classification — a human (the project owner) traces the polygons every refresh cycle.
        </p>
      </section>

      {/* Update cadence */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">3. Update cadence</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-border-custom">
              <td className="py-2.5 font-medium" style={{ color: "#00875a" }}>Operational sites</td>
              <td className="py-2.5 text-dim">Monthly (footprint changes are slower).</td>
            </tr>
            <tr className="border-b border-border-custom">
              <td className="py-2.5 font-medium" style={{ color: "#0066cc" }}>Expanding sites</td>
              <td className="py-2.5 text-dim">Bi-weekly when ESRI has a fresh capture; otherwise as Sentinel-2 refreshes.</td>
            </tr>
            <tr className="border-b border-border-custom">
              <td className="py-2.5 font-medium" style={{ color: "#bf5600" }}>Construction sites</td>
              <td className="py-2.5 text-dim">Weekly target; depends on imagery availability.</td>
            </tr>
            <tr className="border-b border-border-custom">
              <td className="py-2.5 font-medium" style={{ color: "#c4a000" }}>Announced sites</td>
              <td className="py-2.5 text-dim">Monthly — looking for groundbreaking detection.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Latest captures per site */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">4. Last capture per site</h2>
        <p className="text-sm text-dim mb-4">When the polygons were last hand-verified. Empty cells mean still on the pre-pivot data.</p>
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase text-dim border-b border-border-custom">
            <tr>
              <th className="py-2">Site</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Last update</th>
            </tr>
          </thead>
          <tbody>
            {factories.map((f) => (
              <tr key={f.slug} className="border-b border-border-custom">
                <td className="py-2.5">
                  <a href={`/site/${f.slug}`} className="hover:underline">{f.flag} {f.name}</a>
                </td>
                <td className="py-2.5 text-dim">{f.status}</td>
                <td className="py-2.5 text-right text-dim font-mono text-xs">{f.lastUpdated ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Limitations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">5. Limitations (the honest list)</h2>
        <ul className="text-sm flex flex-col gap-2 list-disc pl-5">
          <li>Indoor work isn't visible. A "100% built" site can be at 0% production capacity.</li>
          <li>"Operational" doesn't mean "at nameplate capacity" — it means the imagery shows finished structures plus visible activity.</li>
          <li>Cloud cover, sun angle, and seasonal vegetation can move the polygon trace by ±2-3% between captures. We don't report sub-5% changes as news.</li>
          <li>Investment numbers come from company statements + government incentive disclosures. They're the company's number, not ours.</li>
          <li>Announced projects with no visible groundbreaking are tagged Speculative — we don't put a progress % on them at all.</li>
          <li>This is a one-person project, not a satellite intelligence firm. If you need audited capacity numbers, talk to your local equity analyst.</li>
        </ul>
      </section>

      {/* Citation policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">6. Citation policy</h2>
        <p className="text-sm text-dim leading-relaxed mb-3">
          Every milestone in our database links back to a primary source — SEC 10-K filings, DART quarterly reports, IR investor decks,
          company press releases, government data (USGS, KOSIS, EIA, FAA), or NRC dockets where they exist.
          We're moving from Wikipedia-anchored citations to primary sources (county permits, FAA filings, SEC EDGAR, IR pages)
          across Q2-Q3 2026 — most pre-pivot site records still carry a Wikipedia revision pointer as the entry reference while
          that migration is in flight. Reddit and AI-generated content are never used as a sole source.
        </p>
        <p className="text-sm text-dim leading-relaxed">
          When sources conflict, both are noted (e.g., "company guidance $20-25B, industry estimate $35-45B"). When something is an estimate, we say "est."
        </p>
      </section>

      {/* Contact */}
      <section className="p-5 rounded border border-border-custom text-sm">
        <strong>Spot a wrong number?</strong> Drop it in the <a href="https://github.com/sincetwentytwo-sys/gigascope/issues" target="_blank" rel="noopener noreferrer" className="underline">GitHub issue tracker</a> with the source URL. We fix and credit.
      </section>
    </div>
  );
}
