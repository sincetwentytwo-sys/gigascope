// Pulse — empire-wide aggregate stats and recent activity feeds.
//
// All inputs come from two sources of truth that we ship with the site:
//   1. public/data/factories.json — 16 sites, milestones, sources
//   2. public/timelapses/index.json — per-site capture frame count + latest date
//
// Pure server-side; no network, no Redis, no client state. Safe to call
// from any Server Component or build-time route.

import { factories, getTotalInvestment, DATA_LAST_UPDATED, getTimelapseSlug } from "@/data/factories";
import { TIMELAPSE_INDEX } from "@/lib/timelapseIndex";

// ──────────────────────────────────────────────────────────────────────────
// Area parsing — turn the various `area` shapes in factories.json into km².
//
// Shapes we handle (case-insensitive, "Est." prefix tolerated):
//   "10M sqft"       →  10 × 1e6 ft²  →  ~0.93 km²
//   "550K sqft"      → 550 × 1e3 ft²  →  ~0.051 km²
//   "800+ acres"     → 800 acres      →  ~3.24 km²
//   "100K sqft (planned)"            → ignore parenthetical, parse the rest
//   "2 launch pads"  → null (not an area)
//   "68 miles (planned)" → null (linear, not an area)
//
// We deliberately return null on anything we can't confidently parse so
// the caller skips it rather than inventing a number.
// ──────────────────────────────────────────────────────────────────────────
const FT2_TO_KM2 = 9.2903e-8;
const ACRE_TO_KM2 = 0.00404686;

export function parseAreaToKm2(raw: string | null | undefined): number | null {
  if (!raw) return null;
  // Strip "(planned)", "(est)", and similar parentheticals.
  const cleaned = raw.replace(/\([^)]*\)/g, "").trim();
  // Tolerate "Est." prefix and "+" suffix.
  const s = cleaned.replace(/^est\.?\s*/i, "").replace(/[,+]/g, "").trim();

  // X M sqft
  let m = s.match(/^(\d+(?:\.\d+)?)\s*m\s*sqft$/i);
  if (m) return parseFloat(m[1]) * 1e6 * FT2_TO_KM2;
  // X K sqft
  m = s.match(/^(\d+(?:\.\d+)?)\s*k\s*sqft$/i);
  if (m) return parseFloat(m[1]) * 1e3 * FT2_TO_KM2;
  // X sqft (raw, may include commas already stripped)
  m = s.match(/^(\d+(?:\.\d+)?)\s*sqft$/i);
  if (m) return parseFloat(m[1]) * FT2_TO_KM2;
  // X acres
  m = s.match(/^(\d+(?:\.\d+)?)\s*acres?$/i);
  if (m) return parseFloat(m[1]) * ACRE_TO_KM2;
  // X km² / X km2
  m = s.match(/^(\d+(?:\.\d+)?)\s*km[²2]?$/i);
  if (m) return parseFloat(m[1]);
  // X ha (hectares)
  m = s.match(/^(\d+(?:\.\d+)?)\s*ha$/i);
  if (m) return parseFloat(m[1]) * 0.01;

  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// Empire scoreboard
// ──────────────────────────────────────────────────────────────────────────
export interface EmpireStats {
  sites: number;
  operationalSites: number;
  expandingSites: number;
  constructionSites: number;
  announcedSites: number;
  countries: number;
  totalInvestment: string;        // formatted "~$XB" via getTotalInvestment()
  totalFootprintKm2: number;       // sum of parseable areas
  satelliteFrames: number;         // sum of frame counts across all timelapses
  timelapseSites: number;          // number of sites with a built timelapse
  milestonesTracked: number;
  milestonesDone: number;
  sourcesCited: number;            // factory-level sources + per-milestone sourceUrls
  dataLastUpdated: string;
  latestCaptureDate: string;       // YYYY-MM-DD, max across all sites
}

