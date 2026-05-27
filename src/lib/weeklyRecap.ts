// Weekly recap aggregation helpers.
//
// Three pure functions that pull the three feeds the Saturday recap email
// needs:
//   1. milestones marked `done` in the last 7 days
//   2. analyses (permit/inference posts) published in the last 7 days
//   3. milestones still open whose date lands in the next 14 days
//
// All three are pure: no Redis, no network, no Resend, no React. They take
// the current time + factories list as parameters so the cron handler can
// call them with the live data and the tests can call them with mocks.
//
// `parseMilestoneDate` is reused from `pulse.ts` so quarterly/half-year
// milestones get the same mid-period pinning the rest of the site applies.
// One date parser, one source of truth.
//
// The analyses feed is read off disk via `fs.readFileSync` rather than the
// `@/data/analyses` bundled import. The cron runs in the Node runtime, so
// fs is available — and reading at request time keeps the recap honest if
// `public/data/analyses.json` is hot-edited between deploys (a real workflow
// for the owner, who publishes analyses by editing JSON + pushing).

import fs from "node:fs";
import path from "node:path";
import type { Factory, Milestone, Company } from "@/data/types";
import { parseMilestoneDate } from "@/lib/pulse";

const DAY_MS = 86_400_000;
const SEVEN_DAYS_MS = 7 * DAY_MS;

/**
 * A single recently-completed milestone, flattened with its parent-factory
 * context so the email template doesn't have to walk the factories array
 * a second time at render.
 */
export interface RecapMilestone {
  date: string;
  text: string;
  siteSlug: string;
  siteName: string;
  company: Company;
  sourceUrl?: string;
}

/**
 * A single recently-published analysis, trimmed to the fields the recap
 * email actually renders. The full `bodyMarkdown` is intentionally NOT
 * included — the email only needs the kicker + title + link.
 */
export interface RecapAnalysis {
  slug: string;
  title: string;
  kicker: string;
  publishedAt: string;
  confidence: "verified" | "medium" | "speculative";
}

/**
 * A single upcoming-catalyst milestone, with the same `daysAway` field the
 * pulse upcoming-list uses so the email template can sort/label by "in N
 * days" without re-parsing the date string.
 */
export interface RecapUpcoming {
  date: string;
  text: string;
  siteSlug: string;
  siteName: string;
  company: Company;
  sourceUrl?: string;
  daysAway: number;
}

/**
 * Defensive: an entry in factories.json with a missing/null `milestones`
 * key would crash `for (const m of f.milestones)`. We guard so a malformed
 * factory record (typo in data) doesn't take the whole cron down — the
 * cron sends to thousands of subscribers and a single bad row shouldn't
 * cost an entire send wave.
 */
function safeMilestones(f: Factory): Milestone[] {
  return Array.isArray(f?.milestones) ? f.milestones : [];
}

/**
 * Milestones where `done === true` AND parseable date falls within
 * `[now - 7d, now]` (inclusive on both ends). Sorted newest-date-first.
 *
 * Lower bound is inclusive on purpose — a milestone marked done exactly
 * 7d ago at the same wall-clock second the cron fires should land in the
 * recap; this matches the half-open "[lower, now]" reading subscribers
 * intuit from "in the past 7 days".
 */
export function getRecentlyDoneMilestones(
  now: Date,
  factories: Factory[],
): RecapMilestone[] {
  if (!(now instanceof Date) || isNaN(now.getTime())) return [];
  if (!Array.isArray(factories)) return [];
  const cutoff = now.getTime() - SEVEN_DAYS_MS;
  const upper = now.getTime();
  const rows: Array<RecapMilestone & { ts: number }> = [];
  for (const f of factories) {
    if (!f || typeof f !== "object") continue;
    for (const m of safeMilestones(f)) {
      if (!m || m.done !== true) continue;
      if (typeof m.date !== "string") continue;
      const ts = parseMilestoneDate(m.date);
      if (ts === null) continue;
      if (ts < cutoff || ts > upper) continue;
      rows.push({
        ts,
        date: m.date,
        text: m.text,
        siteSlug: f.slug,
        siteName: f.name,
        company: f.company,
        sourceUrl: m.sourceUrl,
      });
    }
  }
  return rows
    .sort((a, b) => b.ts - a.ts)
    .map(({ ts: _ts, ...row }) => row);
}

