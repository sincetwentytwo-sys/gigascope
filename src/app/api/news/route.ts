import { NextResponse } from "next/server";

export const revalidate = 600;

type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string; // ISO
};

/**
 * Yahoo Finance has a per-symbol RSS feed at
 *   https://feeds.finance.yahoo.com/rss/2.0/headline?s=TSLA&region=US&lang=en-US
 * Multi-symbol works with comma separation.
 */
async function fetchYahooRss(symbol: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
      {
        next: { revalidate: 600 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GIGASCOPE/1.0)" },
      },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const items: NewsItem[] = [];
    const itemBlocks = xml.split(/<item>/i).slice(1);
    for (const block of itemBlocks.slice(0, 20)) {
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim();
      const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim();
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim();
      const src = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1]?.trim();
      if (title && link) {
        items.push({
          title,
          link,
          source: src ?? "Yahoo Finance",
          pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get("symbol") ?? "").toUpperCase().replace(/-/g, ".");
  if (!symbol) {
    return NextResponse.json({ items: [] });
  }
  const items = await fetchYahooRss(symbol);
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" } },
  );
}
