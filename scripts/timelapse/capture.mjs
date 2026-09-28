#!/usr/bin/env node
// Weekly satellite snapshot per site via Sentinel Hub Process API.
// Stores PNG frames as GitHub Release assets (tag: timelapse-frames-<slug>).
//
// Required env:
//   CDSE_CLIENT_ID, CDSE_CLIENT_SECRET — Sentinel Hub OAuth client (Client Credentials flow)
//   GITHUB_TOKEN, GITHUB_REPOSITORY  — set automatically in Actions; used to upload frames
//
// Optional env:
//   ONLY_SLUG=<slug>   — capture a single site (for local testing)
//   FRAME_DATE=<YYYY-MM-DD[,...]> — backfill: pick the scene "as of" each date instead
//                             of today (frame is still named by acquisition date)
//   DRY_RUN=1          — fetch but do not upload to releases
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const factoriesPath = resolve(root, "public", "data", "factories.json");
const outDir = resolve(root, ".timelapse-cache");
mkdirSync(outDir, { recursive: true });

const TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";
const PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process";

const EVALSCRIPT = `//VERSION=3
function setup() {
  return { input: ["B02","B03","B04"], output: { bands: 3, sampleType: "AUTO" } };
}
function evaluatePixel(s) {
  return [2.5 * s.B04, 2.5 * s.B03, 2.5 * s.B02];
}`;

const DEFAULT_HALF_KM = 2.0;
const IMG_SIZE = 1024;
const CLOUD_MAX = 30;
const WINDOW_DAYS = 30;

const FRAME_DATE_FORCED = Boolean(process.env.FRAME_DATE);
// `||` not `??`: an empty workflow_dispatch input arrives as "".
// FRAME_DATE may be a comma-separated list for a multi-date backfill in one
// run (one Actions run per date took ~2.5 min each).
const FRAME_DATES = (process.env.FRAME_DATE || "").split(",").map((s) => s.trim()).filter(Boolean);
let frameDate = FRAME_DATES[0] || new Date().toISOString().slice(0, 10);
const onlySlug = process.env.ONLY_SLUG ?? null;
const dryRun = process.env.DRY_RUN === "1";
const repo = process.env.GITHUB_REPOSITORY ?? null;

function bboxAround(lat, lng, halfKm) {
  const dLat = halfKm / 111;
  const dLng = halfKm / (111 * Math.cos(lat * Math.PI / 180));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

async function fetchToken() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CDSE_CLIENT_ID,
    client_secret: process.env.CDSE_CLIENT_SECRET,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Token ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.access_token;
}

// Pick the actual Sentinel-2 acquisition to render. The old request mosaicked
// "leastCC" over the whole 30-day window, so a frame labelled with the run
// date could really be a 3-4 week old scene (2026-09-21's Terafab frame lost
// to an older 0%-cloud pass while a 1%-cloud 09-22 pass followed). Now: the
// most recent scene at <= FRESH_CLOUD_MAX cloud, else the least cloudy one,
// and the frame is named by its real acquisition date. Returns null if the
// catalog is unreachable (caller falls back to the old window mosaic).
const CATALOG_URL = "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search";
const FRESH_CLOUD_MAX = 10;

async function pickScene(token, bbox) {
  const toDate = new Date(frameDate + "T23:59:59Z");
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - WINDOW_DAYS);
  try {
    const res = await fetch(CATALOG_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        collections: ["sentinel-2-l2a"],
        bbox,
        datetime: `${fromDate.toISOString()}/${toDate.toISOString()}`,
        limit: 100,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Catalog ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const j = await res.json();
    // A site can straddle several tiles; judge each day by its clearest tile.
    const byDay = new Map();
    for (const f of j.features ?? []) {
      const day = String(f.properties?.datetime ?? "").slice(0, 10);
      const cc = Number(f.properties?.["eo:cloud_cover"]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(cc)) continue;
      byDay.set(day, Math.min(cc, byDay.get(day) ?? Infinity));
    }
    const days = [...byDay].filter(([, cc]) => cc <= CLOUD_MAX).sort((a, b) => b[0].localeCompare(a[0]));
    if (days.length === 0) return { day: null, cloud: null };
    const fresh = days.find(([, cc]) => cc <= FRESH_CLOUD_MAX);
    const [day, cloud] = fresh ?? [...days].sort((a, b) => a[1] - b[1])[0];
    return { day, cloud };
  } catch (err) {
    console.log(`  ! catalog lookup failed (${err instanceof Error ? err.message : err}) — falling back to ${WINDOW_DAYS}-day mosaic`);
    return null;
  }
}

// The capture box is centred on `captureCenter` when set, so moving a site's
// pin (lat/lng) to its real footprint doesn't re-frame years of stored frames.
function siteBbox(site) {
  const c = site.captureCenter ?? site;
  return bboxAround(c.lat, c.lng, site.halfKm ?? DEFAULT_HALF_KM);
}

