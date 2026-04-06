import type { NewsItem } from "@/data/types";

// Tesla-dedicated sources (all articles are relevant, no keyword filter needed)
const TESLA_FEEDS = [
  { source: "Electrek", url: "https://electrek.co/guides/tesla/feed/" },
  { source: "Teslarati", url: "https://www.teslarati.com/feed/" },
  { source: "Not A Tesla App", url: "https://www.notateslaapp.com/feed/" },
];

// General sources (need keyword filter)
const GENERAL_FEEDS = [
  { source: "InsideEVs", url: "https://insideevs.com/feed/" },
  { source: "CleanTechnica", url: "https://cleantechnica.com/feed/" },
  { source: "TorqueNews", url: "https://www.torquenews.com/rss.xml" },
  { source: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147" },
];

const TESLA_KEYWORDS = [
  "tesla", "terafab", "gigafactory", "giga texas", "giga berlin",
  "giga shanghai", "giga nevada", "giga mexico", "fremont",
  "cybertruck", "cybercab", "model y", "model 3", "model s",
  "semi", "megapack", "supercharger", "4680", "fsd", "autopilot",
  "robotaxi", "optimus", "elon musk", "tsla",
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

function parseXML(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Try RSS format (<item>)
  const rssRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = rssRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const title = decodeEntities(rawTitle.trim());
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<link[^>]*href="([^"]*)"/)?.[ 1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    if (title && link) {
      items.push({
        title,
        link: link.trim(),
        date: pubDate ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        source,
      });
    }
  }

  // Try Atom format (<entry>) if no RSS items found
  if (items.length === 0) {
    const atomRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = atomRegex.exec(xml)) !== null) {
      const block = match[1];
      const rawTitle = block.match(/<title[^>]*>(.*?)<\/title>/)?.[1]
        ?? block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? "";
      const title = decodeEntities(rawTitle.trim());
      const link = block.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1]
        ?? block.match(/<link[^>]*href="([^"]*)">/)?.[1] ?? "";
      const updated = block.match(/<updated>(.*?)<\/updated>/)?.[1]
        ?? block.match(/<published>(.*?)<\/published>/)?.[1] ?? "";

      if (title && link) {
        items.push({
          title,
          link: link.trim(),
          date: updated ? new Date(updated).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
          source,
        });
      }
    }
  }

  return items;
}

async function fetchFeed(url: string, source: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`RSS ${source}: HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const items = parseXML(xml, source);
    console.log(`RSS ${source}: ${items.length} articles`);
    return items;
  } catch (err) {
    console.error(`RSS ${source}: fetch failed`, err);
    return [];
  }
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled([
    // Tesla-dedicated feeds — no keyword filter needed
    ...TESLA_FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.url, feed.source);
      return items.slice(0, 10);
    }),
    // General feeds — filter for Tesla keywords
    ...GENERAL_FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.url, feed.source);
      return items.filter((item) => {
        const lower = item.title.toLowerCase();
        return TESLA_KEYWORDS.some((k) => lower.includes(k));
      }).slice(0, 5);
    }),
  ]);

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Sort by date (newest first) and deduplicate by title similarity
  const seen = new Set<string>();
  return allItems
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

export default async function NewsFeed() {
  const allItems = await fetchAllNews();

  if (allItems.length === 0) {
    return (
      <p className="text-sm text-dim">
        No news available. See{" "}
        <a href="https://electrek.co/guides/tesla/" target="_blank" rel="noopener noreferrer" className="underline">Electrek</a>
        {" "}or{" "}
        <a href="https://www.teslarati.com" target="_blank" rel="noopener noreferrer" className="underline">Teslarati</a>.
      </p>
    );
  }

  return <NewsItems items={allItems.slice(0, 15)} />;
}

export async function FactoryNewsFeed({ keywords }: { keywords: string[] }) {
  const allItems = await fetchAllNews();
  let items = allItems.filter((item) => {
    const lower = item.title.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  }).slice(0, 5);

  // Fallback to latest general news
  if (items.length === 0) {
    items = allItems.slice(0, 5);
  }

  if (items.length === 0) {
    return <p className="text-sm text-dim">No recent news available.</p>;
  }

  return <NewsItems items={items} />;
}
