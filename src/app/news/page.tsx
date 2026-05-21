import type { Metadata } from "next";
import { featuredTickers, TICKERS } from "@/data/tickers";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "News — Multi-sector intelligence feed — GIGASCOPE",
  description:
    "Live news aggregated across the Musk Empire + Semis & AI + Quantum + Defense + Materials universe.",
};

type Item = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  symbol: string;
};

async function fetchFeed(symbol: string): Promise<Item[]> {
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
    const items: Item[] = [];
    const blocks = xml.split(/<item>/i).slice(1);
    for (const block of blocks.slice(0, 8)) {
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
          symbol,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default async function NewsPage() {
  // Fetch featured + top 8 by mktcap to keep request count reasonable
  const featured = featuredTickers();
  const symbols = Array.from(new Set([
    ...featured.map((t) => t.yahooSymbol),
    ...TICKERS.filter((t) => !t.featured).sort((a, b) => (b.marketCapB ?? 0) - (a.marketCapB ?? 0)).slice(0, 5).map((t) => t.yahooSymbol),
  ]));

  const results = await Promise.all(symbols.map((s) => fetchFeed(s)));
  const all = results.flat()
    .sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate))
    .slice(0, 60);

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">News</h1>
        <p className="text-dim">
          Aggregated across the GIGASCOPE universe. Latest on top. Click any headline for the full story at the source.
        </p>
      </header>

      {all.length === 0 ? (
        <div className="text-dim text-sm">News feed is temporarily unavailable. Refresh in a few minutes.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {all.map((it, i) => (
            <li key={i} className="p-3 rounded border border-border-custom hover:border-text transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`/ticker/${it.symbol.toLowerCase().replace(/\./g, "-")}`}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-custom hover:border-text"
                >
                  {it.symbol}
                </a>
                <span className="text-[11px] text-dim">{it.source} · {timeAgo(it.pubDate)} ago</span>
              </div>
              <a href={it.link} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="text-sm group-hover:underline">{it.title}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