/**
 * Analyses with `publishedAt` ISO timestamps within the same `[now - 7d, now]`
 * window. Sorted newest-first. Reads `public/data/analyses.json` off disk so
 * the cron sees post-deploy JSON edits without a redeploy.
 *
 * Returns `[]` if the file is missing, unreadable, malformed, or has no
 * entries in the window — same "don't blow up the cron" posture as the
 * milestone helper above.
 */
export function getRecentAnalyses(now: Date): RecapAnalysis[] {
  if (!(now instanceof Date) || isNaN(now.getTime())) return [];
  const cutoff = now.getTime() - SEVEN_DAYS_MS;
  const upper = now.getTime();
  const filePath = path.join(process.cwd(), "public", "data", "analyses.json");
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const rows: Array<RecapAnalysis & { ts: number }> = [];
  for (const a of parsed) {
    if (!a || typeof a !== "object") continue;
    const obj = a as Record<string, unknown>;
    if (typeof obj.slug !== "string") continue;
    if (typeof obj.title !== "string") continue;
    if (typeof obj.kicker !== "string") continue;
    if (typeof obj.publishedAt !== "string") continue;
    const ts = Date.parse(obj.publishedAt);
    if (!Number.isFinite(ts)) continue;
    if (ts < cutoff || ts > upper) continue;
    const confidence =
      obj.confidence === "verified" || obj.confidence === "medium" || obj.confidence === "speculative"
        ? obj.confidence
        : "medium";
    rows.push({
      ts,
      slug: obj.slug,
      title: obj.title,
      kicker: obj.kicker,
      publishedAt: obj.publishedAt,
      confidence,
    });
  }
  return rows
    .sort((a, b) => b.ts - a.ts)
    .map(({ ts: _ts, ...row }) => row);
}

/**
 * Open milestones (`done === false`) whose parseable date falls within
 * `[now, now + horizonDays]`. Sorted soonest-first. `horizonDays` defaults
 * to 14 to match the email's "Coming up · next 14 days" section.
 *
 * Quarter/half/year-precision dates (e.g. "2026-Q3") are pinned to mid-
 * period by `parseMilestoneDate` — so a "2026-Q3" milestone surfaces in
 * the recap when "now" is within 14 days of Aug 15, which is exactly the
 * cadence we want.
 */
export function getUpcomingCatalysts(
  now: Date,
  factories: Factory[],
  horizonDays = 14,
): RecapUpcoming[] {
  if (!(now instanceof Date) || isNaN(now.getTime())) return [];
  if (!Array.isArray(factories)) return [];
  if (typeof horizonDays !== "number" || !Number.isFinite(horizonDays) || horizonDays < 0) {
    horizonDays = 14;
  }
  const lower = now.getTime();
  const upper = lower + horizonDays * DAY_MS;
  const rows: RecapUpcoming[] = [];
  for (const f of factories) {
    if (!f || typeof f !== "object") continue;
    for (const m of safeMilestones(f)) {
      if (!m || m.done !== false) continue;
      if (typeof m.date !== "string") continue;
      const ts = parseMilestoneDate(m.date);
      if (ts === null) continue;
      if (ts < lower || ts > upper) continue;
      rows.push({
        date: m.date,
        text: m.text,
        siteSlug: f.slug,
        siteName: f.name,
        company: f.company,
        sourceUrl: m.sourceUrl,
        daysAway: Math.round((ts - lower) / DAY_MS),
      });
    }
  }
  return rows.sort((a, b) => a.daysAway - b.daysAway);
}

/**
 * Type-guard helpers — exported so tests can assert that the returned
 * arrays match the declared shape at runtime (TS only catches compile-time
 * mismatches; a JSON edit that drops a required field would still pass
 * type-check on the helper signature but fail at runtime in the email
 * template).
 */
export function isRecapMilestone(x: unknown): x is RecapMilestone {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.date === "string" &&
    typeof r.text === "string" &&
    typeof r.siteSlug === "string" &&
    typeof r.siteName === "string" &&
    typeof r.company === "string"
  );
}

export function isRecapAnalysis(x: unknown): x is RecapAnalysis {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.slug === "string" &&
    typeof r.title === "string" &&
    typeof r.kicker === "string" &&
    typeof r.publishedAt === "string" &&
    (r.confidence === "verified" || r.confidence === "medium" || r.confidence === "speculative")
  );
}

export function isRecapUpcoming(x: unknown): x is RecapUpcoming {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    typeof r.date === "string" &&
    typeof r.text === "string" &&
    typeof r.siteSlug === "string" &&
    typeof r.siteName === "string" &&
    typeof r.company === "string" &&
    typeof r.daysAway === "number"
  );
}
