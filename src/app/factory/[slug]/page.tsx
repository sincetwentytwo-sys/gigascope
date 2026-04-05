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
    title: f ? `${f.name} — GIGASCOPE` : "Factory — GIGASCOPE",
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
    { label: "AREA", value: factory.area, accent: "border-accent-blue" },
    { label: "CAPACITY", value: factory.capacity, accent: "border-accent-cyan" },
    { label: "INVESTMENT", value: factory.investment, accent: "border-accent-pink" },
    { label: "EMPLOYEES", value: factory.employees, accent: "border-accent-amber" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/"
          className="text-dim text-xs font-mono hover:text-text transition-colors"
        >
          &larr; BACK TO ALL
        </a>
        <div className="flex items-start justify-between mt-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              {factory.flag} {factory.name}
            </h1>
            <p className="text-dim text-sm mt-1">
              {factory.aka} &middot; {factory.location}
            </p>
            <p className="font-mono text-[9px] text-dim mt-1">
              Data updated {factory.lastUpdated}
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

        {/* Progress bar in header */}
        <div className="mt-4 w-full bg-white/5 h-1 overflow-hidden">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${factory.progress}%`,
              background: factory.color,
            }}
          />
        </div>
      </div>

      {/* Info Cards — glass panels with left border accent */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {infoCards.map((c) => (
          <div
            key={c.label}
            className={`bg-[#1f1f23]/60 backdrop-blur-md border-l-2 ${c.accent} p-4 hover:bg-[#1f1f23] transition-all`}
          >
            <span className="font-mono text-[10px] text-dim tracking-widest uppercase block mb-3">
              {c.label}
            </span>
            <span className="font-mono text-xl font-bold text-white">
              {c.value}
            </span>
          </div>
        ))}
      </div>

      {/* Map + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Satellite Map */}
        <div className="lg:col-span-2 relative">
          {/* Map overlay badge */}
          <div className="absolute top-3 left-3 z-10 bg-bg/80 backdrop-blur-md px-3 py-1 border-l-2 flex items-center gap-2" style={{ borderColor: factory.color }}>
            <span className="font-mono text-[10px] font-bold tracking-widest text-white">
              {factory.lat.toFixed(4)}&deg;N, {factory.lng.toFixed(4)}&deg;W
            </span>
          </div>
          <div className="h-[400px] sm:h-[500px]">
            <SatelliteMapWrapper
              lat={factory.lat}
              lng={factory.lng}
              zoom={15}
              factoryColor={factory.color}
            />
          </div>
        </div>

        {/* Milestones — timeline with vertical line */}
        <div className="bg-[#1f1f23]/60 backdrop-blur-md p-5 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: factory.color }}>
              Milestones
            </h3>
            <span className="font-mono text-[10px] text-dim">
              {factory.milestones.filter((m) => m.done).length}/{factory.milestones.length}
            </span>
          </div>
          <div className="relative space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
            {factory.milestones.map((m, i) => (
              <div
                key={i}
                className={`relative pl-8 ${!m.done ? "opacity-50" : ""}`}
              >
                <div className="absolute left-0 top-1.5 w-4 h-4 bg-bg border flex items-center justify-center" style={{ borderColor: m.done ? factory.color : "var(--dim)" }}>
                  {m.done && (
                    <div
                      className="w-1.5 h-1.5"
                      style={{ background: factory.color }}
                    />
                  )}
                </div>
                <div>
                  <span className="font-mono text-[10px] text-dim">
                    {m.date}
                  </span>
                  <h4 className="text-xs font-semibold text-white/90 uppercase mt-0.5">
                    {m.text}
                  </h4>
                  <p className="font-mono text-[9px] mt-0.5" style={{ color: m.done ? factory.color : "var(--dim)" }}>
                    {m.done ? "COMPLETED" : "PENDING"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Bar Chart — Phase Intensity style */}
      <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-white/5 p-5 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-sm tracking-widest text-accent-cyan uppercase">
            Progress by Year
          </h3>
        </div>
        <div className="flex items-end justify-between h-40 gap-2 px-2">
          {factory.timeline.map((val, i) => {
            const isLatest = i === factory.timeline.length - 1;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div
                  className="w-full transition-all duration-700 group-hover:scale-y-105"
                  style={{
                    height: `${Math.max(4, val)}%`,
                    background: isLatest ? factory.color : `${factory.color}30`,
                  }}
                  title={`${TIMELINE_YEARS[i]}: ${val}%`}
                />
                <span
                  className={`font-mono text-[9px] ${isLatest ? "text-white font-bold" : "text-dim"}`}
                >
                  {String(TIMELINE_YEARS[i]).slice(-2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Products + Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-white/5 p-5">
          <h3 className="font-mono text-[10px] text-dim tracking-widest uppercase mb-3">
            Products
          </h3>
          <div className="flex flex-wrap gap-2">
            {factory.products.split(",").map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 text-xs font-medium font-mono"
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

        <div className="bg-[#1f1f23]/60 backdrop-blur-md border border-white/5 p-5">
          <h3 className="font-mono text-[10px] text-dim tracking-widest uppercase mb-3">
            Links
          </h3>
          <div className="flex flex-col gap-2">
            <a
              href="/compare"
              className="text-xs text-accent-cyan hover:underline font-mono"
            >
              Compare satellite imagery &rarr;
            </a>
            <a
              href={`https://www.google.com/maps/@${factory.lat},${factory.lng},1000m/data=!3m1!1e3`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dim hover:text-text font-mono"
            >
              Open in Google Maps &nearr;
            </a>
            <span className="font-mono text-[9px] text-dim mt-1">
              {factory.lat.toFixed(4)}&deg;N, {factory.lng.toFixed(4)}&deg;W
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