export function getEmpireStats(): EmpireStats {
  const sites = factories.length;
  const operationalSites = factories.filter((f) => f.status === "operational").length;
  const expandingSites = factories.filter((f) => f.status === "expanding").length;
  const constructionSites = factories.filter((f) => f.status === "construction").length;
  const announcedSites = factories.filter((f) => f.status === "announced").length;
  const countries = new Set(factories.map((f) => f.flag)).size;
  const totalInvestment = getTotalInvestment();
  const totalFootprintKm2 = factories.reduce(
    (sum, f) => sum + (parseAreaToKm2(f.area) ?? 0),
    0,
  );
  // Count timelapse stats from the perspective of FACTORIES so that the
  // 2026-05-27 starbase split (launch + build sharing the legacy `starbase.*`
  // assets via `timelapseSlug`) is not double-counted. One asset bundle =
  // one timelapse for empire-scoreboard purposes.
  const usedTimelapseSlugs = new Set<string>();
  for (const f of factories) {
    const s = getTimelapseSlug(f);
    if (s && TIMELAPSE_INDEX[s]) usedTimelapseSlugs.add(s);
  }
  const timelapseEntries = Array.from(usedTimelapseSlugs).map((s) => TIMELAPSE_INDEX[s]);
  const satelliteFrames = timelapseEntries.reduce((s, t) => s + (t.frames ?? 0), 0);
  const timelapseSites = timelapseEntries.length;
  const milestonesTracked = factories.reduce((s, f) => s + f.milestones.length, 0);
  const milestonesDone = factories.reduce(
    (s, f) => s + f.milestones.filter((m) => m.done).length,
    0,
  );
  const sourcesCited = factories.reduce((s, f) => {
    const factorySources = f.sources?.length ?? 0;
    const milestoneSources = f.milestones.filter((m) => m.sourceUrl).length;
    return s + factorySources + milestoneSources;
  }, 0);
  const latestCaptureDate =
    timelapseEntries
      .map((t) => t.latest)
      .filter(Boolean)
      .sort()
      .at(-1) ?? "";
  return {
    sites,
    operationalSites,
    expandingSites,
    constructionSites,
    announcedSites,
    countries,
    totalInvestment,
    totalFootprintKm2,
    satelliteFrames,
    timelapseSites,
    milestonesTracked,
    milestonesDone,
    sourcesCited,
    dataLastUpdated: DATA_LAST_UPDATED,
    latestCaptureDate,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Capture feed — sites ranked by most recent capture (timelapse index).
// ──────────────────────────────────────────────────────────────────────────
export interface CaptureCard {
  slug: string;
  name: string;
  aka: string;
  company: string;
  location: string;
  latest: string;
  frames: number;
  progress: number;
  flag: string;
}

export function getLatestCaptures(limit = 8): CaptureCard[] {
  const rows: CaptureCard[] = [];
  for (const f of factories) {
    const tlSlug = getTimelapseSlug(f);
    if (!tlSlug) continue;
    const tl = TIMELAPSE_INDEX[tlSlug];
    if (!tl) continue;
    rows.push({
      slug: f.slug,
      name: f.name,
      aka: f.aka,
      company: f.company,
      location: f.location,
      latest: tl.latest,
      frames: tl.frames,
      progress: f.progress,
      flag: f.flag,
    });
  }
  return rows
    .sort((a, b) => {
      // Newest first, then by frame count (more coverage), then alphabetical
      if (b.latest !== a.latest) return b.latest.localeCompare(a.latest);
      if (b.frames !== a.frames) return b.frames - a.frames;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

// ──────────────────────────────────────────────────────────────────────────
// Milestone date parser
//
// Inputs we tolerate:
//   "2026-05-15"  full date
//   "2026-05"     month precision  → pinned to day 15
//   "2026"        year precision   → pinned to Jun 15
//   "2026-Q1"     quarter          → pinned to mid-quarter
//   "2026-H1"     half             → pinned to mid-half
//
// Returns a millisecond timestamp or null.
// ──────────────────────────────────────────────────────────────────────────
export function parseMilestoneDate(s: string): number | null {
  if (!s) return null;
  const q = s.match(/^(\d{4})-Q([1-4])$/);
  if (q) {
    const year = parseInt(q[1], 10);
    const quarter = parseInt(q[2], 10);
    const month = (quarter - 1) * 3 + 1; // Q1→Feb (month index 1)
    return Date.UTC(year, month, 15);
  }
  const h = s.match(/^(\d{4})-H([12])$/);
  if (h) {
    const year = parseInt(h[1], 10);
    const half = parseInt(h[2], 10);
    return Date.UTC(year, half === 1 ? 2 : 8, 15);
  }
  const ymd = s.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (ymd) {
    return Date.UTC(
      parseInt(ymd[1], 10),
      ymd[2] ? parseInt(ymd[2], 10) - 1 : 5,
      ymd[3] ? parseInt(ymd[3], 10) : 15,
    );
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────
// Recent milestones — `done: true` only, sorted newest first.
// ──────────────────────────────────────────────────────────────────────────
export interface MilestoneRow {
  date: string;
  text: string;
  site: string;
  slug: string;
  company: string;
  flag: string;
  sourceUrl?: string;
}

export function getRecentMilestones(limit = 12): MilestoneRow[] {
  const rows: Array<MilestoneRow & { ts: number }> = [];
  for (const f of factories) {
    for (const m of f.milestones) {
      if (!m.done) continue;
      const ts = parseMilestoneDate(m.date);
      if (ts === null) continue;
      rows.push({
        ts,
        date: m.date,
        text: m.text,
        site: f.name,
        slug: f.slug,
        company: f.company,
        flag: f.flag,
        sourceUrl: m.sourceUrl,
      });
    }
  }
  return rows
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map(({ ts: _ts, ...row }) => row);
}

// ──────────────────────────────────────────────────────────────────────────
// Upcoming milestones — `done: false` with a future-ish date, sorted soonest.
// ──────────────────────────────────────────────────────────────────────────
export interface UpcomingMilestone extends MilestoneRow {
  daysAway: number;
}

export function getUpcomingMilestones(limit = 10, now = Date.now()): UpcomingMilestone[] {
  const rows: UpcomingMilestone[] = [];
  for (const f of factories) {
    for (const m of f.milestones) {
      if (m.done) continue;
      const ts = parseMilestoneDate(m.date);
      if (ts === null) continue;
      // Include things up to 18 months out. Beyond that they're aspirational.
      const days = Math.round((ts - now) / 86_400_000);
      if (days < -30 || days > 540) continue;
      rows.push({
        date: m.date,
        text: m.text,
        site: f.name,
        slug: f.slug,
        company: f.company,
        flag: f.flag,
        sourceUrl: m.sourceUrl,
        daysAway: days,
      });
    }
  }
  return rows.sort((a, b) => a.daysAway - b.daysAway).slice(0, limit);
}

// ──────────────────────────────────────────────────────────────────────────
// Velocity leaderboard — biggest single-year jump in `progress` (timeline arr).
//
// We compare the last entry to the prior entry. The shape of timeline is:
//   [2020, 2021, 2022, 2023, 2024, 2025, 2026] — progress percentage per year.
// `delta` = last - prior. Sites with delta ≤ 0 are filtered out (no change
// or regression doesn't belong in a "velocity" list).
// ──────────────────────────────────────────────────────────────────────────
export interface VelocityRow {
  slug: string;
  name: string;
  company: string;
  flag: string;
  current: number;
  prior: number;
  delta: number;
}

export function getVelocityLeaderboard(limit = 6): VelocityRow[] {
  const rows: VelocityRow[] = [];
  for (const f of factories) {
    const tl = f.timeline ?? [];
    if (tl.length < 2) continue;
    const current = tl[tl.length - 1];
    const prior = tl[tl.length - 2];
    if (typeof current !== "number" || typeof prior !== "number") continue;
    const delta = current - prior;
    if (delta <= 0) continue;
    rows.push({
      slug: f.slug,
      name: f.name,
      company: f.company,
      flag: f.flag,
      current,
      prior,
      delta,
    });
  }
  return rows.sort((a, b) => b.delta - a.delta).slice(0, limit);
}

// ──────────────────────────────────────────────────────────────────────────
// Company-level summary — used by the homepage status pill row and /pulse.
// ──────────────────────────────────────────────────────────────────────────
export interface CompanyBreakdown {
  company: string;
  sites: number;
  averageProgress: number;
  totalArea: number; // km²
}

export function getCompanyBreakdown(): CompanyBreakdown[] {
  const byCompany = new Map<string, { sites: number; progressSum: number; area: number }>();
  for (const f of factories) {
    if (f.status === "announced") continue;
    const k = f.company;
    const cur = byCompany.get(k) ?? { sites: 0, progressSum: 0, area: 0 };
    cur.sites += 1;
    cur.progressSum += f.progress;
    cur.area += parseAreaToKm2(f.area) ?? 0;
    byCompany.set(k, cur);
  }
  return Array.from(byCompany.entries()).map(([company, v]) => ({
    company,
    sites: v.sites,
    averageProgress: v.sites > 0 ? Math.round(v.progressSum / v.sites) : 0,
    totalArea: v.area,
  }));
}

// ──────────────────────────────────────────────────────────────────────────
// Aggregate timeline — averaged progress per year across all non-announced
// sites. Used by the empire-build-out chart on /pulse.
//
// Sites that haven't broken ground (all-zero timeline) are excluded from the
// average so they don't drag the curve down — pre-groundbreaking projects
// belong in the "Announced" bucket, not in the "empire built so far" story.
// ──────────────────────────────────────────────────────────────────────────
export interface AggregateYear {
  year: number;
  averageProgress: number;
  contributingSites: number;
}

export function getAggregateTimeline(timelineYears: number[]): AggregateYear[] {
  if (!timelineYears || timelineYears.length === 0) return [];
  const rows: AggregateYear[] = [];
  for (let i = 0; i < timelineYears.length; i++) {
    let sum = 0;
    let count = 0;
    for (const f of factories) {
      const tl = f.timeline ?? [];
      if (tl.length <= i) continue;
      const v = tl[i];
      if (typeof v !== "number") continue;
      // Skip sites with no progress yet — they're not "part of the empire"
      // for the year in question.
      if (v <= 0) continue;
      sum += v;
      count += 1;
    }
    rows.push({
      year: timelineYears[i],
      averageProgress: count > 0 ? Math.round(sum / count) : 0,
      contributingSites: count,
    });
  }
  return rows;
}

// ──────────────────────────────────────────────────────────────────────────
// Formatting helpers used by both /pulse and homepage strip.
// ──────────────────────────────────────────────────────────────────────────
export function formatKm2(km2: number): string {
  if (km2 <= 0) return "—";
  if (km2 >= 100) return `${Math.round(km2)} km²`;
  if (km2 >= 10) return `${km2.toFixed(1)} km²`;
  return `${km2.toFixed(2)} km²`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatRelativeDate(d: string, now = Date.now()): string {
  const ts = parseMilestoneDate(d) ?? new Date(d).getTime();
  if (!isFinite(ts)) return d;
  const diffDays = Math.round((now - ts) / 86_400_000);
  if (diffDays < 1) return "today";
  if (diffDays < 2) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 31) return `${Math.round(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)}mo ago`;
  return `${Math.round(diffDays / 365)}y ago`;
}
