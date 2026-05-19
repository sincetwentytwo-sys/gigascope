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
//   FRAME_DATE=<YYYY-MM-DD> — override frame date (default: today UTC)
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

const HALF_KM = 2.0;
const IMG_SIZE = 1024;
const CLOUD_MAX = 30;
const WINDOW_DAYS = 30;

const frameDate = process.env.FRAME_DATE ?? new Date().toISOString().slice(0, 10);
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

async function captureSite(token, site) {
  const bbox = bboxAround(site.lat, site.lng, HALF_KM);
  const toDate = new Date(frameDate + "T23:59:59Z");
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - WINDOW_DAYS);
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

function uploadFrame(tag, filePath, assetName) {
  gh(["release", "upload", tag, `${filePath}#${assetName}`, "--repo", repo, "--clobber"]);
}

async function main() {
  if (!process.env.CDSE_CLIENT_ID || !process.env.CDSE_CLIENT_SECRET) {
    throw new Error("CDSE_CLIENT_ID / CDSE_CLIENT_SECRET not set");
  }
  if (!dryRun && !repo) throw new Error("GITHUB_REPOSITORY required for upload");

  const data = JSON.parse(readFileSync(factoriesPath, "utf8"));
  const sites = onlySlug ? data.factories.filter((f) => f.slug === onlySlug) : data.factories;
  if (sites.length === 0) {
    console.log(`No sites match ONLY_SLUG=${onlySlug}`);
    return;
  }

  console.log(`Capturing ${sites.length} site(s) for ${frameDate}${dryRun ? " (DRY-RUN)" : ""}`);
  const token = await fetchToken();

  const results = [];
  for (const site of sites) {
    const tag = `timelapse-frames-${site.slug}`;
    const assetName = `${frameDate}.png`;
    const localPath = join(outDir, site.slug, `${frameDate}.png`);
    try {
      const buf = await captureSite(token, site);
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
