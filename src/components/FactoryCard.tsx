import type { Factory } from "@/data/types";

const STATUS_STYLES: Record<
  Factory["status"],
  { bg: string; text: string; border: string }
> = {
  operational: {
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    border: "border-accent-green/30",
  },
  expanding: {
    bg: "bg-accent-blue/10",
    text: "text-accent-blue",
    border: "border-accent-blue/30",
  },
  construction: {
    bg: "bg-accent-amber/10",
    text: "text-accent-amber",
    border: "border-accent-amber/30",
  },
  planned: {
    bg: "bg-accent-purple/10",
    text: "text-accent-purple",
    border: "border-accent-purple/30",
  },
  paused: {
    bg: "bg-accent-red/10",
    text: "text-accent-red",
    border: "border-accent-red/30",
  },
};

export default function FactoryCard({ factory }: { factory: Factory }) {
  const status = STATUS_STYLES[factory.status];
  const segments = 6;
  const filledSegments = Math.round((factory.progress / 100) * segments);

  return (
    <a
      href={`/factory/${factory.slug}`}
      className="group relative block overflow-hidden border border-white/5 bg-[#0f1117]/60 backdrop-blur-md p-5 transition-all duration-500 hover:border-accent-cyan/30 hover:shadow-[0_0_15px_rgba(0,212,255,0.1)]"
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-14 h-14 -mr-7 -mt-7 rotate-45 bg-accent-cyan/5 group-hover:bg-accent-cyan/10 transition-all" />

      {factory.featured && (
        <span className="absolute top-3 right-3 text-[0.55rem] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider animate-pulse z-10">
          NEW
        </span>
      )}

      {/* Header: Flag + Name + Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <span className="text-xl">{factory.flag}</span>
          <div>
            <h3 className="text-sm font-bold tracking-wide group-hover:text-white transition-colors">
              {factory.name}
            </h3>
            <p className="font-mono text-[10px] text-dim">{factory.location}</p>
          </div>
        </div>
        <div className={`${status.bg} ${status.border} border px-2 py-0.5`}>
          <span
            className={`font-mono text-[9px] font-bold tracking-widest uppercase ${status.text}`}
          >
            {factory.status}
          </span>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1.5">
          <span className="font-mono text-[9px] text-dim tracking-widest uppercase">
            PROGRESS
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{ color: factory.color }}
          >
            {factory.progress}%
          </span>
        </div>
        <div className="flex gap-1 h-1.5 w-full">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-grow transition-all"
              style={{
                background:
                  i < filledSegments ? factory.color : `${factory.color}20`,
                boxShadow:
                  i < filledSegments
                    ? `0 0 8px ${factory.color}66`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
        <div>
          <div className="font-mono text-[9px] text-dim/60 uppercase">Area</div>
          <div className="font-mono text-xs text-white/90">{factory.area}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-dim/60 uppercase">Cap</div>
          <div className="font-mono text-xs text-white/90">
            {factory.capacity}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-dim/60 uppercase">
            Products
          </div>
          <div className="font-mono text-xs text-white/90 truncate">
            {factory.products.split(",")[0].trim()}
          </div>
        </div>
      </div>
    </a>
  );
}
