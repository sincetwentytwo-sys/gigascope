import type { Metadata } from "next";
import Link from "next/link";
import { getSite, getSitesByCompany, DATA_LAST_UPDATED } from "@/data/factories";
import EmailSignup from "@/components/EmailSignup";
import type { Factory, Milestone } from "@/data/types";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "SpaceX IPO — Track the 4 ground sites from orbit — GIGASCOPE",
  description:
    "Starbase, Hawthorne, Cape Canaveral, Vandenberg. Weekly Sentinel-2 satellite captures, milestone log, primary-source citations. Pre-IPO visibility on SpaceX's physical footprint.",
  alternates: { canonical: "https://gigascope.xyz/spacex-ipo" },
  openGraph: {
    title: "SpaceX IPO — Track the 4 ground sites from orbit",
    description:
      "Starbase, Hawthorne, Cape Canaveral, Vandenberg. Weekly Sentinel-2 satellite captures, milestone log, primary-source citations.",
    url: "https://gigascope.xyz/spacex-ipo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceX IPO — Track the 4 ground sites from orbit",
    description:
      "Starbase, Hawthorne, Cape Canaveral, Vandenberg. Weekly Sentinel-2 satellite captures, milestone log, primary-source citations.",
  },
};

const SLUGS = ["starbase", "spacex-hawthorne", "cape-canaveral", "vandenberg"] as const;

const WHY_BLOCKS: { title: string; body: string }[] = [
  {
    title: "Starbase build cadence",
    body: "Phase 2 expansion at Boca Chica: second launch tower, Starfactory bay extensions, propellant farm. The S-1 will quantify CapEx — we already measure footprint week over week.",
  },
  {
    title: "Cape Canaveral pad turnover",
    body: "SLC-40 and LC-39A run a 50+ launches/yr cadence with sub-48hr pad turnaround. Starship tower at 39A is in scope. Pad utilization is a direct revenue input.",
  },
  {
    title: "Hawthorne Raptor production",
    body: "550K sqft of vertical integration: Falcon 9, Falcon Heavy, Dragon. Raptor 3 line capacity is the rate-limiter on Starship cadence — and on what the S-1 can promise.",
  },
  {
    title: "Vandenberg launch tempo",
    body: "20+ polar launches/yr from SLC-4E. SLC-6 Starship pad construction is the next physical signal. Polar inclinations matter for Starlink and national-security backlog.",
  },
];

function statusAccent(s: Factory["status"]): string {
  if (s === "operational") return "#16a34a";
  if (s === "expanding") return "#2563eb";
  if (s === "construction") return "#c4a000";
  return "#005288";
}

function SiteCard({ f }: { f: Factory }) {
  const accent = statusAccent(f.status);
  return (
    <Link
      href={`/site/${f.slug}`}
      className="group flex flex-col gap-3 rounded-md border border-border-custom bg-surface hover:border-text transition-colors p-4"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{f.flag}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{f.name}</h3>
            <p className="text-[11px] text-dim truncate">{f.location}</p>
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold flex-shrink-0"
          style={{ background: `${accent}1a`, color: accent }}
        >
          {f.status}
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-dim">Progress</span>
          <span className="text-xs tabular-nums font-medium" style={{ color: accent }}>
            {f.progress}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded bg-bg overflow-hidden">
          <div
            className="h-full rounded"
            style={{ width: `${f.progress}%`, background: accent }}
          />
        </div>
      </div>

      <div className="text-[11px] text-dim leading-relaxed border-t border-border-custom pt-2">
        {f.products}
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Area</div>
          <div className="font-medium truncate">{f.area}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Cadence</div>
          <div className="font-medium truncate">{f.capacity}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Invest</div>
          <div className="font-medium truncate">{f.investment}</div>
        </div>
      </div>

      <div className="text-[11px] text-dim group-hover:text-text transition-colors">
        Open site page →
      </div>
    </Link>
  );
}

function isFutureMilestone(m: Milestone): boolean {
  return !m.done;
}

