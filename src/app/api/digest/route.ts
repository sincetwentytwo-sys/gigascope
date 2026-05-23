import { NextResponse } from "next/server";
import { factories } from "@/data/factories";
import type { Company } from "@/data/types";

export const revalidate = 1800;

type DigestPayload = {
  date: string;
  upcomingMilestones: Array<{
    siteSlug: string;
    site: string;
    company: Company;
    date: string;
    text: string;
    confidence?: string;
  }>;
  freshNews: Array<{ source: string; title: string; link: string; pubDate: string }>;
  generatedAt: string;
};

function dateSort(s: string): number {
  const m = s.match(/^(\d{4})(?:-(?:Q([1-4])|([1-2])H|(\d{1,2})(?:-(\d{1,2}))?))?/);
  if (!m) return 0;
  const year = parseInt(m[1], 10);
  let month = 1;
  if (m[2]) month = (parseInt(m[2], 10) - 1) * 3 + 2;
  else if (m[3]) month = parseInt(m[3], 10) === 1 ? 3 : 9;
  else if (m[4]) month = parseInt(m[4], 10);
  const day = m[5] ? parseInt(m[5], 10) : 15;
  return Date.UTC(year, month - 1, day);
}

// Pull fresh news from the existing /api/news RSS pipeline which is already
// scoped to Musk-only sources. We mirror the same per-symbol fetch shape so
// no duplicated RSS-parsing logic lives here.
//
// Each Musk company is mapped to its primary public ticker (or skipped for
// privates). For privates with no ticker we surface their parent/operator's
// news where overlap is high (Boring Co → news under "BORING"-keyed RSS won't
// resolve; for those we skip and rely on Tesla/SpaceX dominating the digest).
const NEWS_SOURCES: Array<{ symbol: string; label: string }> = [
  { symbol: "TSLA", label: "Tesla" },
  { symbol: "SPACEX", label: "SpaceX" }, // Yahoo will return empty; harmless
];

async function fetchNewsForSymbol(
  origin: string,
  symbol: string,
  label: string,
): Promise<Array<{ source: string; title: string; link: string; pubDate: string }>> {
  try {
    const res = await fetch(`${origin}/api/news?symbol=${encodeURIComponent(symbol)}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: Array<{ title: string; link: string; pubDate: string }> };
    const items = json.items ?? [];
    return items.slice(0, 6).map((it) => ({
      source: label,
      title: it.title,
      link: it.link,
      pubDate: it.pubDate,
    }));
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const now = Date.now();
  const origin = new URL(req.url).origin;

  // Upcoming milestones: next 7 days for the email digest. The full /calendar
  // page renders a wider window — the digest is intentionally short so it
  // surfaces "what should I look at this week" not "what's on the roadmap".
  const SEVEN_DAYS_MS = 7 * 86400_000;
  const upcomingMilestones: DigestPayload["upcomingMilestones"] = [];
  for (const f of factories) {
    for (const m of f.milestones ?? []) {
      if (m.done) continue;
      const k = dateSort(m.date);
      if (k <= 0 || k < now || k - now > SEVEN_DAYS_MS) continue;
      upcomingMilestones.push({
        siteSlug: f.slug,
        site: f.name,
        company: f.company,
        date: m.date,
        text: m.text,
        confidence: m.confidence,
      });
    }
  }
  // If the 7-day window is empty (common — most ISO-dated milestones cluster
  // around launches/openings), widen to 30 days so the digest is never empty.
  // Keep the union sorted and capped at 10 to fit the email layout.
  if (upcomingMilestones.length === 0) {
    const THIRTY_DAYS_MS = 30 * 86400_000;
    for (const f of factories) {
      for (const m of f.milestones ?? []) {
        if (m.done) continue;
        const k = dateSort(m.date);
        if (k <= 0 || k < now || k - now > THIRTY_DAYS_MS) continue;
        upcomingMilestones.push({
          siteSlug: f.slug,
          site: f.name,
          company: f.company,
          date: m.date,
          text: m.text,
          confidence: m.confidence,
        });
      }
    }
  }
  upcomingMilestones.sort((a, b) => dateSort(a.date) - dateSort(b.date));

  // Fresh news: pull the last-24h headlines via /api/news for each Musk
  // public ticker. Privates (SpaceX, xAI, Neuralink, Boring) don't resolve
  // on Yahoo RSS but the cost of asking is trivial and the empty result is
  // filtered out below.
  const newsResults = await Promise.all(
    NEWS_SOURCES.map((s) => fetchNewsForSymbol(origin, s.symbol, s.label)),
  );
  const freshNews = newsResults
    .flat()
    .filter((it) => now - +new Date(it.pubDate) < 86400_000)
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate))
    .slice(0, 12);

  const payload: DigestPayload = {
    date: new Date().toISOString().slice(0, 10),
    upcomingMilestones: upcomingMilestones.slice(0, 10),
    freshNews,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
