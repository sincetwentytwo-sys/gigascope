import { factories, getFactory, TIMELINE_YEARS } from "@/data/factories";
import SatelliteMapWrapper from "@/components/SatelliteMapWrapper";
import { getESRIImageryDate } from "@/lib/satellite-date";
import { FactoryNewsFeed } from "@/components/NewsFeed";
import XFeed from "@/components/XFeed";

export const revalidate = 3600;

export function generateStaticParams() {
  return factories.map((f) => ({ slug: f.slug }));
}

const FACTORY_KEYWORDS: Record<string, string[]> = {
  terafab: ["terafab", "chip fab", "ai5 chip"],
  "giga-texas": ["giga texas", "gigafactory texas", "austin factory", "cybertruck production", "cybercab"],
  "giga-nevada": ["giga nevada", "gigafactory nevada", "sparks factory", "battery cell", "semi production"],
  "giga-shanghai": ["giga shanghai", "gigafactory shanghai", "tesla china", "shanghai factory"],
  "giga-berlin": ["giga berlin", "gigafactory berlin", "grünheide", "grunheide", "tesla germany"],
  "giga-mexico": ["giga mexico", "gigafactory mexico", "nuevo leon", "tesla mexico"],
  fremont: ["fremont factory", "fremont plant", "tesla fremont"],
  "giga-buffalo": ["gigafactory new york", "buffalo factory", "solar roof production", "supercharger production"],
};

const X_QUERIES: Record<string, string> = {
  terafab: "Tesla Terafab OR \"chip fab\" OR AI5",
  "giga-texas": "Giga Texas OR \"Gigafactory Texas\" OR Cybertruck factory",
  "giga-nevada": "Giga Nevada OR \"Gigafactory Nevada\" OR Tesla Semi factory",
  "giga-shanghai": "Giga Shanghai OR Tesla Shanghai factory",
  "giga-berlin": "Giga Berlin OR Tesla Grünheide factory",
  "giga-mexico": "Giga Mexico OR Tesla Monterrey factory",
  fremont: "Tesla Fremont factory",
  "giga-buffalo": "Tesla Buffalo factory OR Gigafactory New York",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = getFactory(slug);
  return {
    title: f ? `${f.name} — GIGASCOPE` : "Factory — GIGASCOPE",
    description: f ? `${f.name} construction progress: ${f.progress}% — ${f.products}` : "Tesla factory construction tracker",
  };
}

export default async function FactoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const factory = getFactory(slug);

  if (!factory) {
    return <div className="flex items-center justify-center h-[60vh] text-dim">Factory not found</div>;
  }

  const imageryDate = await getESRIImageryDate(factory.lat, factory.lng);
  const newsKeywords = FACTORY_KEYWORDS[factory.slug] ?? [factory.name.toLowerCase()];
  const xQuery = X_QUERIES[factory.slug] ?? `Tesla ${factory.name}`;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      {/* Header */}
      <a href="/" className="text-dim text-sm hover:text-text transition-colors">&larr; All Factories</a>

      <div className="flex items-start justify-between mt-4 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">{factory.flag} {factory.name}</h1>
          <p className="text-dim mt-1">{factory.aka} &middot; {factory.location}</p>
          <p className="text-dim text-sm mt-0.5">{factory.products}</p>
          <p className="text-xs text-dim mt-1">
            Updated {factory.lastUpdated}
            {imageryDate && <> &middot; Satellite imagery {imageryDate}</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge badge-${factory.status}`}>{factory.status}</span>
          <span className="text-3xl font-bold" style={{ color: factory.color }}>{factory.progress}%</span>
        </div>
      </div>

      <div className="mt-4 h-1.5 bg-surface rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${factory.progress}%`, background: factory.color }} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {[
          { label: "Area", value: factory.area },
          { label: "Capacity", value: factory.capacity },
          { label: "Investment", value: factory.investment },
          { label: "Employees", value: factory.employees },
        ].map((c) => (
          <div key={c.label} className="bg-surface rounded-xl p-4">
            <div className="text-xs text-dim mb-1">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Map + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="lg:col-span-2 h-[350px] sm:h-[450px] rounded-xl overflow-hidden">
          <SatelliteMapWrapper lat={factory.lat} lng={factory.lng} zoom={15} factoryColor={factory.color} />
        </div>

        <div className="bg-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: factory.color }}>Milestones</h3>
            <span className="text-xs text-dim">{factory.milestones.filter((m) => m.done).length}/{factory.milestones.length}</span>
          </div>
          <div className="relative space-y-4 before:content-[''] before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-px before:bg-border-custom">
            {factory.milestones.map((m, i) => (
              <div key={i} className={`relative pl-6 ${!m.done ? "opacity-40" : ""}`}>
                <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2" style={{ borderColor: m.done ? factory.color : "var(--dim)", background: m.done ? factory.color : "transparent" }} />
                <div className="text-xs text-dim">{m.date}</div>
                <p className="text-sm">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-surface rounded-xl p-5 mt-8">
        <h3 className="font-bold mb-4">Progress by Year</h3>
        <div className="flex items-end justify-between h-32 gap-3">
          {factory.timeline.map((val, i) => {
            const isLatest = i === factory.timeline.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t" style={{ height: `${Math.max(4, val)}%`, background: isLatest ? factory.color : `${factory.color}30` }} title={`${TIMELINE_YEARS[i]}: ${val}%`} />
                <span className={`text-xs ${isLatest ? "font-bold" : "text-dim"}`}>{String(TIMELINE_YEARS[i]).slice(-2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* News + Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
        <div className="bg-surface rounded-xl p-5">
          <h3 className="font-bold mb-3">Latest News</h3>
          <FactoryNewsFeed keywords={newsKeywords} />
        </div>
        <div className="bg-surface rounded-xl p-5">
          <h3 className="font-bold mb-3">Community</h3>
          <XFeed query={xQuery} factoryName={factory.name.replace("\u26a1 ", "")} />
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4 mt-6 text-sm">
        <a href="/compare" className="text-accent-blue hover:underline">Compare imagery &rarr;</a>
        <a href={`https://www.google.com/maps/@${factory.lat},${factory.lng},1000m/data=!3m1!1e3`} target="_blank" rel="noopener noreferrer" className="text-dim hover:text-text">Google Maps &nearr;</a>
      </div>
    </div>
  );
}
