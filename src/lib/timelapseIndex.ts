// Shared loader for public/timelapses/index.json.
//
// Before this module existed, four separate call sites each did their own
// `readFileSync + existsSync + JSON.parse` at module load. That's 4× disk
// reads and 4× JSON parses during a build/cold-start — small in absolute
// terms but pointless, because the file is identical across all callers.
//
// We read it ONCE here and re-export the parsed shape. The `existsSync`
// guard is preserved so that a fresh checkout (no built timelapses yet)
// doesn't crash dev. Anyone needing the index should `import { TIMELAPSE_INDEX }
// from "@/lib/timelapseIndex"` — never read the JSON directly.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export type TimelapseMeta = {
  frames: number;
  latest: string;
  builtAt: string;
};

const timelapseIndexPath = resolve(
  process.cwd(),
  "public",
  "timelapses",
  "index.json",
);

export const TIMELAPSE_INDEX: Record<string, TimelapseMeta> = existsSync(
  timelapseIndexPath,
)
  ? (JSON.parse(readFileSync(timelapseIndexPath, "utf8")) as Record<
      string,
      TimelapseMeta
    >)
  : {};

// captureFreshness — returns the latest capture date for `slug` plus how
// many days old it is, or null if the slug has no timelapse entry. Lifted
// out of FactoryCard so any component/page can render a "fresh capture"
// badge without duplicating the inline `new Date(...) / 86_400_000` math.
export function captureFreshness(
  slug: string,
  now: number = Date.now(),
): { latest: string; daysOld: number } | null {
  const tl = TIMELAPSE_INDEX[slug];
  if (!tl?.latest) return null;
  const ts = new Date(tl.latest).getTime();
  if (!isFinite(ts)) return null;
  const daysOld = Math.round((now - ts) / 86_400_000);
  return { latest: tl.latest, daysOld };
}
