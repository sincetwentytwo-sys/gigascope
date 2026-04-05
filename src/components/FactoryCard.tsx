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
      className="group block border border-white/5 bg-surface/80 p-5 transition-colors hover:border-white/15"
    >
      {factory.featured && (
        <span className="float-right text-[0.55rem] font-bold px-2 py-0.5 bg-accent-pink text-white tracking-wider">
          NEW
        </span>
      )}

      {/* Header: Flag + Name + Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          <span className="text-xl">{factory.flag}</span>
          <div>
            <h3 className="text-sm font-bold tracking-wide">
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

      {/* Continuous Progress Bar */}
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
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${factory.progress}%`,
              background: factory.color,
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
        <div>
          <div className="font-mono text-[9px] text-dim uppercase">Area</div>
          <div className="font-mono text-xs">{factory.area}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-dim uppercase">Cap</div>
          <div className="font-mono text-xs">{factory.capacity}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] text-dim uppercase">Updated</div>
          <div className="font-mono text-xs">{factory.lastUpdated}</div>
        </div>
      </div>
    </a>
  );
}
