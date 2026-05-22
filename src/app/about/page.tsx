import type { Metadata } from "next";
import { factories } from "@/data/factories";

export const metadata: Metadata = {
  title: "About — GIGASCOPE",
  description:
    "GIGASCOPE tracks Musk-empire build-out from orbit: Tesla, SpaceX, xAI, Neuralink, Boring Company — 16 sites, weekly satellite captures, primary sources.",
};

const TRACKED = [
  { co: "Tesla", note: "Gigafactories — Fremont, Texas, Nevada, Berlin, Shanghai, plus announced sites." },
  { co: "SpaceX", note: "Starbase, McGregor, Hawthorne, Vandenberg, Cape Canaveral pads." },
  { co: "xAI", note: "Colossus (Memphis) and follow-on data-center footprint." },
  { co: "Neuralink", note: "Fremont HQ and the Austin expansion." },
  { co: "The Boring Company", note: "Bastrop HQ, Vegas Loop dig sites." },
];

const NOT_THIS = [
  "No stock price predictions, no analyst price targets.",
  "No \"Musk tweeted X\" speculation, no rumor amplification.",
  "No aggregator-news churn — primary sources or it doesn't go in.",
  "No affiliate links, paid placements, or sponsored posts.",
];

export default function AboutPage() {
  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      {/* Hero */}
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">About GIGASCOPE</h1>
        <p className="text-dim text-lg leading-relaxed max-w-xl">
          Watch Musk's empire get built — Tesla, SpaceX, xAI, Neuralink, Boring Company — one satellite frame at a time.
        </p>
      </header>

      {/* Why this exists */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">Why this site exists</h2>
        <p className="text-sm leading-relaxed text-dim max-w-prose">
          Five companies inside one founder's orbit are reshaping cars, launch, AI compute, neural interfaces, and tunnels — at the same time, in public, on dirt you can see from space.
          Nobody is tracking the physical build-out of all five together on a weekly cadence. Bloomberg covers the earnings. Visible Alpha models the revenue. Aggregators churn the headlines.
          GIGASCOPE watches the construction sites — Sentinel-2 captures, manually traced polygons, milestones logged against permits and FAA filings. That's the entire job.
        </p>
      </section>

      {/* What we track */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">What we track</h2>
        <p className="text-sm text-dim mb-4">
          {factories.length} sites across the five companies, refreshed against Copernicus Sentinel-2 imagery (10 m/pixel, weekly cadence where cloud-free captures exist).
        </p>
        <ul className="flex flex-col gap-2.5 mb-4">
          {TRACKED.map((t) => (
            <li key={t.co} className="flex gap-3 p-3 rounded border border-border-custom bg-surface">
              <span className="font-bold text-sm w-32 flex-shrink-0">{t.co}</span>
              <span className="text-sm text-dim">{t.note}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-dim leading-relaxed max-w-prose">
          Each site gets a hand-traced footprint polygon on the latest cloud-free capture, a milestone log cross-checked against building permits, FAA filings, and county records,
          and primary-source citations on every progress number.
        </p>
      </section>

      {/* What we don't do */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">What we don't do</h2>
        <p className="text-sm text-dim mb-4 max-w-prose">
          The shortlist of things GIGASCOPE deliberately stays out of — because they're either someone else's job or actively corrosive to trust.
        </p>
        <ul className="flex flex-col gap-2">
          {NOT_THIS.map((line) => (
            <li key={line} className="flex gap-3 text-sm">
              <span className="text-dim flex-shrink-0">×</span>
              <span className="text-dim">{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Methodology pointer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">Methodology in one paragraph</h2>
        <p className="text-sm text-dim leading-relaxed max-w-prose">
          Progress % = built footprint area ÷ planned footprint area. Built footprint is a human-traced polygon on the latest cloud-free Sentinel-2 (and ESRI World Imagery, where it's
          fresher) capture. Planned footprint comes from master plans, building permits, FAA filings, and zoning records. Cross-checked against county tax records, GIS portals, and
          on-the-ground reporting. These are estimates, not audited numbers. Full version with caveats and update cadence on the{" "}
          <a href="/methodology" className="underline">methodology page</a>.
        </p>
      </section>

      {/* Who runs this */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3">Who runs this</h2>
        <p className="text-sm text-dim leading-relaxed max-w-prose">
          One person — Jaebin, Korean, working out of Seoul. No team, no investors, no advertisers. The code is open source on{" "}
          <a href="https://github.com/sincetwentytwo-sys/gigascope" target="_blank" rel="noopener noreferrer" className="underline">
            GitHub
          </a>{" "}
          — pull requests, issues, and corrections welcome. Reply to any digest email and a human reads it.
        </p>
      </section>

      {/* Disclaimer */}
      <section className="p-5 rounded border border-border-custom bg-surface text-xs text-dim leading-relaxed">
        <strong className="text-text">Disclaimer</strong> — GIGASCOPE is an independent community project. Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.
        Satellite imagery is not real-time; refresh cadence and limitations are documented on the methodology page. Not financial advice. Always verify with primary sources before acting.
      </section>
    </div>
  );
}
