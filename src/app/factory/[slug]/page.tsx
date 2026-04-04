import { factories, getFactory, TIMELINE_YEARS } from "@/data/factories";
import SatelliteMapWrapper from "@/components/SatelliteMapWrapper";

export function generateStaticParams() {
  return factories.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const f = getFactory(slug);
  return {
    title: f ? `${f.name} — TERAFAB TRACKER` : "Factory — TERAFAB TRACKER",
    description: f
      ? `${f.name} construction progress: ${f.progress}% — ${f.products}`
      : "Tesla factory construction tracker",
  };
}

export default async function FactoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const factory = getFactory(slug);

  if (!factory) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-dim">
        Factory not found
      </div>
    );
  }

  const infoCards = [
    { label: "AREA", value: factory.area },
    { label: "CAPACITY", value: factory.capacity },
    { label: "INVESTMENT", value: factory.investment },
    { label: "EMPLOYEES", value: factory.employees },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/"
          className="text-dim text-xs font-mono hover:text-text transition-colors"
        >
          ← BACK TO ALL
        </a>
        <div className="flex items-start justify-between mt-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              {factory.flag} {factory.name}
            </h1>
            <p className="text-dim text-sm mt-1">
              {factory.aka} · {factory.location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge badge-${factory.status} text-xs`}>
              {factory.status}
            </span>
            <span
              className="text-3xl font-black font-mono"
              style={{ color: factory.color }}
            >
              {factory.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {infoCards.map((c) => (
          <div key={c.label} className="glass-card p-4">
            <div className="text-[0.6rem] text-dim tracking-widest mb-1">
              {c.label}
            </div>
            <div className="text-lg font-bold font-mono">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Map + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Satellite Map */}
        <div className="lg:col-span-2 h-[400px] sm:h-[500px]">
          <SatelliteMapWrapper
            lat={factory.lat}
            lng={factory.lng}
            zoom={15}
            factoryColor={factory.color}
          />
        </div>

        {/* Milestones */}
        <div className="glass-card p-5">
          <h3 className="text-[0.65rem] font-semibold text-dim tracking-widest uppercase mb-4">
            Key Milestones
          </h3>
          <div className="flex flex-col gap-3">
            {factory.milestones.map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: m.done ? factory.color : "transparent",
                      border: m.done ? "none" : "1.5px solid var(--dim)",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.6rem] font-mono text-dim">
                    {m.date}
                  </div>
                  <div
                    className={`text-xs ${m.done ? "text-text" : "text-dim"}`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Bar Chart */}
      <div className="glass-card p-5 mb-8">
        <h3 className="text-[0.65rem] font-semibold text-dim tracking-widest uppercase mb-4">
          Construction Progress by Year
        </h3>
        <div className="flex items-end gap-1 h-32">
          {factory.timeline.map((val, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className="w-full rounded-t transition-all duration-700"
                style={{
                  height: `${Math.max(2, val * 1.1)}%`,
                  background: factory.color,
                  opacity:
                    i === factory.timeline.length - 1 ? 1 : 0.3 + i * 0.1,
                }}
                title={`${TIMELINE_YEARS[i]}: ${val}%`}
              />
              <span className="text-[0.5rem] font-mono text-dim mt-1.5">
                {TIMELINE_YEARS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Products + Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-[0.65rem] font-semibold text-dim tracking-widest uppercase mb-3">
            Products
          </h3>
          <div className="flex flex-wrap gap-2">
            {factory.products.split(",").map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: `${factory.color}15`,
                  color: factory.color,
                }}
              >
                {p.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-[0.65rem] font-semibold text-dim tracking-widest uppercase mb-3">
            Links
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href={`/compare`}
              className="text-xs text-accent-cyan hover:underline font-mono"
            >
              Compare satellite imagery →
            </a>
            <a
              href={`https://www.google.com/maps/@${factory.lat},${factory.lng},1000m/data=!3m1!1e3`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dim hover:text-text font-mono"
            >
              Open in Google Maps ↗
            </a>
            <span className="text-[9px] text-dim font-mono mt-1">
              {factory.lat.toFixed(4)}°N, {factory.lng.toFixed(4)}°W
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
