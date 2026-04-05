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

  return (
    <a
      href={`/factory/${factory.slug}`}
      className="group block border border-white/8 bg-surface p-5 hover:border-white/20 transition-colors"
    >
      {/* Top row: status + progress number (biggest visual element) */}
      <div className="flex justify-between items-start mb-3">
        <div className={`${status.bg} ${status.border} border px-2 py-0.5`}>
          <span className={`font-mono text-[9px] font-bold tracking-widest uppercase ${status.text}`}>
            {factory.status}
          </span>
        </div>
        <span className="font-mono text-2xl font-black" style={{ color: factory.color }}>
          {factory.progress}%
        </span>
      </div>

      {/* Progress bar — thicker so it's actually visible */}
      <div className="h-1.5 bg-white/5 mb-4">
        <div className="h-full" style={{ width: `${factory.progress}%`, background: factory.color }} />
      </div>

      {/* Name + location */}
      <div className="flex gap-2.5 items-center mb-3">
        <span className="text-lg">{factory.flag}</span>
        <div>
          <h3 className="text-sm font-bold">{factory.name}</h3>
          <p className="font-mono text-[10px] text-dim">{factory.location}</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 font-mono text-[10px]">
        <div>
          <span className="text-dim">Area </span>
          <span>{factory.area}</span>
        </div>
        <div>
          <span className="text-dim">Cap </span>
          <span>{factory.capacity}</span>
        </div>
      </div>
    </a>
  );
}
