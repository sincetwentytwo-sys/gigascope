import type { Metadata } from "next";
import { Redis } from "@upstash/redis";
import RoadmapVote from "@/components/RoadmapVote";

// Static-generate with 60s ISR — totals refresh on the next request
// after the window expires, so the leaderboard reflects new votes
// within ~1 minute without paying SSR cost on every visit.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Roadmap — vote on what we build next | GIGASCOPE",
  description:
    "Charter features in development. Vote on which unbuilt features matter most — satellite-drop alerts, CSV/JSON exports, polygon downloads, per-site RSS, company comparison, inference archive, permit watchlist. Most-voted ship first.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title: "What we build next — GIGASCOPE Roadmap",
    description:
      "Charter features in development. Vote on what matters. Most-voted ship first.",
    url: "https://gigascope.xyz/roadmap",
    type: "website",
  },
};

type Feature = {
  id: string;
  title: string;
  description: string;
};

// Hard-coded canonical list. The /api/roadmap/vote route mirrors the
// id allow-list. Keep both in sync.
const ROADMAP_FEATURES: readonly Feature[] = [
  {
    id: "satellite-drop-alerts",
    title: "Satellite-drop alerts",
    description:
      "Push a Telegram + email alert when a tracked site gets fresh imagery (Sentinel-2 ~weekly, ESRI quarterly).",
  },
  {
    id: "csv-json-exports",
    title: "CSV / JSON bulk exports",
    description:
      "Download every milestone, capture, and source as offline files for spreadsheet analysis.",
  },
  {
    id: "polygon-download",
    title: "Hand-traced polygon download",
    description:
      "Get the GeoJSON polygons for each site's built footprint (useful for GIS analysts).",
  },
  {
    id: "per-site-rss",
    title: "Per-site RSS feed",
    description:
      "Subscribe to milestones for one specific site (e.g. just Giga Texas, just Starbase).",
  },
  {
    id: "company-comparison",
    title: "Company comparison view",
    description:
      "Side-by-side dashboard: Tesla vs SpaceX vs xAI buildout velocity, capex, GPU count, etc.",
  },
  {
    id: "inference-archive",
    title: "Searchable analysis archive",
    description:
      "Tag-and-filter all permit/SEC/news inferences. Diff this week vs last week.",
  },
  {
    id: "permit-watchlist",
    title: "Custom permit watchlist",
    description:
      "Tell us your address or coords; we fire an alert when a permit lands on your watched parcel.",
  },
] as const;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  // `cache: "force-cache"` flips the SDK off its default `no-store`. That
  // matters here because Next 16 sees a no-store fetch and demotes the
  // whole route from Static to Dynamic, defeating the `revalidate = 60`
  // ISR we want for this page. Combined with the page-level `revalidate`
  // export, Next will rebuild the snapshot every 60s — fresh totals
  // without paying a SSR Redis hit on every visit.
  return new Redis({ url, token, cache: "force-cache" });
}

// Pull all counts in one pipelined round-trip — keeps the ISR build
// step cheap even as the feature list grows. Returns 0 for every key
// on Redis unavailable / failure so the page renders an empty-state.
async function fetchCounts(features: readonly Feature[]): Promise<Record<string, number>> {
  const r = getRedis();
  const empty: Record<string, number> = Object.fromEntries(features.map((f) => [f.id, 0]));
  if (!r) return empty;
  try {
    const pipeline = r.pipeline();
    for (const f of features) {
      pipeline.get(`roadmap:vote:${f.id}`);
    }
    const results = (await pipeline.exec()) as unknown[];
    const out: Record<string, number> = {};
    features.forEach((f, i) => {
      const raw = results[i];
      const n = typeof raw === "number" ? raw : Number(raw ?? 0);
      out[f.id] = Number.isFinite(n) && n >= 0 ? n : 0;
    });
    return out;
  } catch (e) {
    console.error("roadmap_counts_failed", e);
    return empty;
  }
}

export default async function RoadmapPage() {
  const counts = await fetchCounts(ROADMAP_FEATURES);

  // Sort descending by count. Stable ordering for ties via the original
  // list's index — features earlier in ROADMAP_FEATURES break ties.
  const ranked = ROADMAP_FEATURES.map((f, idx) => ({ ...f, count: counts[f.id] ?? 0, idx }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.idx - b.idx;
    });

  const totalVotes = ranked.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          What we build next
        </h1>
        <p className="text-dim text-lg leading-relaxed max-w-xl">
          Charter features in development. Vote on what matters. Most-voted ship first.
        </p>
        {totalVotes > 0 && (
          <p className="text-xs text-dim mt-3 font-mono">
            {totalVotes.toLocaleString("en-US")} {totalVotes === 1 ? "vote" : "votes"} cast
          </p>
        )}
      </header>

      <ul className="flex flex-col gap-3 mb-10">
        {ranked.map((f, rank) => (
          <li
            key={f.id}
            className="flex items-start gap-4 p-5 rounded border border-border-custom bg-surface"
          >
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-xs font-mono text-dim">#{rank + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold mb-1">{f.title}</h2>
              <p className="text-sm text-dim leading-relaxed">{f.description}</p>
            </div>
            <RoadmapVote id={f.id} initialCount={f.count} />
          </li>
        ))}
      </ul>

      {/* Charter weighting teaser — copy only, no logic yet. */}
      <section className="mb-6 p-4 rounded border border-border-custom bg-surface">
        <p className="text-xs text-dim leading-relaxed">
          Already a charter member? Your vote weighs 3×. Sign in via your latest email magic link.
        </p>
      </section>

      {/* Footer note — sets honest expectations: this is signal-
          gathering, not a binding contract. */}
      <p className="text-xs text-dim leading-relaxed max-w-prose">
        Votes are advisory. Owner builds based on signal + technical feasibility. Founding members may also vote via email reply to weekly recap.
      </p>
    </div>
  );
}
