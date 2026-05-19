import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { factories, getFactory, TIMELINE_YEARS } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import SatelliteMapWrapper from "@/components/SatelliteMapWrapper";
import { listProducts } from "@/data/products";
import { getESRIImageryDate } from "@/lib/satellite-date";
import { FactoryNewsFeed } from "@/components/NewsFeed";
import CommunityFeed from "@/components/CommunityFeed";
import ShareButtons from "@/components/ShareButtons";

const timelapseIndexPath = resolve(process.cwd(), "public", "timelapses", "index.json");
const TIMELAPSE_INDEX: Record<string, { frames: number; latest: string; builtAt: string }> = existsSync(timelapseIndexPath)
  ? JSON.parse(readFileSync(timelapseIndexPath, "utf8"))
  : {};

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
  starbase: ["starbase", "boca chica", "starship", "super heavy", "raptor", "mechazilla", "orbital launch"],
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
    description: f ? `${f.name} (${company?.name}) progress: ${f.progress}% — ${f.products}` : "Musk Empire site tracker",
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
    return <div className="flex items-center justify-center h-[60vh] text-[#8292aa]">Site not found</div>;
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
    { label: "Area", value: factory.area, color: "#8292aa" },
    { label: "Capacity", value: factory.capacity, color: "#00f4fe" },
    { label: "Investment", value: factory.investment, color: accent },
    { label: "Employees", value: factory.employees, color: "#8292aa" },
  ];

  const maxTimeline = Math.max(...factory.timeline, 1);
  const latestIdx = factory.timeline.length - 1;
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

  return (
    <div className="bg-[#121316] text-[#e3e2e6] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top strip: breadcrumb + ID + progress */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <a href="/" className="text-[#8292aa] text-sm hover:text-white transition-colors">&larr; All Sites</a>
          <div
            className="flex items-center gap-3 border-l-2 pl-3 py-1"
            style={{ borderColor: accent }}
          >
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: accent }}>
              {company.name}
            </span>
            <span className="font-mono text-[10px] text-[#8292aa]">
              / {factory.slug.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-full sm:min-w-[200px] max-w-md">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[10px] text-[#8292aa] uppercase">ID: {factory.id}</span>
              <span className="font-mono text-[10px]" style={{ color: accent }}>
                {factory.progress}% complete
              </span>
            </div>
            <div className="w-full bg-[#343538] h-1 overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${factory.progress}%`, background: accent, boxShadow: `0 0 8px ${accent}` }}
              />
            </div>
          </div>
          <span className="px-2 py-1 border text-[10px] font-mono uppercase tracking-widest" style={{ borderColor: "#5d3f44", color: "#8292aa" }}>
            {factory.status}
          </span>
        </div>

        {/* Title block */}
        <div className="mb-6 border-l-2 pl-4" style={{ borderColor: accent }}>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight break-words">
            {factory.flag} {factory.name}
          </h1>
          <p className="text-[#8292aa] mt-1 text-sm">
            {factory.aka} &middot; {factory.location}
          </p>
          <p className="text-[#b7c8e1] text-sm mt-1">{factory.products}</p>
          <p className="font-mono text-[10px] text-[#8292aa] mt-2 uppercase tracking-wider">
            Updated {factory.lastUpdated}
            {imageryDate && <> &middot; Satellite imagery {imageryDate}</>}
          </p>
        </div>

        {/* Stat cards */}
        <div className={`grid gap-3 sm:gap-4 mb-8 ${extraEntries.length > 0 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
          {statCards.map((c) => (
            <div
              key={c.label}
              className="bg-[#1f1f23]/60 backdrop-blur-md border-l-2 p-3 sm:p-4 hover:bg-[#1f1f23] transition-all"
              style={{ borderColor: c.color }}
            >
              <span className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ color: c.color }}>
                <span className="w-1 h-1" style={{ background: c.color }} />
                {c.label}
              </span>
              <div className="mt-3 sm:mt-4">
                <span className="font-mono text-xl sm:text-2xl font-bold text-white break-words">{c.value}</span>
              </div>
            </div>
          ))}
          {extraEntries.map(([label, value]) => (
            <div
              key={label}
              className="bg-[#1f1f23]/60 backdrop-blur-md border-l-2 border-[#8292aa] p-4 hover:bg-[#1f1f23] transition-all"
            >
              <span className="font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 text-[#8292aa]">
                <span className="w-1 h-1 bg-[#8292aa]" />
                {label}
              </span>
              <div className="mt-4">
                <span className="font-mono text-2xl font-bold text-white">{value}</span>
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
                className="bg-[#121316]/80 backdrop-blur-md px-3 py-1 border-l-2 flex items-center gap-2"
                style={{ borderColor: accent }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
                <span className="font-mono text-[10px] font-bold tracking-widest text-white uppercase">
                  {factory.name}
                </span>
              </div>
              <div className="bg-[#121316]/80 backdrop-blur-md px-3 py-1 border-l-2 border-[#8292aa] font-mono text-[10px] text-[#b7c8e1]">
                {latStr}, {lngStr}
              </div>
            </div>

            <div className="aspect-video w-full bg-[#1f1f23] relative overflow-hidden border border-[#343538]">
              <SatelliteMapWrapper
                lat={factory.lat}
                lng={factory.lng}
                zoom={15}
                factoryColor={accent}
              />
            </div>

            {TIMELAPSE_INDEX[factory.slug] && (() => {
              const tl = TIMELAPSE_INDEX[factory.slug];
              const v = new Date(tl.builtAt).getTime();
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: accent }}>
                      Satellite Timelapse
                    </h3>
                    <span className="font-mono text-[10px] text-[#8292aa]">
                      {tl.frames} frames · weekly Sentinel-2
                    </span>
                  </div>
                  <div className="aspect-square sm:aspect-video w-full bg-[#1f1f23] relative overflow-hidden border border-[#343538]">
                    <video
                      src={`/timelapses/${factory.slug}.mp4?v=${v}`}
                      poster={`/timelapses/${factory.slug}.jpg?v=${v}`}
                      controls
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-1 font-mono text-[9px] text-[#8292aa]">
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
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa]">
                    Related products
                  </span>
                  {related.map((p) => (
                    <a
                      key={p.slug}
                      href={`/products/${p.slug}`}
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-[#343538] hover:border-white text-[#d6dde8] hover:text-white transition-colors"
                    >
                      {p.name} 3D &rarr;
                    </a>
                  ))}
                </div>
              );
            })()}

            {/* Stat strip below map */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-[#1f1f23]/60 backdrop-blur-md p-3 border-t border-[#5d3f44]/30">
                <span className="block font-mono text-[9px] text-[#8292aa] mb-1 uppercase tracking-wider">Latitude</span>
                <span className="font-mono text-base font-bold text-white">{lat.toFixed(4)}</span>
              </div>
              <div className="bg-[#1f1f23]/60 backdrop-blur-md p-3 border-t border-[#5d3f44]/30">
                <span className="block font-mono text-[9px] text-[#8292aa] mb-1 uppercase tracking-wider">Longitude</span>
                <span className="font-mono text-base font-bold text-white">{lng.toFixed(4)}</span>
              </div>
              <div className="bg-[#1f1f23]/60 backdrop-blur-md p-3 border-t border-[#5d3f44]/30">
                <span className="block font-mono text-[9px] text-[#8292aa] mb-1 uppercase tracking-wider">Milestones</span>
                <span className="font-mono text-base font-bold text-white">
                  {doneCount}/{factory.milestones.length}
                </span>
              </div>
            </div>
          </div>

          {/* Right 1/3 */}
          <div className="flex flex-col gap-6">
            {/* Milestones */}
            <div className="bg-[#1f1f23]/60 backdrop-blur-md p-4 sm:p-5 border border-[#343538]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: accent }}>
                  Milestones
                </h3>
                <span className="font-mono text-[10px] text-[#8292aa]">
                  {doneCount}/{factory.milestones.length}
                </span>
              </div>
              <div className="relative space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-[#5d3f44]">
                {sortedMilestones.map((m, i) => (
                  <div key={i} className={`relative pl-7 ${!m.done ? "opacity-50" : ""}`}>
                    <div
                      className="absolute left-0 top-1 w-4 h-4 bg-[#121316] border flex items-center justify-center"
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
                    <span className="font-mono text-[10px] text-[#8292aa]">{m.date}</span>
                    <h4 className="font-semibold text-xs text-white uppercase mt-0.5 tracking-wide">
                      {m.text}
                    </h4>
                    <p
                      className="font-mono text-[9px] mt-1"
                      style={{ color: m.done ? "#00f4fe" : "#8292aa" }}
                    >
                      {m.done ? "STATUS: COMPLETED" : "STATUS: PENDING"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress chart */}
            <div className="bg-[#1f1f23]/60 backdrop-blur-md p-4 sm:p-5 border border-[#343538]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-sm tracking-widest text-[#00f4fe] uppercase">
                  Progress by Year
                </h3>
                <span className="font-mono text-[10px] text-[#8292aa]">{TIMELINE_YEARS[0]}–{TIMELINE_YEARS[latestIdx]}</span>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 px-1">
                {factory.timeline.map((val, i) => {
                  const isLatest = i === latestIdx;
                  const h = val === 0 ? 4 : Math.max(8, (val / maxTimeline) * 100);
                  return (
                    <div key={TIMELINE_YEARS[i]} className="flex-1 flex flex-col items-center gap-2 justify-end h-full group">
                      <span className="font-mono text-[9px] text-[#8292aa] mb-1">{val}%</span>
                      <div
                        className="w-full transition-all group-hover:scale-y-105 origin-bottom"
                        style={{
                          height: `${h}%`,
                          background: isLatest ? accent : "#5d3f44",
                          boxShadow: isLatest ? `0 0 15px -2px ${accent}80` : undefined,
                        }}
                      />
                      <span
                        className={`font-mono text-[9px] mt-1 ${isLatest ? "text-white font-bold" : "text-[#8292aa]"}`}
                      >
                        '{String(TIMELINE_YEARS[i]).slice(-2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-[#5d3f44]/30 flex justify-between">
                <span className="font-mono text-[9px] text-[#8292aa] uppercase">Latest: {factory.timeline[latestIdx]}%</span>
                <span className="font-mono text-[9px] text-[#00f4fe] uppercase">{factory.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* News + Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-[#343538] p-4 sm:p-5">
            <h3 className="font-bold text-sm tracking-widest uppercase mb-4" style={{ color: accent }}>
              Latest News
            </h3>
            <FactoryNewsFeed keywords={newsKeywords} />
          </div>
          <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-[#343538] p-4 sm:p-5">
            <h3 className="font-bold text-sm tracking-widest text-[#00f4fe] uppercase mb-4">
              Community
            </h3>
            <CommunityFeed keywords={newsKeywords} factoryName={factory.name} />
          </div>
        </div>

        {/* Share + Links */}
        <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-[#343538] p-4 sm:p-5 mb-8">
          <ShareButtons url={pageUrl} title={`${factory.name} — ${factory.progress}% complete`} />
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-mono">
          <a href="/compare" className="text-[#00f4fe] hover:text-white transition-colors uppercase tracking-wider text-xs">
            Compare imagery &rarr;
          </a>
          <a
            href={`https://www.google.com/maps/@${factory.lat},${factory.lng},1000m/data=!3m1!1e3`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8292aa] hover:text-white transition-colors uppercase tracking-wider text-xs"
          >
            Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}
