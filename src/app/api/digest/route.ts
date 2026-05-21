import { NextResponse } from "next/server";
import { factories } from "@/data/factories";
import { TICKERS, featuredTickers } from "@/data/tickers";

export const revalidate = 1800;

type DigestPayload = {
  date: string;
  upcomingCatalysts: Array<{ symbol: string; date: string; label: string; confidence?: string }>;
  upcomingMilestones: Array<{ site: string; date: string; text: string; confidence?: string }>;
  freshNews: Array<{ symbol: string; title: string; link: string; pubDate: string }>;
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

async function fetchYahooRss(symbol: string): Promise<Array<{ title: string; link: string; pubDate: string }>> {
  try {
    const res = await fetch(
      `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
      { next: { revalidate: 1800 }, headers: { "User-Agent": "GIGASCOPE-Digest/1.0" } },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const items: Array<{ title: string; link: string; pubDate: string }> = [];
    const blocks = xml.split(/<item>/i).slice(1);
    for (const block of blocks.slice(0, 3)) {
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
      const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      if (title && link) {
        items.push({
          title,
          link,
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET() {
  const now = Date.now();
  const fortnight = 14 * 86400_000;

  const upcomingCatalysts: DigestPayload["upcomingCatalysts"] = [];
  for (const t of TICKERS) {
    for (const c of t.catalysts ?? []) {
      const k = dateSort(c.date);
      if (k <= 0) continue;
      if (k < now) continue;
      if (k - now > 180 * 86400_000) continue; // 6mo window
      upcomingCatalysts.push({ symbol: t.symbol, date: c.date, label: c.label, confidence: c.confidence });
    }
  }
  upcomingCatalysts.sort((a, b) => dateSort(a.date) - dateSort(b.date));

  const upcomingMilestones: DigestPayload["upcomingMilestones"] = [];
  for (const f of factories) {
    for (const m of f.milestones ?? []) {
      if (m.done) continue;
      const k = dateSort(m.date);
      if (k <= 0 || k < now || k - now > 60 * 86400_000) continue; // 2mo window
      upcomingMilestones.push({ site: f.name, date: m.date, text: m.text, confidence: m.confidence });
    }
  }
  upcomingMilestones.sort((a, b) => dateSort(a.date) - dateSort(b.date));

  // News: featured tickers, fresh news in last 24h
  const featured = featuredTickers().slice(0, 8);
  const newsResults = await Promise.all(featured.map((t) => fetchYahooRss(t.yahooSymbol).then((items) => items.map((it) => ({ ...it, symbol: t.symbol })))));
  const freshNews = newsResults
    .flat()
    .filter((it) => now - +new Date(it.pubDate) < 86400_000)
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate))
    .slice(0, 12);

  const payload: DigestPayload = {
    date: new Date().toISOString().slice(0, 10),
    upcomingCatalysts: upcomingCatalysts.slice(0, 15),
    upcomingMilestones: upcomingMilestones.slice(0, 10),
    freshNews,
    generatedAt: new Date().toISOString(),
  };

  // void fortnight ref to silence the lint warning if window unused
  void fortnight;

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
