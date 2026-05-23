import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Factory } from "@/data/types";

const SEGMENTS = 8;

function hasTimelapseThumbnails(slug: string): boolean {
  return (
    existsSync(join(process.cwd(), "public", "timelapses", `${slug}-first.jpg`)) &&
    existsSync(join(process.cwd(), "public", "timelapses", `${slug}-last.jpg`))
  );
}

export default function FactoryCard({
  factory,
  variant = "default",
}: {
  factory: Factory;
  variant?: "default" | "announced";
}) {
  const color = factory.color;

  const isAnnounced = variant === "announced";
  const isAlert = !isAnnounced && (factory.status === "paused" || factory.status === "planned");
  const accent = isAnnounced ? "#c4a000" : isAlert ? "#e63946" : color;

  const filled = Math.max(1, Math.round((factory.progress / 100) * SEGMENTS));
  const showThumbs = hasTimelapseThumbnails(factory.slug);

  return (
    <a
      href={`/site/${factory.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border-custom bg-bg hover:border-text transition-colors"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      {showThumbs && (
        <div className="grid grid-cols-2 gap-px bg-border-custom border-b border-border-custom">
          <div className="relative">
            <img
              src={`/timelapses/${factory.slug}-first.jpg`}
              alt={`${factory.name} — earlier satellite view`}
              loading="lazy"
              className="w-full aspect-video object-cover"
            />
            <span className="absolute top-1 left-1 px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-black/60 text-white/90 rounded">
              Before
            </span>
          </div>
          <div className="relative">
            <img
              src={`/timelapses/${factory.slug}-last.jpg`}
              alt={`${factory.name} — recent satellite view`}
              loading="lazy"
              className="w-full aspect-video object-cover"
            />
            <span className="absolute top-1 right-1 px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-black/60 text-white/90 rounded">
              Now
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{factory.flag}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">{factory.name}</h3>
            <p className="text-[11px] text-dim truncate">{factory.location}</p>
          </div>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold flex-shrink-0"
          style={{
            background: `${accent}1a`,
            color: accent,
          }}
        >
          {isAnnounced ? "Announced" : factory.status}
        </span>
      </div>

      <div>
        <div className="flex items-end justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-dim">
            {isAnnounced ? "Status" : "Progress"}
          </span>
          <span className="text-xs tabular-nums font-medium" style={{ color: accent }}>
            {isAnnounced ? "Announced" : `${factory.progress}%`}
          </span>
        </div>

        {isAnnounced ? (
          <div className="h-1.5 w-full rounded border border-dashed" style={{ borderColor: `${accent}66` }} />
        ) : (
          <div className="flex h-1.5 w-full gap-0.5">
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <div
                key={i}
                className="h-full flex-grow rounded-sm"
                style={i < filled ? { background: accent } : { background: `${accent}1f` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border-custom pt-3 text-[11px]">
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Area</div>
          <div className="font-medium truncate">{factory.area}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Capacity</div>
          <div className="font-medium truncate">{factory.capacity}</div>
        </div>
        <div className="min-w-0">
          <div className="text-dim uppercase tracking-wider text-[9px]">Invest</div>
          <div className="font-medium truncate">{factory.investment}</div>
        </div>
      </div>
      </div>
    </a>
  );
}
