#!/usr/bin/env node
// Reads public/data/factories.json, checks lastUpdated freshness, and emits
// GitHub Actions outputs (stale, age_days, last_updated) via $GITHUB_OUTPUT.
// Also prints a human-readable summary. Pure Node, no deps.
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "..", "public", "data", "factories.json");
const staleDays = Number(process.env.STALE_DAYS ?? 30);

const raw = readFileSync(dataPath, "utf8");
const data = JSON.parse(raw);
const lastUpdated = data.lastUpdated;

if (!lastUpdated) {
  console.error("No lastUpdated field in factories.json");
  process.exit(1);
}

const then = new Date(lastUpdated);
if (Number.isNaN(then.getTime())) {
  console.error(`Invalid lastUpdated: ${lastUpdated}`);
  process.exit(1);
}

const ageMs = Date.now() - then.getTime();
const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
const stale = ageDays >= staleDays;

console.log(`Data last updated: ${lastUpdated}`);
console.log(`Age: ${ageDays} days`);
console.log(`Stale threshold: ${staleDays} days`);
console.log(`Stale: ${stale}`);

// Per-factory summary
const perFactory = (data.factories ?? [])
  .map((f) => `  - ${f.name}: ${f.progress}% (${f.lastUpdated ?? "n/a"})`)
  .join("\n");
console.log("\nPer-factory status:\n" + perFactory);

const out = process.env.GITHUB_OUTPUT;
if (out) {
  const lines = [
    `stale=${stale}`,
    `age_days=${ageDays}`,
    `last_updated=${lastUpdated}`,
  ].join("\n") + "\n";
  appendFileSync(out, lines);
}

// For local runs, also write a status file
try {
  writeFileSync(
    resolve(__dirname, "..", ".data-freshness.json"),
    JSON.stringify({ stale, ageDays, lastUpdated, staleDays }, null, 2)
  );
} catch {
  /* ignore */
}
