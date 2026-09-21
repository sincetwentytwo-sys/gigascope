#!/usr/bin/env node
// Regenerate the optimized hero-video variants from the freshly built MP4s.
//
// The homepage hero <video> lists <source>s in this order:
//   <slug>-mobile.av1.mp4 → <slug>-mobile.mp4 → <slug>.av1.mp4 → <slug>.mp4
// and the browser plays the FIRST one it can. These variants were produced
// by hand once (2026-05) and never again, so the hero kept playing May
// footage even though <slug>.mp4 was rebuilt every week. This script makes
// the variants part of the weekly rebuild so "latest capture" is what the
// homepage actually shows.
//
// Only hero-rotation slugs need variants (VARIANT_SLUGS, default matches
// HEROES in src/app/page.tsx). Regenerates only when <slug>.mp4 is newer
// than the variant. AV1 (libsvtav1) is best-effort: if the encoder is
// missing, the AV1 variants are skipped and the browser falls through to
// H.264 — a size regression, never a freshness one.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const DIR = resolve(process.cwd(), "public", "timelapses");
const SLUGS = (process.env.VARIANT_SLUGS ?? "giga-texas,starbase-launch")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MOBILE_W = 720; // mobile: 720px wide, aspect preserved, even dims

function hasEncoder(name) {
  try {
    return execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { stdio: ["ignore", "pipe", "ignore"] })
      .toString().includes(name);
  } catch { return false; }
}
function stale(src, dst) {
  return !existsSync(dst) || statSync(dst).mtimeMs < statSync(src).mtimeMs;
}
function run(args) {
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { stdio: ["ignore", "ignore", "inherit"] });
}

const av1 = hasEncoder("libsvtav1");
console.log(`variants: slugs=${SLUGS.join(",")} av1=${av1 ? "libsvtav1" : "unavailable (skipping AV1)"}`);
const mobileVf = `scale=${MOBILE_W}:-2,format=yuv420p`;
let made = 0, skipped = 0;
for (const slug of SLUGS) {
  const src = join(DIR, `${slug}.mp4`);
  if (!existsSync(src)) { console.log(`  - ${slug}: no ${slug}.mp4, skip`); continue; }
  const jobs = [
    [`${slug}-mobile.mp4`, ["-i", src, "-vf", mobileVf, "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-movflags", "+faststart"]],
  ];
  if (av1) {
    jobs.push([`${slug}.av1.mp4`, ["-i", src, "-vf", "format=yuv420p", "-c:v", "libsvtav1", "-preset", "8", "-crf", "35", "-movflags", "+faststart"]]);
    jobs.push([`${slug}-mobile.av1.mp4`, ["-i", src, "-vf", mobileVf, "-c:v", "libsvtav1", "-preset", "8", "-crf", "35", "-movflags", "+faststart"]]);
  }
  for (const [name, args] of jobs) {
    const dst = join(DIR, name);
    if (!stale(src, dst)) { skipped++; continue; }
    run([...args, dst]);
    console.log(`  ✓ ${name} ${(statSync(dst).size / 1024).toFixed(0)}KB`);
    made++;
  }
}
console.log(`Done: ${made} variants written, ${skipped} current`);
