import type { NewsItem } from "@/data/types";

const FEEDS = [
  { source: "Electrek", url: "https://electrek.co/guides/tesla/feed/" },
  { source: "Teslarati", url: "https://www.teslarati.com/feed/" },
];

const KEYWORDS = [
  "factory", "gigafactory", "giga", "terafab", "fremont",
  "shanghai", "berlin", "nevada", "mexico", "buffalo",
  "construction", "expansion", "production",
];

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseRSS(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const title = decodeEntities(rawTitle);
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    const lower = title.toLowerCase();
    if (title && link && KEYWORDS.some((k) => lower.includes(k))) {
      items.push({
        title,
        link,
        date: pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        source,
      });
    }
    if (items.length >= 5) break;
  }

  return items;
}

async function fetchNews(): Promise<NewsItem[]> {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseRSS(xml, feed.source);
      })
    );

    return results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export default async function NewsFeed() {
  const items = await fetchNews();

  if (items.length === 0) {
    return (
      <p className="font-mono text-[9px] text-dim">
        No factory news available. See{" "}
        <a href="https://electrek.co/guides/tesla/" target="_blank" rel="noopener noreferrer" className="underline">Electrek</a>
        {" "}or{" "}
        <a href="https://www.teslarati.com" target="_blank" rel="noopener noreferrer" className="underline">Teslarati</a>.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-baseline gap-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2"
        >
          <span className="font-mono text-[9px] text-dim shrink-0 w-14">{item.date}</span>
          <span className="text-xs text-dim hover:text-text transition-colors leading-snug flex-1">{item.title}</span>
          <span className="font-mono text-[8px] text-dim/40 shrink-0">{item.source}</span>
        </a>
      ))}
    </div>
  );
}
