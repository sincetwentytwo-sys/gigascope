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
//   1. Receive email at 18:00 KST (cron in /api/cron/x-post-reminder)
//   2. Post `text` to X (no link in body — algo penalty is real)
//   3. Reply to own tweet with `replyText` (link lives here)
//   4. Attach media file (Days 1-2 pre-prepared, Days 3-7 screenshot day-of)
//
// Week 2+ generator NOT built yet (per owner: validate Week 1 first).

export interface XPostDraft {
  day: number; // 1..7
  theme: string;
  // Main tweet body — no external link (X algo penalizes link-bearing posts
  // by ~30-50%, especially for accounts with low engagement history).
  text: string;
  // First-reply to the main tweet — link lives here. X's algorithm doesn't
  // penalize links in replies the same way it penalizes them in the parent
  // post, so we keep main reach high and route conversion via the reply.
  replyText: string;
  mediaHint: string; // human-readable description of what to attach
  // Public URL of the media file to attach (mp4/gif/png). Owner taps the
  // download button in the email → file lands in their gallery → swap to
  // X app → attach from gallery. Undefined for Days 3-7 where media is
  // owner-captured screenshots taken day-of.
  mediaUrl?: string;
  // Public URL of a still-frame thumbnail. Rendered inline in the email so
  // owner sees what they'll be attaching before downloading the full file.
  // jpg only — modern mail clients render inline JPG reliably; video tags
  // are stripped in most.
  previewImageUrl?: string;
  // Reply tactic / why this post / what to watch for. Sent as the meta block
  // in the email so the main copy blocks stay clean.
  notes?: string;
  // Reddit draft — same theme, different sub/audience/tone. Reddit allows
  // longer body + link in post text, but enforces sub-specific rules (e.g.
  // r/dataisbeautiful requires [OC], r/SpaceX has 9:1 self-promo ratio).
  // Title and body should NOT mirror the X copy — Reddit punishes "shilling"
  // tone. Subreddits listed primary-first; owner picks based on Day 1 signal.
  reddit?: {
    subreddits: string[];
    title: string;
    body: string;
    notes?: string;
  };
}

// Absolute base used in the email/telegram templates. Public URLs must be
// absolute because mail clients strip relative paths.
const BASE = "https://gigascope.xyz";

