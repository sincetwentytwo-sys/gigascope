#!/usr/bin/env node
// Daily marketing draft generator.
// 1. Reads factories.json + previous state (marketing/state.json)
// 2. Detects: newly-completed milestones, progress jumps
// 3. Fetches live SpaceX stats
// 4. Picks scheduled content for the weekday
// 5. Writes marketing/drafts/YYYY-MM-DD.md and updates state.json
// 6. Emits $GITHUB_OUTPUT with draft path + summary
import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { templates, renderTweet } from "./templates.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const dataPath = resolve(root, "public", "data", "factories.json");
const statePath = resolve(root, "marketing", "state.json");
const draftsDir = resolve(root, "marketing", "drafts");

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isoToWeekday(iso) {
  return new Date(iso).getUTCDay(); // 0 Sun .. 6 Sat
}

async function safeFetch(url, opts = {}) {
  try {
    const res = await fetch(url, { ...opts, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

async function fetchSpaceXStats() {
  const LL = "https://ll.thespacedevs.com/2.2.0/launch";
  const LSP = 121;
  const year = new Date().getFullYear();

  const [latestRes, totalRes, yearRes, starlinkRes] = await Promise.all([
    safeFetch(`${LL}/?lsp__id=${LSP}&status=3&ordering=-net&limit=1&mode=list`),
    safeFetch(`${LL}/?lsp__id=${LSP}&status=3&limit=1&mode=list`),
    safeFetch(`${LL}/?lsp__id=${LSP}&status=3&net__gte=${year}-01-01T00:00:00Z&net__lte=${year}-12-31T23:59:59Z&limit=1&mode=list`),
    safeFetch("https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json"),
  ]);

  const latest = latestRes ? await latestRes.json() : null;
  const total = totalRes ? await totalRes.json() : null;
  const thisYear = yearRes ? await yearRes.json() : null;
  const starlink = starlinkRes ? await starlinkRes.json() : null;

  return {
    latestLaunch: latest?.results?.[0]?.name ?? null,
    latestLaunchDate: latest?.results?.[0]?.net ?? null,
    totalLaunches: total?.count ?? null,
    launchesThisYear: thisYear?.count ?? null,
    starlinkCount: Array.isArray(starlink) ? starlink.length : null,
  };
}

function detectChanges(currentFactories, prevFactories) {
  const changes = { milestonesCompleted: [], progressJumps: [] };
  const prevMap = new Map((prevFactories || []).map((f) => [f.id, f]));

  for (const f of currentFactories) {
    const prev = prevMap.get(f.id);
    if (!prev) continue;

    if (f.progress > prev.progress) {
      changes.progressJumps.push({
        site: f,
        oldProgress: prev.progress,
        newProgress: f.progress,
      });
    }

    const prevDone = new Set(prev.milestones.filter((m) => m.done).map((m) => m.text));
    for (const m of f.milestones) {
      if (m.done && !prevDone.has(m.text)) {
        changes.milestonesCompleted.push({ site: f, milestoneText: m.text });
      }
    }
  }
  return changes;
}

function scheduledContent(weekday, data, spacexStats) {
  // 0 Sun .. 6 Sat (UTC)
  const tweets = [];
  const today = todayISO();
  const day = parseInt(today.replace(/-/g, ""), 10);

  if (weekday === 1) {
    // Monday: empire snapshot
    const companies = [...new Set(data.factories.map((f) => f.company))];
    tweets.push(templates.empireSnapshot({
      totalSites: data.factories.length,
      totalInvestment: data.totalInvestment,
      companies: companies.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
    }));
  }

  if (weekday === 2) {
    // Tuesday: upcoming milestone spotlight
    const upcoming = data.factories
      .flatMap((f) => f.milestones.filter((m) => !m.done).map((m) => ({ site: f, ...m })))
      .filter((m) => /\d{4}/.test(m.date));
    if (upcoming.length > 0) {
      const pick = upcoming[day % upcoming.length];
      tweets.push(templates.milestoneHit({
        site: pick.site,
        milestoneText: `${pick.text} (target: ${pick.date})`,
      }));
    }
  }

  if (weekday === 3) {
    // Wednesday: featured site rotation
    const idx = day % data.factories.length;
    tweets.push(templates.featuredSite({ site: data.factories[idx] }));
  }

  if (weekday === 4 && spacexStats?.totalLaunches) {
    // Thursday: SpaceX live stats
    tweets.push(templates.spacexStats({
      totalLaunches: spacexStats.totalLaunches,
      launchesThisYear: spacexStats.launchesThisYear,
      starlinkCount: spacexStats.starlinkCount,
      year: new Date().getFullYear(),
    }));
  }

  if (weekday === 5) {
    // Friday: satellite compare rotation
    const operational = data.factories.filter((f) => f.status !== "planned");
    const idx = day % operational.length;
    tweets.push(templates.satelliteCompare({ site: operational[idx] }));
  }

  if (weekday === 6) {
    // Saturday: recent milestone showcase
    const recent = data.factories
      .flatMap((f) => f.milestones.filter((m) => m.done).map((m) => ({ site: f, ...m })))
      .filter((m) => /\d{4}/.test(m.date))
      .sort((a, b) => b.date.localeCompare(a.date));
    if (recent.length > 0) {
      const pick = recent[day % Math.min(recent.length, 5)];
      tweets.push(templates.milestoneHit({
        site: pick.site,
        milestoneText: `${pick.text} (${pick.date}) ✓`,
      }));
    }
  }

  if (weekday === 0) {
    // Sunday: weekly summary
    tweets.push(templates.weeklySummary({
      completedThisWeek: [],
      upcomingNextWeek: [],
    }));
  }

  return tweets;
}

function writeDraft(date, tweets, weekday) {
  if (!existsSync(draftsDir)) mkdirSync(draftsDir, { recursive: true });
  const draftPath = resolve(draftsDir, `${date}.md`);

  const weekdayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday];
  const lines = [];
  lines.push(`# Tweet drafts — ${date} (${weekdayName})`);
  lines.push("");
  lines.push(`Generated by \`scripts/marketing/generate.mjs\`. Copy any block to X / Hypefury / Typefully.`);
  lines.push("");

  if (tweets.length === 0) {
    lines.push("_No tweets generated. No data changes detected and no scheduled content for this weekday._");
  } else {
    for (const t of tweets) {
      lines.push(renderTweet(t));
    }
  }

  writeFileSync(draftPath, lines.join("\n"));
  return draftPath;
}

function main() {
  const data = loadJson(dataPath, null);
  if (!data) {
    console.error("factories.json not found");
    process.exit(1);
  }

  const prevState = loadJson(statePath, { factories: [], lastRun: null });
  const today = todayISO();
  const weekday = isoToWeekday(today);

  return Promise.resolve()
    .then(() => fetchSpaceXStats())
    .then((spacexStats) => {
      const changes = detectChanges(data.factories, prevState.factories);
      const tweets = [];

      for (const c of changes.milestonesCompleted.slice(0, 3)) {
        tweets.push(templates.milestoneHit(c));
      }
      for (const p of changes.progressJumps.slice(0, 2)) {
        if (p.newProgress - p.oldProgress >= 5) {
          tweets.push(templates.progressJump(p));
        }
      }

      tweets.push(...scheduledContent(weekday, data, spacexStats));

      const draftPath = writeDraft(today, tweets, weekday);

      const newState = {
        factories: data.factories.map((f) => ({
          id: f.id,
          progress: f.progress,
          milestones: f.milestones,
        })),
        lastRun: today,
        spacex: spacexStats,
      };
      writeFileSync(statePath, JSON.stringify(newState, null, 2));

      const summary = `${tweets.length} tweet${tweets.length === 1 ? "" : "s"} (${changes.milestonesCompleted.length} milestone, ${changes.progressJumps.length} progress) — ${draftPath.replace(root + "/", "")}`;
      console.log(summary);

      const out = process.env.GITHUB_OUTPUT;
      if (out) {
        const lines = [
          `draft_path=${draftPath.replace(root + "/", "")}`,
          `tweet_count=${tweets.length}`,
          `summary=${summary}`,
        ].join("\n") + "\n";
        appendFileSync(out, lines);
      }
    })
    .catch((err) => {
      console.error("Generator failed:", err);
      process.exit(1);
    });
}

main();
