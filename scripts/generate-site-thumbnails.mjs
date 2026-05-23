#!/usr/bin/env node
/**
 * Extract first-frame + last-frame JPGs from every timelapse MP4 in
 * public/timelapses/. Output: <slug>-first.jpg and <slug>-last.jpg
 * (640x360 cover-cropped, ~q5 JPEG). Surfaced by FactoryCard + /site/[slug]
 * as a before/after band so visitors see "2020 vs 2026" at a glance.
 *
 * Idempotent — skips slugs whose pair already exists.
 *
 * Run: node scripts/generate-site-thumbnails.mjs
 */

import { execFileSync } from "node:child_process";
import { readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const TIMELAPSE_DIR = resolve(process.cwd(), "public", "timelapses");
const WIDTH = 640;
const HEIGHT = 360;
const QUALITY = 5; // ffmpeg -q:v 5 ≈ ~75-85% JPEG quality (mid-quality)
const VF = `scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`;

function checkFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    execFileSync("ffprobe", ["-version"], { stdio: "ignore" });
  } catch {
    console.error(
      "ffmpeg/ffprobe not found on PATH. Install:\n" +
        "  Windows: winget install Gyan.FFmpeg\n" +
        "  Mac:     brew install ffmpeg\n" +
        "  Linux:   apt install ffmpeg",
    );
    process.exit(1);
  }
}

function getDuration(mp4Path) {
  const out = execFileSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      mp4Path,
    ],
    { encoding: "utf8" },
  ).trim();
  const seconds = Number(out);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe could not read duration for ${mp4Path} (got ${JSON.stringify(out)})`);
  }
  return seconds;
}

function extractFirstFrame(mp4Path, outPath) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      mp4Path,
      "-vframes",
      "1",
      "-q:v",
      String(QUALITY),
      "-vf",
      VF,
      outPath,
    ],
    { stdio: "inherit" },
  );
}

function extractLastFrame(mp4Path, outPath, durationSec) {
  // Seek a touch before the actual end so we land on the final visible frame
  // rather than past-EOF (which can produce a black/empty result).
  const seek = Math.max(0, durationSec - 0.15).toFixed(3);
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-ss",
      seek,
      "-i",
      mp4Path,
      "-vframes",
      "1",
      "-q:v",
      String(QUALITY),
      "-vf",
      VF,
      outPath,
    ],
    { stdio: "inherit" },
  );
}

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function main() {
  checkFfmpeg();

  if (!existsSync(TIMELAPSE_DIR)) {
    console.error(`Timelapse directory missing: ${TIMELAPSE_DIR}`);
    process.exit(1);
  }

  const mp4s = readdirSync(TIMELAPSE_DIR).filter((f) => f.toLowerCase().endsWith(".mp4"));
  if (mp4s.length === 0) {
    console.log("No .mp4 files found — nothing to do.");
    return;
  }

  console.log(`Found ${mp4s.length} timelapse MP4s in public/timelapses/`);

  let generated = 0;
  let skipped = 0;
  let totalBytesAdded = 0;

  for (const file of mp4s) {
    const slug = file.replace(/\.mp4$/i, "");
    const mp4Path = join(TIMELAPSE_DIR, file);
    const firstPath = join(TIMELAPSE_DIR, `${slug}-first.jpg`);
    const lastPath = join(TIMELAPSE_DIR, `${slug}-last.jpg`);

    if (existsSync(firstPath) && existsSync(lastPath)) {
      console.log(`  [skip] ${slug} — pair already exists`);
      skipped++;
      continue;
    }

    try {
      const duration = getDuration(mp4Path);
      console.log(`  [gen]  ${slug} (${duration.toFixed(2)}s)`);
      extractFirstFrame(mp4Path, firstPath);
      extractLastFrame(mp4Path, lastPath, duration);

      const firstSize = statSync(firstPath).size;
      const lastSize = statSync(lastPath).size;
      totalBytesAdded += firstSize + lastSize;

      console.log(`         first=${fmtKB(firstSize)}  last=${fmtKB(lastSize)}`);
      generated++;
    } catch (err) {
      console.error(`  [fail] ${slug} — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(
    `\nDone. Generated ${generated} pair${generated === 1 ? "" : "s"}, ` +
      `skipped ${skipped}, total disk added ${(totalBytesAdded / 1024).toFixed(1)} KB.`,
  );
}

main();