export default function SpaceXIPOPage() {
  const sites = SLUGS.map((s) => getSite(s)).filter(Boolean) as Factory[];
  const allSpacexSites = getSitesByCompany("spacex");

  // Pull upcoming (not-done) milestones across SpaceX sites for the catalyst section
  const catalysts: { site: Factory; m: Milestone }[] = [];
  for (const f of allSpacexSites) {
    for (const m of f.milestones ?? []) {
      if (isFutureMilestone(m)) catalysts.push({ site: f, m });
    }
  }
  // Stable sort by date string ascending — YYYY-MM / YYYY-Qx / YYYY-Hx all sort reasonably alphabetically
  catalysts.sort((a, b) => a.m.date.localeCompare(b.m.date));
  const topCatalysts = catalysts.slice(0, 6);

  return (
    <>
      {/* Hero: Starbase timelapse video background */}
      <section className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9", maxHeight: "70vh" }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/timelapses/starbase.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/timelapses/starbase.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/50" />

        <div className="relative h-full flex flex-col justify-end px-6 sm:px-12 pb-10 sm:pb-16 text-white">
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-white/70 mb-3 font-mono">
            Starbase · Boca Chica, TX · Sentinel-2
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-3 max-w-3xl leading-[1.05]">
            SpaceX is filing for IPO.
            <br />
            <span className="text-white/85">We track its 4 ground sites from orbit.</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mb-6">
            Starbase · Hawthorne · Cape Canaveral · Vandenberg.
            <br className="hidden sm:block" />
            Weekly Sentinel-2 captures, milestone log, primary-source citations.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/investor"
              className="px-4 py-2 rounded bg-white text-black text-sm font-bold hover:opacity-85"
            >
              See the charter tier →
            </Link>
            <a
              href="#sites"
              className="px-4 py-2 rounded border border-white/30 text-white text-sm hover:border-white"
            >
              See the 4 sites
            </a>
          </div>
        </div>
      </section>

      {/* 4 Site grid */}
      <section id="sites" className="max-w-[1200px] mx-auto px-6 pt-12 pb-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold">SpaceX ground footprint</h2>
            <p className="text-xs text-dim mt-1">
              4 sites · weekly satellite captures · updated {DATA_LAST_UPDATED} · <Link href="/methodology" className="underline">methodology →</Link>
            </p>
          </div>
          <div className="flex gap-4 text-[13px] text-dim">
            <Link href="/timeline" className="hover:text-text transition-colors">Combined timeline →</Link>
            <Link href="/compare" className="hover:text-text transition-colors">Before/after →</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sites.map((f) => (
            <SiteCard key={f.id} f={f} />
          ))}
        </div>
      </section>

      {/* Why this matters */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Why this matters before the S-1</h2>
            <p className="text-sm text-dim mt-2 max-w-2xl">
              The S-1 will disclose revenue, contract backlog, and CapEx. The pre-S-1 leverage is in the physical
              footprint — and that is what we measure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_BLOCKS.map((b) => (
              <div key={b.title} className="p-4 rounded border border-border-custom bg-surface">
                <div className="font-bold text-sm mb-1.5">{b.title}</div>
                <div className="text-xs text-dim leading-relaxed">{b.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalyst calendar excerpt */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold">Upcoming SpaceX catalysts</h2>
              <p className="text-xs text-dim mt-1">
                From the site-level milestone log. Dates reflect company guidance or our best estimate.
              </p>
            </div>
            <Link href="/calendar" className="text-[13px] text-dim hover:text-text transition-colors">
              See all catalysts →
            </Link>
          </div>

          {topCatalysts.length > 0 ? (
            <div className="rounded border border-border-custom overflow-hidden">
              {topCatalysts.map(({ site, m }, idx) => (
                <Link
                  key={`${site.slug}-${idx}`}
                  href={`/site/${site.slug}`}
                  className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-surface transition-colors border-b border-border-custom last:border-b-0"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs font-mono text-dim tabular-nums w-24 flex-shrink-0">{m.date}</span>
                    <span className="text-sm truncate">{m.text}</span>
                  </div>
                  <span className="text-[11px] text-dim flex-shrink-0">{site.name} →</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dim">
              No upcoming catalysts in the data layer. <Link href="/calendar" className="underline">See the full calendar →</Link>
            </p>
          )}
        </div>
      </section>

      {/* Investor CTA strip */}
      <section className="border-t border-border-custom">
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <div className="rounded-lg border border-border-custom bg-surface p-6 sm:p-8">
            <div className="text-[11px] uppercase tracking-widest text-dim mb-3 font-mono">
              Charter waitlist · first 100
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
              Track SpaceX from orbit — $9/mo charter.
            </h2>
            <p className="text-sm text-dim mb-5 max-w-xl">
              Charter pricing locks for the life of the subscription. Standard launch: $29 (Jun 2026). Long-term target: $49-79.
              Satellite-drop alerts, daily digest, CSV/JSON exports, component breakdowns.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/investor"
                className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-85"
              >
                Join charter waitlist →
              </Link>
              <Link
                href="/methodology"
                className="px-4 py-2 rounded border border-border-custom text-sm hover:border-text"
              >
                How we measure
              </Link>
            </div>

            <div className="border-t border-border-custom pt-5">
              <div className="text-xs text-dim mb-3">Or subscribe to the free daily digest:</div>
              <EmailSignup tier="free" source="spacex-ipo" variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer disclaimer */}
      <section className="border-t border-border-custom">
        <div className="max-w-[1200px] mx-auto px-6 py-6 text-center text-[11px] text-dim">
          GIGASCOPE — Community project. Not affiliated with SpaceX. Not financial advice.
        </div>
      </section>
    </>
  );
}
