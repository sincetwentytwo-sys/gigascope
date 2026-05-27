import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { factories, getFactory, getTimelapseSlug, TIMELINE_YEARS } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import SatelliteMapWrapper from "@/components/SatelliteMapWrapper";
import { listProducts } from "@/data/products";
import { safeJsonLd } from "@/lib/safeJsonLd";
import { getESRIImageryDate } from "@/lib/satellite-date";
import { FactoryNewsFeed } from "@/components/NewsFeed";
import CommunityFeed from "@/components/CommunityFeed";
import ShareButtons from "@/components/ShareButtons";
import { TIMELAPSE_INDEX } from "@/lib/timelapseIndex";

function hasBeforeAfterThumbnails(slug: string | null): boolean {
  if (!slug) return false;
  return (
    existsSync(resolve(process.cwd(), "public", "timelapses", `${slug}-first.jpg`)) &&
    existsSync(resolve(process.cwd(), "public", "timelapses", `${slug}-last.jpg`))
  );
}

const SITE_URL = "https://gigascope.xyz";

export const revalidate = 1800;

export function generateStaticParams() {
  return factories.map((f) => ({ slug: f.slug }));
}

const SITE_KEYWORDS: Record<string, string[]> = {
  terafab: ["terafab", "chip fab", "ai5", "semiconductor", "2nm", "tsmc", "chip", "fab", "xai"],
  "giga-texas": ["texas", "austin", "cybertruck", "cybercab", "giga texas", "travis"],
  "giga-nevada": ["nevada", "sparks", "4680", "semi", "battery", "panasonic", "cell production"],
  "giga-shanghai": ["shanghai", "china", "megafactory", "byd", "chinese"],
  "giga-berlin": ["berlin", "germany", "grünheide", "grunheide", "europe", "brandenburg"],
  "giga-mexico": ["mexico", "nuevo leon", "santa catarina", "affordable", "compact"],
  fremont: ["fremont", "model s", "model x", "model 3", "model y", "california"],
  "giga-buffalo": ["buffalo", "new york", "solar roof", "solar", "supercharger", "megapack", "energy"],
  "starbase-launch": ["starbase", "boca chica", "starship", "super heavy", "olm", "mechazilla", "orbital launch", "pad b", "ift-12", "flight 12"],
  "starbase-build": ["starbase", "boca chica", "star factory", "high bay", "mid bay", "starship production", "super heavy production"],
  mcgregor: ["mcgregor", "raptor", "raptor 2", "raptor 3", "engine test", "test stand", "hot fire", "merlin"],
  "spacex-hawthorne": ["hawthorne", "falcon 9", "falcon heavy", "dragon", "spacex hq"],
  "cape-canaveral": ["cape canaveral", "slc-40", "lc-39a", "kennedy", "florida launch"],
  vandenberg: ["vandenberg", "slc-4", "polar orbit", "california launch"],
  colossus: ["colossus", "xai", "grok", "memphis", "supercomputer", "h100", "gpu cluster"],
  "neuralink-fremont": ["neuralink", "brain computer", "bci", "n1 implant", "neural"],
  "neuralink-austin": ["neuralink austin", "implant manufacturing", "neuralink production"],
  "vegas-loop": ["vegas loop", "boring company", "lvcc", "tunnel", "las vegas transit"],
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFactory(slug);
  const company = f ? getCompanyMeta(f.company) : null;
  const url = `${SITE_URL}/site/${slug}`;
  return {
    title: f ? `${f.name} — GIGASCOPE` : "Site — GIGASCOPE",
    description: f ? `${f.name} (${company?.name}) progress: ${f.progress}% — ${f.products}` : "Musk-orbit industrial site tracker",
    alternates: { canonical: url },
    openGraph: {
      title: f ? `${f.name} — ${f.progress}% complete` : "Site — GIGASCOPE",
      description: f ? `${f.location} · ${f.products} · ${f.investment}` : undefined,
      url,
      type: "website",
    },
  };
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const factory = getFactory(slug);

  if (!factory) {
    return <div className="flex items-center justify-center h-[60vh] text-dim">Site not found</div>;
  }

  const company = getCompanyMeta(factory.company);
  const imageryDate = await getESRIImageryDate(factory.lat, factory.lng);
  const newsKeywords = SITE_KEYWORDS[factory.slug] ?? [factory.name.toLowerCase()];
  const pageUrl = `${SITE_URL}/site/${factory.slug}`;
  const accent = company.color;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${company.name} ${factory.name}`,
    alternateName: factory.aka,
    description: `${factory.name} progress: ${factory.progress}% — ${factory.products}`,
    url: pageUrl,
    geo: {
      "@type": "GeoCoordinates",
      latitude: factory.lat,
      longitude: factory.lng,
    },
    address: { "@type": "PostalAddress", addressLocality: factory.location },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Construction progress", value: `${factory.progress}%` },
      { "@type": "PropertyValue", name: "Status", value: factory.status },
      { "@type": "PropertyValue", name: "Company", value: company.name },
      { "@type": "PropertyValue", name: "Products", value: factory.products },
      { "@type": "PropertyValue", name: "Investment", value: factory.investment },
      { "@type": "PropertyValue", name: "Capacity", value: factory.capacity },
      { "@type": "PropertyValue", name: "Area", value: factory.area },
    ],
  };

  const extraEntries = factory.extras ? Object.entries(factory.extras) : [];

  const statCards = [
    { label: "Area", value: factory.area, color: "var(--dim)" },
    { label: "Capacity", value: factory.capacity, color: "var(--green)" },
    { label: "Investment", value: factory.investment, color: accent },
    { label: "Employees", value: factory.employees, color: "var(--dim)" },
  ];

  const maxTimeline = Math.max(...factory.timeline, 1);
  const latestIdx = factory.timeline.length - 1;
  const hasYearData = Array.isArray(factory.timeline)
    && factory.timeline.length > 0
    && factory.timeline.some((v) => typeof v === "number" && v > 0);
  const lat = factory.lat;
  const lng = factory.lng;
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? "E" : "W"}`;
  const doneCount = factory.milestones.filter((m) => m.done).length;
  const sortedMilestones = [...factory.milestones].sort((a, b) => {
    const da = a.date.replace(/Q\d|H\d/g, "").trim();
    const db = b.date.replace(/Q\d|H\d/g, "").trim();
    return db.localeCompare(da);
  });
  const tlSlug = getTimelapseSlug(factory);
  const showBeforeAfter = hasBeforeAfterThumbnails(tlSlug);

  return (
    <div className="bg-bg text-text min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top strip: breadcrumb + company + status. Replaced the previous
            "ID: <slug>" + duplicate-progress row with a single clean breadcrumb
            line — the big progress headline below carries the % itself, so we
            don't show it twice. */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <a href="/" className="text-dim hover:text-text transition-colors">&larr; All sites</a>
          <span className="text-border-custom">/</span>
          <span className="font-medium" style={{ color: accent }}>{company.name}</span>
          <span className="text-border-custom">/</span>
          <span className="text-dim font-mono text-[12px]">{factory.slug}</span>
          <div className="flex-1" />
          <span
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold font-mono"
            style={{ background: `${accent}15`, color: accent }}
          >
            {factory.status}
          </span>
        </div>

        {/* Title + headline progress side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6 items-end">
          <div className="border-l-2 pl-4" style={{ borderColor: accent }}>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight break-words">
              {factory.flag} {factory.name}
            </h1>
            <p className="text-dim mt-1 text-sm">
              {factory.aka} · {factory.location}
            </p>
            <p className="text-dim text-sm mt-1">{factory.products}</p>
            <p className="font-mono text-[10px] text-dim mt-2">
              Updated {factory.lastUpdated}
              {imageryDate && <> · Satellite imagery {imageryDate}</>}
              {" "}· {doneCount}/{factory.milestones.length} milestones verified
            </p>
          </div>
          {/* Headline progress — single big number on the right */}
          <div className="lg:text-right">
            <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1">
              Built footprint
            </div>
            <div className="flex items-baseline gap-2 lg:justify-end">
              <span className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight" style={{ color: accent }}>
                {factory.progress}
              </span>
              <span className="text-2xl text-dim">%</span>
            </div>
            <div className="w-full lg:w-56 h-1.5 bg-border-custom rounded overflow-hidden mt-2">
              <div className="h-full transition-all" style={{ width: `${factory.progress}%`, background: accent }} />
            </div>
          </div>
        </div>

        {/* Before / after satellite thumbnails — first and last frame of the timelapse */}
        {showBeforeAfter && (
          <div className="mb-6 border border-border-custom overflow-hidden">
            <div className="grid grid-cols-2 gap-px bg-border-custom">
              <div className="relative">
                {/* width/height reserve aspect-correct space — kills CLS
                    when the timelapse thumb hydrates after page paint. */}
                <img
                  src={`/timelapses/${tlSlug}-first.jpg`}
                  alt={`${factory.name} — earlier satellite view`}
                  loading="lazy"
                  width={1600}
                  height={900}
                  className="w-full aspect-video object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-black/65 text-white/90 rounded">
                  Before
                </span>
              </div>
              <div className="relative">
                <img
                  src={`/timelapses/${tlSlug}-last.jpg`}
                  alt={`${factory.name} — recent satellite view`}
                  loading="lazy"
                  width={1600}
                  height={900}
                  className="w-full aspect-video object-cover"
                />
                <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-black/65 text-white/90 rounded">
                  Now
                </span>
              </div>
            </div>
            <p className="px-3 py-2 text-[10px] font-mono text-dim border-t border-border-custom bg-surface">
              First and most-recent frames from the Sentinel-2 timelapse.
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className={`grid gap-3 sm:gap-4 mb-8 ${extraEntries.length > 0 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-surface  border-l-2 p-3 sm:p-4 hover:bg-surface transition-all"
              style={{ borderColor: c.color }}
            >
              <span className="font-mono text-[10px] flex items-center gap-2" style={{ color: c.color }}>
                <span className="w-1 h-1" style={{ background: c.color }} />
                {c.label}
              </span>
              <div className="mt-3 sm:mt-4">
                <span className="font-mono text-xl sm:text-2xl font-bold text-text break-words">{c.value}</span>
              </div>
            </div>
          ))}
          {extraEntries.map(([label, value]) => (
            <div
              key={label}
              className="bg-surface  border-l-2 border-border-custom p-4 hover:bg-surface transition-all"
            >
              <span className="font-mono text-[10px] flex items-center gap-2 text-dim">
                <span className="w-1 h-1 bg-dim" />
                {label}
              </span>
              <div className="mt-4">
                <span className="font-mono text-2xl font-bold text-text">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Map + Right column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left 2/3: Map */}
          <div className="lg:col-span-2 relative">
            <div className="absolute top-3 left-3 z-[400] flex flex-wrap items-center gap-2">
              <div
                className="bg-bg/80  px-3 py-1 border-l-2 flex items-center gap-2"
                style={{ borderColor: accent }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
                <span className="font-mono text-[10px] font-bold text-text">
                  {factory.name}
                </span>
              </div>
              <div className="bg-bg/80  px-3 py-1 border-l-2 border-border-custom font-mono text-[10px] text-dim">
                {latStr}, {lngStr}
              </div>
            </div>

            <div className="aspect-video w-full bg-surface relative overflow-hidden border border-border-custom">
              <SatelliteMapWrapper
                lat={factory.lat}
                lng={factory.lng}
                zoom={15}
                factoryColor={accent}
              />
            </div>

            {tlSlug && TIMELAPSE_INDEX[tlSlug] && (() => {
              const tl = TIMELAPSE_INDEX[tlSlug];
              const v = new Date(tl.builtAt).getTime();
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm" style={{ color: accent }}>
                      Satellite timelapse
                    </h3>
                    <span className="font-mono text-[10px] text-dim">
                      {tl.frames} frames · Sentinel-2 + ESRI
                    </span>
                  </div>
                  <div className="aspect-square sm:aspect-video w-full bg-surface relative overflow-hidden border border-border-custom">
                    <video
                      src={`/timelapses/${tlSlug}.mp4?v=${v}`}
                      poster={`/timelapses/${tlSlug}.jpg?v=${v}`}
                      controls
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1 font-mono text-[9px] text-dim">
                    Latest: {tl.latest} · Source: Sentinel-2 L2A (Copernicus)
                  </p>
                </div>
              );
            })()}

            {(() => {
              const related = listProducts().filter((p) =>
                (p.relatedSites ?? []).includes(factory.slug),
              );
              if (related.length === 0) return null;
              return (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-dim">
                    Related products
                  </span>
                  {related.map((p) => (
                    <a
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      className="font-mono text-[10px] px-2 py-1 border border-border-custom hover:border-text text-text hover:text-text transition-colors"
                    >
                      {p.name} &rarr;
                    </a>
                  ))}
                </div>
              );
            })()}

            {/* Latitude/Longitude cards removed — same coords are already
                shown in the floating overlay on top of the map. Showing them
                twice was visual noise. */}
          </div>

          {/* Right 1/3 */}
          <div className="flex flex-col gap-6">
            {/* Milestones */}
            <div className="bg-surface  p-4 sm:p-5 border border-border-custom">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-sm" style={{ color: accent }}>
                  Milestones
                </h3>
                <span className="font-mono text-[10px] text-dim">
                  {doneCount}/{factory.milestones.length}
                </span>
              </div>
              <div className="relative space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border-custom">
                {sortedMilestones.map((m, i) => (
                  <div key={i} className={`relative pl-7 ${!m.done ? "opacity-50" : ""}`}>
                    <div
                      className="absolute left-0 top-1 w-4 h-4 bg-bg border flex items-center justify-center"
                      style={{ borderColor: m.done ? accent : "#5d3f44" }}
                    >
                      <div
                        className="w-1.5 h-1.5"
                        style={{
                          background: m.done ? accent : "transparent",
                          border: m.done ? "none" : "1px solid #5d3f44",
                          boxShadow: m.done ? `0 0 8px ${accent}` : "none",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-dim">{m.date}</span>
                    <h4 className="font-semibold text-sm text-text mt-0.5">
                      {m.text}
                      {m.sourceUrl && (
                        <a
                          href={m.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-[11px] text-dim hover:text-text underline underline-offset-2"
                        >
                          [source]
                        </a>
                      )}
                    </h4>
                    <p
                      className="font-mono text-[9px] mt-1"
                      style={{ color: m.done ? "var(--green)" : "var(--dim)" }}
                    >
                      {m.done ? "Done" : "Upcoming"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress chart — hide entirely when no per-year data exists */}
            {hasYearData && (
              <div className="bg-surface  p-4 sm:p-5 border border-border-custom">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-sm text-accent-blue">
                    Progress by year
                  </h3>
                  <span className="font-mono text-[10px] text-dim">{TIMELINE_YEARS[0]}–{TIMELINE_YEARS[latestIdx]}</span>
                </div>
                <div className="flex items-end justify-between h-40 gap-2 px-1">
                  {factory.timeline.map((val, i) => {
                    const isLatest = i === latestIdx;
                    const h = val === 0 ? 4 : Math.max(8, (val / maxTimeline) * 100);
                    return (
                      <div key={TIMELINE_YEARS[i]} className="flex-1 flex flex-col items-center gap-2 justify-end h-full group">
                        <span className="font-mono text-[9px] text-dim mb-1">{val}%</span>
                        <div
                          className="w-full transition-all group-hover:scale-y-105 origin-bottom"
                          style={{
                            height: `${h}%`,
                            background: isLatest ? accent : "#5d3f44",
                            boxShadow: isLatest ? `0 0 15px -2px ${accent}80` : undefined,
                          }}
                        />
                        <span
                          className={`font-mono text-[9px] mt-1 ${isLatest ? "text-text font-bold" : "text-dim"}`}
                        >
                          '{String(TIMELINE_YEARS[i]).slice(-2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-border-custom flex justify-between">
                  <span className="font-mono text-[9px] text-dim">Latest: {factory.timeline[latestIdx]}%</span>
                  <span className="font-mono text-[9px] text-accent-blue">{factory.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* News + Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface  border border-border-custom p-4 sm:p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: accent }}>
              Latest news
            </h3>
            <FactoryNewsFeed keywords={newsKeywords} />
          </div>
          <div className="bg-surface  border border-border-custom p-4 sm:p-5">
            <h3 className="font-semibold text-sm text-accent-blue mb-4">
              Community
            </h3>
            <CommunityFeed keywords={newsKeywords} factoryName={factory.name} />
          </div>
        </div>

        {/* Share + Links */}
        <div className="bg-surface  border border-border-custom p-4 sm:p-5 mb-8">
          <ShareButtons url={pageUrl} title={`${factory.name} — ${factory.progress}% complete`} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-mono">
          <a href="/compare" className="text-accent-blue hover:text-text transition-colors text-xs">
            Compare imagery &rarr;
          </a>
          <a
            href={`https://www.google.com/maps/@${factory.lat},${factory.lng},1000m/data=!3m1!1e3`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dim hover:text-text transition-colors text-xs"
          >
            Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}
