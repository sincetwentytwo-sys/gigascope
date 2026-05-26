import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Factory } from "@/data/types";
import Sparkline from "./Sparkline";

// Read the timelapse index once at module load. Used to surface a small
// "fresh capture" badge on cards whose most recent satellite frame is within
// the last 60 days.
type TimelapseMeta = { frames: number; latest: string; builtAt: string };
const timelapseIndexPath = resolve(process.cwd(), "public", "timelapses", "index.json");
const TIMELAPSE_INDEX: Record<string, TimelapseMeta> = existsSync(timelapseIndexPath)
  ? JSON.parse(readFileSync(timelapseIndexPath, "utf8"))
  : {};

function hasTimelapseThumbnails(slug: string): boolean {
  return (
    existsSync(join(process.cwd(), "public", "timelapses", `${slug}-first.jpg`)) &&
    existsSync(join(process.cwd(), "public", "timelapses", `${slug}-last.jpg`))
  );
}

function captureFreshness(slug: string): { latest: string; daysOld: number } | null {
  const tl = TIMELAPSE_INDEX[slug];
  if (!tl?.latest) return null;
  const ts = new Date(tl.latest).getTime();
  if (!isFinite(ts)) return null;
  const days = Math.round((Date.now() - ts) / 86_400_000);
  return { latest: tl.latest, daysOld: days };
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

  const showThumbs = hasTimelapseThumbnails(factory.slug);
  // Sparkline reads the per-year progress timeline directly. Empty / all-zero
  // timelines (announced sites pre-groundbreaking) render as a flat baseline
  // inside Sparkline so we don't get a deceptive upward slope.
  const timeline = factory.timeline ?? [];
  const hasYearData = timeline.some((v) => typeof v === "number" && v > 0);
  const fresh = captureFreshness(factory.slug);

  return (
    <a
      href={`/site/${factory.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border-custom bg-bg hover:border-text transition-colors"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      {showThumbs && (
        <div className="relative grid grid-cols-2 gap-px bg-border-custom border-b border-border-custom">
          <div className="relative">
            {/* width/height attrs reserve aspect-correct space before the
                pixels arrive — prevents the card from CLS-shifting once
                the timelapse thumb loads. CSS still constrains actual
                rendered size via aspect-video + object-cover. */}
            <img
              src={`/timelapses/${factory.slug}-first.jpg`}
              alt={`${factory.name} — earlier satellite view`}
              loading="lazy"
              width={1600}
              height={900}
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
              width={1600}
              height={900}
              className="w-full aspect-video object-cover"
            />
            <span className="absolute top-1 right-1 px-1 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-black/60 text-white/90 rounded">
              Now
            </span>
            {fresh && (
              // Capture-date pill on the "Now" thumbnail — gives the user a
              // sense of how recent the imagery is without pretending it's
              // realtime. Uses bg-black/60 to stay readable on any photo.
              <span
                title={`Latest capture ${fresh.latest} (${fresh.daysOld}d ago)`}
                className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] font-mono rounded bg-black/65 text-white/90"
              >
                {fresh.latest}
              </span>
            )}
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
        ) : hasYearData ? (
          // Sparkline traces the year-over-year progress curve. Replaces
          // the 8-segment fill bar so the card surfaces TRAJECTORY (where
          // is this trending) and not just current state.
          <div className="w-full overflow-hidden" style={{ color: accent }}>
            <Sparkline
              values={timeline}
              width={240}
              height={24}
              stroke={accent}
              fill={accent}
              strokeWidth={1.5}
              className="w-full h-6"
            />
          </div>
        ) : (
          <div className="h-1.5 w-full rounded" style={{ background: `${accent}1f` }}>
            <div className="h-full rounded transition-all" style={{ width: `${factory.progress}%`, background: accent }} />
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
