import type { NewsItem } from "@/data/types";

const FEEDS = [
  { source: "Electrek", url: "https://electrek.co/guides/tesla/feed/" },
  { source: "Teslarati", url: "https://www.teslarati.com/feed/" },
  { source: "InsideEVs", url: "https://insideevs.com/tag/tesla/feed/" },
  { source: "CleanTechnica", url: "https://cleantechnica.com/tag/tesla/feed/" },
  { source: "TechCrunch", url: "https://techcrunch.com/tag/tesla/feed/" },
  { source: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=tech&post_type=best" },
  { source: "The Verge", url: "https://www.theverge.com/rss/tesla/index.xml" },
];

const GLOBAL_KEYWORDS = [
  "tesla", "factory", "gigafactory", "giga", "terafab", "fremont",
  "shanghai", "berlin", "nevada", "mexico", "buffalo",
  "construction", "expansion", "production", "cybertruck", "cybercab",
  "model y", "model 3", "semi", "megapack", "solar roof", "supercharger",
  "4680", "battery", "fsd", "autopilot", "robotaxi", "optimus",
  "earnings", "delivery", "elon musk",
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

    if (title && link) {
      items.push({
        title,
        link,
        date: pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        source,
      });
    }
  }

  return items;
}

async function fetchAllNews(): Promise<NewsItem[]> {
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
      .flatMap((r) => r.value);
  } catch {
    return [];
  }
}

function filterNews(items: NewsItem[], keywords: string[], limit: number): NewsItem[] {
  return items
    .filter((item) => {
      const lower = item.title.toLowerCase();
      return keywords.some((k) => lower.includes(k));
    })
    .slice(0, limit);
}

function NewsItems({ items }: { items: NewsItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-baseline gap-3 py-2.5 border-b border-border-custom last:border-0 hover:bg-surface -mx-2 px-2 rounded"
        >
          <span className="font-mono text-[9px] text-dim shrink-0 w-14">{item.date}</span>
          <span className="text-xs text-dim hover:text-text transition-colors leading-snug flex-1">{item.title}</span>
          <span className="font-mono text-[8px] text-dim/40 shrink-0">{item.source}</span>
        </a>
      ))}
    </div>
  );
}

// Home page: global factory news
export default async function NewsFeed() {
  const allItems = await fetchAllNews();
  const items = filterNews(allItems, GLOBAL_KEYWORDS, 15);

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

  return <NewsItems items={items} />;
}

// Factory-specific news (falls back to general Tesla news)
export async function FactoryNewsFeed({ keywords }: { keywords: string[] }) {
  const allItems = await fetchAllNews();
  let items = filterNews(allItems, keywords, 5);

  if (items.length === 0) {
    // Fallback: show general Tesla factory news
    items = filterNews(allItems, GLOBAL_KEYWORDS, 5);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-dim">
        No recent news available.
      </p>
    );
  }

  return <NewsItems items={items} />;
}