async function captureSite(token, site, sceneDay) {
  const bbox = siteBbox(site);
  const toDate = new Date((sceneDay ?? frameDate) + "T23:59:59Z");
  const fromDate = new Date(toDate);
  if (sceneDay) fromDate.setUTCHours(0, 0, 0, 0);
  else fromDate.setUTCDate(fromDate.getUTCDate() - WINDOW_DAYS);
  const reqBody = {
    input: {
      bounds: {
        bbox,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: fromDate.toISOString(), to: toDate.toISOString() },
            maxCloudCoverage: CLOUD_MAX,
            mosaickingOrder: "leastCC",
          },
        },
      ],
    },
    output: {
      width: IMG_SIZE,
      height: IMG_SIZE,
      responses: [{ identifier: "default", format: { type: "image/png" } }],
    },
    evalscript: EVALSCRIPT,
  };
  const res = await fetch(PROCESS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify(reqBody),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Process ${res.status}: ${txt.slice(0, 300)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`Suspiciously small PNG (${buf.length}B) — likely empty mosaic`);
  return buf;
}

function gh(args, opts = {}) {
  return execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts });
}

function ensureRelease(tag, title) {
  try {
    gh(["release", "view", tag, "--repo", repo]);
    return false;
  } catch {
    gh(["release", "create", tag, "--repo", repo, "--title", title, "--notes", "Auto-managed timelapse frame storage. Do not edit."]);
    return true;
  }
}

function latestAsset(tag) {
  try {
    const names = JSON.parse(gh(["release", "view", tag, "--repo", repo, "--json", "assets"])).assets
      .map((a) => a.name)
      .filter((n) => /^\d{4}-\d{2}-\d{2}\.png$/.test(n))
      .map((n) => n.slice(0, 10))
      .sort();
    return names.at(-1) ?? null;
  } catch {
    return null; // no release yet
  }
}

function uploadFrame(tag, filePath, assetName) {
  gh(["release", "upload", tag, `${filePath}#${assetName}`, "--repo", repo, "--clobber"]);
}

async function main() {
  if (!process.env.CDSE_CLIENT_ID || !process.env.CDSE_CLIENT_SECRET) {
    throw new Error("CDSE_CLIENT_ID / CDSE_CLIENT_SECRET not set");
  }
  if (!dryRun && !repo) throw new Error("GITHUB_REPOSITORY required for upload");

  const data = JSON.parse(readFileSync(factoriesPath, "utf8"));
  // timelapseSlug: null = "no satellite assets" (undisclosed site, or a sub-site
  // that reuses its parent's frames) — don't spend captures on it.
  const sites = (onlySlug ? data.factories.filter((f) => f.slug === onlySlug) : data.factories)
    .filter((f) => f.timelapseSlug !== null);
  if (sites.length === 0) {
    console.log(`No sites match ONLY_SLUG=${onlySlug}`);
    return;
  }

  const token = await fetchToken();

  const results = [];
  for (const fd of FRAME_DATES.length ? FRAME_DATES : [frameDate]) {
  frameDate = fd;
  console.log(`Capturing ${sites.length} site(s) for ${frameDate}${dryRun ? " (DRY-RUN)" : ""}`);
  for (const site of sites) {
    const tag = `timelapse-frames-${site.slug}`;
    try {
      const bbox = siteBbox(site);
      const scene = await pickScene(token, bbox);
      if (scene && !scene.day) {
        results.push({ slug: site.slug, status: "skip" });
        console.log(`  - ${site.slug}: no scene <= ${CLOUD_MAX}% cloud in the last ${WINDOW_DAYS} days`);
        continue;
      }
      const label = scene?.day ?? frameDate;
      // Never add a frame that isn't newer than what's stored: re-picking the
      // same (or an older) clear pass would duplicate or reorder the timelapse.
      // FRAME_DATE is an explicit backfill ("as of" that date), so it may
      // legitimately land before the stored frames.
      const latestStored = dryRun || FRAME_DATE_FORCED ? null : latestAsset(tag);
      if (scene && latestStored && label <= latestStored) {
        results.push({ slug: site.slug, status: "skip" });
        console.log(`  = ${site.slug}: freshest clear scene ${label} (${scene.cloud}% cloud) not newer than stored ${latestStored}`);
        continue;
      }
      const assetName = `${label}.png`;
      const localPath = join(outDir, site.slug, assetName);
      if (scene) console.log(`  · ${site.slug}: scene ${label} (${scene.cloud}% cloud)`);
      const buf = await captureSite(token, site, scene?.day ?? null);
      mkdirSync(dirname(localPath), { recursive: true });
      writeFileSync(localPath, buf);
      const kb = (buf.length / 1024).toFixed(0);
      if (dryRun) {
        results.push({ slug: site.slug, status: "dry-run", bytes: buf.length });
        console.log(`  [DRY] ${site.slug}: ${kb}KB → ${localPath}`);
        continue;
      }
      ensureRelease(tag, `Timelapse frames — ${site.name}`);
      uploadFrame(tag, localPath, assetName);
      results.push({ slug: site.slug, status: "ok", bytes: buf.length });
      console.log(`  ✓ ${site.slug}: ${kb}KB → release ${tag} / ${assetName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ slug: site.slug, status: "fail", error: msg });
      console.error(`  ✗ ${site.slug}: ${msg}`);
    }
  }
  }

  const ok = results.filter((r) => r.status === "ok" || r.status === "dry-run").length;
  console.log(`Done: ${ok}/${sites.length} captured`);
  if (process.env.GITHUB_OUTPUT) {
    const fs = await import("node:fs");
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `captured=${ok}\n`);
  }
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
