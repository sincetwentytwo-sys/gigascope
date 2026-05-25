// X (Twitter) launch queue — Week 1.
//
// 7-day drip of seed posts for @gigascopehq. Each entry is a ready-to-post
// draft: copy goes into the X compose box verbatim. Media is either a local
// file the owner uploads from disk, or a screenshot they capture day-of.
//
// Source: G:/jb/x-launch-kit/README-week-1.md (handwritten 2026-05-25).
// Kept inline (not file-read) because Vercel runtime can't reach G:/jb.
//
// Owner workflow per day:
//   1. Receive Telegram ping at 18:00 KST (cron in /api/cron/x-post-reminder)
//   2. Long-press → Copy the `text` block
//   3. Grab media from `mediaHint` (G:/jb path on PC, OR capture screenshot)
//   4. Paste into X app, attach media, hit Send
//
// Week 2+ generator NOT built yet (per owner: validate Week 1 first).

export interface XPostDraft {
  day: number; // 1..7
  theme: string;
  text: string;
  mediaHint: string; // human-readable description of what to attach
  // Reply tactic / why this post / what to watch for. Sent as second telegram
  // message to keep the main draft easy to copy without commentary noise.
  notes?: string;
}

export const X_QUEUE_WEEK_1: XPostDraft[] = [
  {
    day: 1,
    theme: "Giga Texas: dirt → megafactory (HOOK)",
    text: `Tesla Giga Texas: 2020 → 2026.

Dirt to the world's largest auto plant in 6 years.

33 Sentinel-2 satellite frames, traced by hand.

gigascope.xyz/site/giga-texas`,
    mediaHint: "G:/jb/x-launch-kit/01-giga-texas-2020-2026.mp4 (1.9MB, X auto-loops) OR .gif (5.2MB)",
    notes: "Reply tactic: @SawyerMerritt, @WholeMarsBlog — link only, no @-tag spam. Watch first-hour likes/RT as Day 1 signal.",
  },
  {
    day: 2,
    theme: "Starbase: sand → Mechazilla (5y)",
    text: `SpaceX Starbase: sand to Starship pad in 5 years.

26 Sentinel-2 frames, 2019 → 2026.
OLM tower, Mechazilla, the orbital ring — all built on what was mudflats.

gigascope.xyz/site/starbase`,
    mediaHint: "G:/jb/x-launch-kit/02-starbase-2019-2026.mp4",
    notes: "SpaceX audience > Tesla audience for satellite content. Day 2 might outperform Day 1.",
  },
  {
    day: 3,
    theme: "Cross-empire: 16 sites in one place",
    text: `Nobody tracks the full Musk empire from orbit.

I built one — 16 sites across Tesla / SpaceX / xAI / Neuralink / Boring, all on a single satellite feed.

Free daily digest: gigascope.xyz`,
    mediaHint: "Screenshot gigascope.xyz home (16 site cards visible). Capture day-of so it's fresh.",
    notes: "First conversion-pitch post. Watch digest signups in next 24h.",
  },
  {
    day: 4,
    theme: "Methodology drop (trust building)",
    text: `Why "we capture weekly" was a lie I had to fix.

Real cadence: Sentinel-2 EOX annual + ESRI 3-6mo refresh = ~2 months/site.

Honest methodology > marketing claims.

gigascope.xyz/methodology`,
    mediaHint: "Screenshot gigascope.xyz/methodology (cadence table + traced polygon section).",
    notes: "Raw honesty post. NASASpaceflight forum tone. Differentiates from marketing-noisy alt-data sites.",
  },
  {
    day: 5,
    theme: "Colossus inside-vs-outside",
    text: `xAI Colossus, Memphis: 200K NVIDIA GB200 GPUs going in.

The outside changed barely. The change is *inside* — 200MW rack install, chiller plumbing, gas turbines.

Tracked the externally-visible parts here:
gigascope.xyz/site/colossus`,
    mediaHint: "Screenshot gigascope.xyz/site/colossus (site card or before/after thumb).",
    notes: "Acknowledges limitation honestly — that limitation IS the trust signal.",
  },
  {
    day: 6,
    theme: "Permit alerts wedge teaser",
    text: `Idea I'm testing: when Tesla files a Giga Texas building permit at Travis County, I get an alert in <24hr.

Currently owner-only. If it works for a month, charter subscribers get it too.

Free signups already include the daily digest:
gigascope.xyz/pro`,
    mediaHint: "Text-only, OR screenshot of Travis County permit listing.",
    notes: "Reveals the unique wedge. Public announcement = traction signal + locks in charter narrative.",
  },
  {
    day: 7,
    theme: "Week recap",
    text: `Week 1 of public posting:

▢ Giga Texas timelapse
▢ Starbase timelapse
▢ 16 cross-empire sites
▢ Methodology
▢ Colossus inside-vs-outside
▢ Permit alerts wedge

If you want this in your inbox every morning:
gigascope.xyz`,
    mediaHint: "Day 1 + Day 2 GIF combo, OR 16-site grid screenshot from home.",
    notes: "Week-1 retro. After this, decide: Week 2 continues (≥30 free signups) or pivot.",
  },
];

/**
 * Compute which day's draft to send given a UTC midnight start date and a
 * UTC midnight today. Day 1 = the start date itself. Returns null if before
 * launch or after Week 1 ends (>7).
 */
export function dayForToday(startUtcMid: number, todayUtcMid: number): number | null {
  const DAY_MS = 86400_000;
  const diff = Math.round((todayUtcMid - startUtcMid) / DAY_MS);
  const day = diff + 1;
  if (day < 1 || day > X_QUEUE_WEEK_1.length) return null;
  return day;
}

export function getDraft(day: number): XPostDraft | null {
  return X_QUEUE_WEEK_1.find((d) => d.day === day) ?? null;
}
