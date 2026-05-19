#!/usr/bin/env node
// Build per-site MP4 timelapses from frames stored in GitHub Releases
// (tag: timelapse-frames-<slug>). Writes to public/timelapses/<slug>.mp4
// and public/timelapses/<slug>.jpg (latest frame as poster).
//
// Required env (CI):
//   GITHUB_TOKEN, GITHUB_REPOSITORY — set automatically by Actions
//
// Optional:
//   ONLY_SLUG=<slug>   — build a single site
//   FPS=4              — frames per second (default 4)
//
// Requires `gh` CLI and `ffmpeg` on PATH (both preinstalled on ubuntu-latest).
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const factoriesPath = resolve(root, "public", "data", "factories.json");
const outDir = resolve(root, "public", "timelapses");
const indexPath = resolve(outDir, "index.json");
const tmpRoot = resolve(root, ".timelapse-build");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpRoot, { recursive: true });

const onlySlug = process.env.ONLY_SLUG ?? null;
const fps = Number(process.env.FPS ?? 4);
const repo = process.env.GITHUB_REPOSITORY;
if (!repo) throw new Error("GITHUB_REPOSITORY required");

function gh(args, opts = {}) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
}

function listReleaseAssets(tag) {
  try {
    const json = gh(["release", "view", tag, "--repo", repo, "--json", "assets"]);
    const data = JSON.parse(json);
    return data.assets ?? [];
  } catch {
    return null;
  }
}

function downloadAssets(tag, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  gh(["release", "download", tag, "--repo", repo, "--dir", dir, "--pattern", "*.png"]);
}

const FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "C:/Windows/Fonts/arialbd.ttf",
  "/System/Library/Fonts/Helvetica.ttc",
];
const fontSrc = FONT_CANDIDATES.find((p) => existsSync(p));
const fontLocal = fontSrc ? join(tmpRoot, "font.ttf") : null;
if (fontSrc) {
  copyFileSync(fontSrc, fontLocal);
}

function burnDate(srcPath, dstPath, label) {
  const fontArg = fontLocal ? relative(process.cwd(), fontLocal).replace(/\\/g, "/") : null;
  const drawtext = fontArg
    ? `drawtext=fontfile=${fontArg}:text=${label}:fontsize=44:fontcolor=white:borderw=3:bordercolor=black@0.7:x=20:y=h-th-20`
    : null;
  const vf = drawtext ? `scale=720:720,${drawtext}` : "scale=720:720";
  execFileSync("ffmpeg", ["-y", "-i", srcPath, "-vf", vf, "-q:v", "3", dstPath], {
    stdio: ["ignore", "ignore", "pipe"],
  });
}

function buildVideo(framesDir, outFile) {
  const files = readdirSync(framesDir)
    .filter((f) => f.endsWith(".png") && !f.startsWith("_burned_"))
    .sort();
  if (files.length < 2) return { ok: false, frames: files.length, reason: "need at least 2 frames" };

  for (const f of files) {
    const date = f.replace(/\.png$/, "");
    const burned = join(framesDir, `_burned_${f.replace(/\.png$/, ".jpg")}`);
    burnDate(join(framesDir, f), burned, date);
  }
  const burnedFiles = readdirSync(framesDir).filter((f) => f.startsWith("_burned_")).sort();

  const listFile = join(framesDir, "_concat.txt");
  const lines = burnedFiles.map((f) => `file '${join(framesDir, f).replace(/\\/g, "/")}'\nduration ${1 / fps}`);
  lines.push(`file '${join(framesDir, burnedFiles[burnedFiles.length - 1]).replace(/\\/g, "/")}'`);
  writeFileSync(listFile, lines.join("\n"));

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listFile,
      "-vf", "format=yuv420p",
      "-c:v", "libx264",
      "-preset", "medium",
      "-crf", "23",
      "-movflags", "+faststart",
      outFile,
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  const latest = files[files.length - 1].replace(/\.png$/, "");
  return { ok: true, frames: files.length, latest };
}

async function main() {
  const data = JSON.parse(readFileSync(factoriesPath, "utf8"));
  const sites = onlySlug ? data.factories.filter((f) => f.slug === onlySlug) : data.factories;

  const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : {};
  let built = 0;
  let skipped = 0;

  for (const site of sites) {
    const tag = `timelapse-frames-${site.slug}`;
    const assets = listReleaseAssets(tag);
    if (!assets || assets.length === 0) {
      console.log(`  - ${site.slug}: no release / no frames yet`);
      skipped++;
      continue;
    }
    const dates = assets
      .filter((a) => a.name.endsWith(".png"))
      .map((a) => a.name.replace(".png", ""))
      .sort();
    const prev = index[site.slug];
    if (prev && prev.frames === dates.length && prev.latest === dates[dates.length - 1]) {
      console.log(`  = ${site.slug}: unchanged (${dates.length} frames)`);
      skipped++;
      continue;
    }
    if (dates.length < 2) {
      console.log(`  - ${site.slug}: only ${dates.length} frame — need at least 2`);
      skipped++;
      continue;
    }
    const framesDir = join(tmpRoot, site.slug);
    console.log(`  > ${site.slug}: downloading ${dates.length} frames`);
    downloadAssets(tag, framesDir);
    const outFile = join(outDir, `${site.slug}.mp4`);
    const result = buildVideo(framesDir, outFile);
    if (!result.ok) {
      console.log(`  - ${site.slug}: skipped (${result.reason})`);
      skipped++;
      continue;
    }
    const posterSrc = join(framesDir, `${result.latest}.png`);
    const posterDst = join(outDir, `${site.slug}.jpg`);
    try {
      execFileSync("ffmpeg", ["-y", "-i", posterSrc, "-vf", "scale=720:720", "-q:v", "5", posterDst], { stdio: "ignore" });
    } catch {
      copyFileSync(posterSrc, posterDst.replace(".jpg", ".png"));
    }
    index[site.slug] = {
      frames: result.frames,
      latest: result.latest,
      builtAt: new Date().toISOString(),
    };
    const stat = statSync(outFile);
    console.log(`  ✓ ${site.slug}: ${result.frames} frames → ${(stat.size / 1024).toFixed(0)}KB`);
    built++;
  }

  writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`Done: ${built} built, ${skipped} skipped (of ${sites.length})`);
  if (process.env.GITHUB_OUTPUT) {
    const fs = await import("node:fs");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `built=${built}\n`);
  }
  rmSync(tmpRoot, { recursive: true, force: true });
}

main();