export const X_QUEUE_WEEK_1: XPostDraft[] = [
  {
    day: 1,
    theme: "Giga Texas: dirt → megafactory (HOOK)",
    // 2026-05-26 fix: previous "2020 → 2026" mismatched the mp4 first frame
    // (2018-08-15). Video starts at 2018 baseline (pre-Tesla farmland), Tesla
    // broke ground Aug 2020. New copy lists both: 2018 = video span, "the 6
    // years Tesla broke ground" = 2020-2026 build period. Both true.
    text: `Tesla Giga Texas, 2018 → 2026.

Bare farmland to megafactory in the 6 years Tesla broke ground.

33 Sentinel-2 satellite frames, traced by hand.`,
    replyText: `Full breakdown of how this was traced:
gigascope.xyz/site/giga-texas`,
    mediaHint: "Giga Texas 6-year timelapse (1.9MB mp4 — X auto-loops)",
    mediaUrl: `${BASE}/timelapses/giga-texas.mp4`,
    previewImageUrl: `${BASE}/timelapses/giga-texas-first.jpg`,
    notes: "Reply tactic: @SawyerMerritt, @WholeMarsBlog — link only, no @-tag spam. Watch first-hour likes/RT as Day 1 signal.",
    reddit: {
      subreddits: ["r/MapPorn", "r/dataisbeautiful (needs [OC] tag, no native video — use a frame composite)"],
      title: `[OC] Tesla Giga Texas, 2018 → 2026: Sentinel-2 satellite timelapse`,
      body: `Frames pulled from Sentinel-2 L2A (10m resolution), composited to highlight build progression over the 6 years Tesla broke ground.`,
      notes: "Already posted 2026-05-26 — ~1.4K views, 4 comments in 1h. Reference template for future site timelapses.",
    },
  },
  {
    day: 2,
    theme: "Starbase: sand → Mechazilla (5y)",
    text: `SpaceX Starbase: sand to Starship pad in 5 years.

26 Sentinel-2 frames, 2019 → 2026.
OLM tower, Mechazilla, the orbital ring — all built on what was mudflats.`,
    replyText: `Tracked here:
gigascope.xyz/site/starbase`,
    mediaHint: "Starbase 5-year timelapse (1.7MB mp4)",
    mediaUrl: `${BASE}/timelapses/starbase.mp4`,
    previewImageUrl: `${BASE}/timelapses/starbase-first.jpg`,
    notes: "SpaceX audience > Tesla audience for satellite content. Day 2 might outperform Day 1.",
    reddit: {
      subreddits: ["r/SpaceXLounge", "r/space", "r/MapPorn"],
      title: `SpaceX Starbase from mudflats to Starship pad, 2019 → 2026 (Sentinel-2 satellite timelapse)`,
      body: `Stitched from Sentinel-2 L2A captures over five years. The OLM tower, Mechazilla catch arms, orbital ring, and tank farm are all built on what was tidal mudflats in 2019. Frame cadence: roughly every 2 months per site once cloud-cover is filtered. Sentinel-2's theoretical 5-day revisit doesn't really survive contact with weather, especially on the gulf coast.`,
      notes: "r/SpaceXLounge is less strict than r/SpaceX (9:1 rule). Avoid r/SpaceX on cold-start account. r/space accepts space-related satellite content broadly. Don't link gigascope in body — wait for 'where can I see more?' style comment.",
    },
  },
  {
    day: 3,
    theme: "Cross-empire: 16 sites in one place",
    text: `Nobody tracks the full Musk empire from orbit.

I built one — 16 sites across Tesla / SpaceX / xAI / Neuralink / Boring, all on a single satellite feed.`,
    replyText: `Free daily digest 👇
gigascope.xyz`,
    mediaHint: "Screenshot gigascope.xyz home (16 site cards visible). Capture day-of so it's fresh.",
    notes: "First conversion-pitch post. Watch digest signups in next 24h.",
    reddit: {
      subreddits: ["r/elonmusk", "r/teslainvestorsclub", "r/Tesla (cross-empire angle may be flagged off-topic)"],
      title: `Built a site that tracks every Musk-empire facility from satellite — 16 sites, Tesla + SpaceX + xAI + Neuralink + Boring`,
      body: `Was checking five different forums and three websites to keep up with Tesla factory builds, Starbase progress, xAI Colossus expansion, etc. So I put it all in one place. Currently covers: 8 Tesla facilities (Giga Texas / Nevada / Berlin / Shanghai / Mexico, Fremont, Buffalo, Terafab), Starbase + 3 SpaceX launch sites, xAI Colossus, Neuralink HQ, Boring Co test track. Sentinel-2 + ESRI imagery side-by-side, milestone log sourced from FAA filings, county permits, SEC docs. Open source codebase.`,
      notes: "Most natural sub: r/elonmusk (cross-empire content OK). r/Tesla and r/SpaceX have off-topic risk for non-single-company content. r/teslainvestorsclub welcomes original research. Don't put link in body — comment when asked or include in screenshot.",
    },
  },
  {
    day: 4,
    theme: "Methodology drop (trust building)",
    text: `Why "we capture weekly" was a lie I had to fix.

Real cadence: Sentinel-2 EOX annual + ESRI 3-6mo refresh = ~2 months/site.

Honest methodology > marketing claims.`,
    replyText: `Full breakdown:
gigascope.xyz/methodology`,
    mediaHint: "Screenshot gigascope.xyz/methodology (cadence table + traced polygon section).",
    notes: "Raw honesty post. NASASpaceflight forum tone. Differentiates from marketing-noisy alt-data sites.",
    reddit: {
      subreddits: ["r/RemoteSensing", "r/gis", "r/dataisbeautiful (needs [OC] + chart visual)"],
      title: `Real Sentinel-2 refresh cadence in practice (after filtering clouds): ~2 months per site, not the 5-day theoretical revisit`,
      body: `Was building a public satellite tracker for industrial sites and had to write this down because users kept asking "why isn't the imagery from yesterday?" Theoretical Sentinel-2 revisit is 5 days at the equator (2A + 2B combined). In practice, for mid-latitude sites with typical cloud cover, usable clear frames land closer to every 2-3 months per site. ESRI World Imagery refreshes every 3-6 months on top of that. Aggregate effective refresh is ~2 months. Sharing the math because the gap between theoretical capture cadence and "when can I actually see something new" trips a lot of people up.`,
      notes: "r/RemoteSensing + r/gis are real expert subs — honesty post fits perfectly, no marketing tone. r/dataisbeautiful needs [OC] tag + a chart visual (could screenshot the cadence table from /methodology).",
    },
  },
  {
    day: 5,
    theme: "Colossus inside-vs-outside",
    text: `xAI Colossus, Memphis: 200K NVIDIA GB200 GPUs going in.

The outside changed barely. The real change is *inside* — 200MW rack install, chiller plumbing, gas turbines.`,
    replyText: `Tracking the externally-visible parts:
gigascope.xyz/site/colossus`,
    mediaHint: "Screenshot gigascope.xyz/site/colossus (site card or before/after thumb).",
    notes: "Acknowledges limitation honestly — that limitation IS the trust signal.",
    reddit: {
      subreddits: ["r/datacenters", "r/nvidia", "r/MachineLearning (strict — only if methodology angle)"],
      title: `Tracking xAI Colossus from satellite — 200K NVIDIA GB200 GPUs going in, but the outside barely changes`,
      body: `Following the Colossus expansion in Memphis from satellite imagery. The interesting thing is what satellite tracking CAN'T show for AI data centers: the building shell, parking lot, and cooling infrastructure are visible from orbit, but the actual GPU/rack install happens inside. So you see almost no exterior change frame-to-frame even when massive compute capacity is coming online. What IS visible from satellite: the power additions (substations, transformers), the gas turbine generators they trucked in, the chiller plumbing tie-ins. Public xAI statements claim 200K GB200 GPUs at full scale.`,
      notes: "r/datacenters is the friendliest sub for infra-tracking. r/nvidia welcomes GB200 angle. r/MachineLearning is strict (real research) — skip unless adding training/inference angle.",
    },
  },
  {
    day: 6,
    theme: "Permit alerts wedge teaser",
    text: `Idea I'm testing: when Tesla files a Giga Texas building permit at Travis County, I get an alert in <24hr.

Currently owner-only. If it works for a month, charter subscribers get it too.`,
    replyText: `Free signup includes the daily digest:
gigascope.xyz/pro`,
    mediaHint: "Text-only, OR screenshot of Travis County permit listing.",
    notes: "Reveals the unique wedge. Public announcement = traction signal + locks in charter narrative.",
    reddit: {
      subreddits: ["r/teslainvestorsclub", "r/teslamotors", "r/RealTesla (more skeptical audience — could go either way)"],
      title: `Built an alert pipeline for Travis County building permits tagged to the Giga Texas site — sub-24h notifications`,
      body: `Set up a watcher on Travis County's permit-filing database for anything tagged to the Giga Texas address. Catches new shell permits, foundation permits, electrical service permits filed by Tesla or their GCs within ~24h of submission. The permits often reveal what's coming before any public announcement (e.g. specific cell-production line expansions, new fab buildings). Currently running for my own info to see if the signal is consistently useful. If it holds up over a month I'll open it to people tracking the build.`,
      notes: "r/teslainvestorsclub will appreciate the alpha-finding angle most. r/teslamotors is broader Tesla audience but stricter on self-promo. Avoid 'sign up' language — frame it as data sharing.",
    },
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
▢ Permit alerts wedge`,
    replyText: `If you want this in your inbox every morning:
gigascope.xyz`,
    mediaHint: "Day 1 + Day 2 GIF combo, OR 16-site grid screenshot from home.",
    notes: "Week-1 retro. After this, decide: Week 2 continues (≥30 free signups) or pivot.",
    reddit: {
      subreddits: ["r/teslamotors", "r/teslainvestorsclub"],
      title: `Update — 2 months since I shared gigascope.xyz tracking Tesla factories, here's what's been added`,
      body: `Followup to the post 2 months ago. Since then: Sentinel-2 + ESRI satellite timelapses for Giga Texas (6yr) and Starbase (5yr), new site pages for Colossus / Mexico / Terafab, a methodology page laying out the real Sentinel-2 cadence, Travis County permit alerts (currently owner-only test), and component breakdowns for 4680 / Optimus / Cybertruck / Cybercab / Raptor / Starship. Codebase is open if anyone wants to contribute polygon work or extend coverage.`,
      notes: "Follow-up framing to the 17K-view r/teslamotors post from 2 months ago. Natural update tone, not a fresh promo. Good moment to drop link in body since it's referencing prior post.",
    },
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
