#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "..", "..", "public", "data", "factories.json");

const FETCH_TIMEOUT_MS = 15000;
const USER_AGENT = "gigascope-data-bot/1.0 (+https://github.com/sincetwentytwo-sys/gigascope)";

const WIKIPEDIA_TITLES = {
  "terafab": null,
  "giga-texas": "Gigafactory_Texas",
  "giga-nevada": "Gigafactory_Nevada",
  "giga-shanghai": "Gigafactory_Shanghai",
  "giga-berlin": "Gigafactory_Berlin-Brandenburg",
  "giga-mexico": "Gigafactory_Mexico",
  "fremont": "Tesla_Fremont_Factory",
  "giga-buffalo": "Gigafactory_New_York",
  "starbase": "SpaceX_Starbase",
  "spacex-hawthorne": "SpaceX_headquarters",
  "cape-canaveral": "Space_Launch_Complex_40",
  "vandenberg": "Vandenberg_Space_Launch_Complex_4",
  "colossus": "Colossus_(supercomputer)",
  "neuralink-fremont": "Neuralink",
  "neuralink-austin": null,
  "vegas-loop": "Vegas_Loop",
};

const SPACEX_PAD_FILTER = {
  "starbase": ["Starbase", "Boca Chica"],
  "cape-canaveral": ["SLC-40", "LC-39A", "Kennedy", "Cape Canaveral"],
  "vandenberg": ["SLC-4E", "Vandenberg"],
};

const summary = {
  sitesUpdated: [],
  milestonesAdded: 0,
  warnings: [],
  sourcesQueried: 0,
  sourcesFailed: 0,
};

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...(opts.headers || {}) },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function safeJson(url) {
  summary.sourcesQueried++;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) {
      summary.sourcesFailed++;
      summary.warnings.push(`HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    summary.sourcesFailed++;
    summary.warnings.push(`Fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

async function getWikipediaRevisionDate(title) {
  if (!title) return null;
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const data = await safeJson(url);
  if (!data) return null;
  const ts = data.timestamp || (data.content_urls && data.timestamp);
  return ts ? ts.slice(0, 10) : null;
}

async function getRecentSpaceXLaunches(siteId) {
  const filter = SPACEX_PAD_FILTER[siteId];
  if (!filter) return [];
  const url = "https://ll.thespacedevs.com/2.2.0/launch/previous/?search=SpaceX&limit=20";
  const data = await safeJson(url);
  if (!data || !Array.isArray(data.results)) return [];
  const today = new Date().toISOString().slice(0, 10);
  const matches = [];
  for (const r of data.results) {
    const padName = (r.pad && r.pad.name) || "";
    const padLoc = (r.pad && r.pad.location && r.pad.location.name) || "";
    const hay = `${padName} ${padLoc}`;
    if (!filter.some((kw) => hay.toLowerCase().includes(kw.toLowerCase()))) continue;
    const date = (r.net || "").slice(0, 10);
    if (!date || date > today) continue;
    const name = (r.name || "").split("|").slice(-1)[0].trim();
    matches.push({ date, text: `Launch: ${name}`.slice(0, 120), done: true });
  }
  return matches.slice(0, 1);
}

function milestoneKey(m) {
  return `${(m.date || "").trim()}::${(m.text || "").trim().toLowerCase()}`;
}

function mergeMilestones(existing, incoming) {
  const seen = new Set(existing.map(milestoneKey));
  let added = 0;
  const out = [...existing];
  for (const m of incoming) {
    const k = milestoneKey(m);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
    added++;
  }
  out.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return { merged: out, added };
}

async function updateFactory(factory) {
  const changes = [];

  const wpTitle = WIKIPEDIA_TITLES[factory.id];
  if (wpTitle) {
    const revDate = await getWikipediaRevisionDate(wpTitle);
    if (revDate) {
      factory.sources = factory.sources || {};
      if (factory.sources.wikipediaRevision !== revDate) {
        factory.sources.wikipediaRevision = revDate;
        factory.sources.wikipediaTitle = wpTitle;
        changes.push(`wp-rev=${revDate}`);
      }
    }
  }

  if (factory.company === "spacex") {
    const launches = await getRecentSpaceXLaunches(factory.id);
    if (launches.length) {
      const { merged, added } = mergeMilestones(factory.milestones || [], launches);
      if (added > 0) {
        factory.milestones = merged;
        summary.milestonesAdded += added;
        changes.push(`+${added} launch milestone(s)`);
      }
    }
  }

  if (changes.length > 0) {
    factory.lastUpdated = new Date().toISOString().slice(0, 10);
    summary.sitesUpdated.push(`${factory.name}: ${changes.join(", ")}`);
  }
  return changes.length > 0;
}

function stableStringify(obj) {
  return JSON.stringify(obj, null, 2) + "\n";
}

async function main() {
  let raw;
  try {
    raw = readFileSync(dataPath, "utf8");
  } catch (err) {
    console.error(`Cannot read ${dataPath}: ${err.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`Invalid JSON in factories.json: ${err.message}`);
    process.exit(1);
  }

  const originalSerialized = stableStringify(data);
  const todayIso = new Date().toISOString();
  const today = todayIso.slice(0, 10);

  let anyChange = false;
  for (const factory of data.factories || []) {
    try {
      const changed = await updateFactory(factory);
      if (changed) anyChange = true;
    } catch (err) {
      summary.warnings.push(`Factory ${factory.id} failed: ${err.message}`);
    }
  }

  if (data.lastChecked !== today) {
    data.lastChecked = today;
  }
  if (anyChange) {
    data.lastUpdated = today;
  }

  const orderedTop = {
    lastUpdated: data.lastUpdated,
    lastChecked: data.lastChecked,
    totalInvestment: data.totalInvestment,
    timelineYears: data.timelineYears,
  };
  for (const k of Object.keys(data)) {
    if (!(k in orderedTop)) orderedTop[k] = data[k];
  }

  const nextSerialized = stableStringify(orderedTop);

  if (nextSerialized !== originalSerialized) {
    writeFileSync(dataPath, nextSerialized, "utf8");
    console.log(`Wrote updates to ${dataPath}`);
  } else {
    console.log(`No changes detected; file untouched.`);
  }

  console.log("\n=== Update Summary ===");
  console.log(`Sources queried: ${summary.sourcesQueried}`);
  console.log(`Sources failed:  ${summary.sourcesFailed}`);
  console.log(`Sites updated:   ${summary.sitesUpdated.length}`);
  for (const s of summary.sitesUpdated) console.log(`  - ${s}`);
  console.log(`Milestones added: ${summary.milestonesAdded}`);
  if (summary.warnings.length) {
    console.log(`Warnings (${summary.warnings.length}):`);
    for (const w of summary.warnings.slice(0, 10)) console.log(`  ! ${w}`);
    if (summary.warnings.length > 10) console.log(`  ... ${summary.warnings.length - 10} more`);
  }
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
