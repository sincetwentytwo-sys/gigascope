import type { NewsItem } from "@/data/types";

// Tesla-dedicated sources (all articles are relevant, no keyword filter needed)
const TESLA_FEEDS = [
  { source: "Electrek", url: "https://electrek.co/guides/tesla/feed/" },
  { source: "Teslarati", url: "https://www.teslarati.com/feed/" },
];

// General sources (need keyword filter)
const GENERAL_FEEDS = [
  { source: "InsideEVs", url: "https://insideevs.com/feed/" },
  { source: "CleanTechnica", url: "https://cleantechnica.com/feed/" },
  { source: "TorqueNews", url: "https://www.torquenews.com/rss.xml" },
  {
    source: "CNBC",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147",
  },
];

const TESLA_KEYWORDS = [
  "tesla", "terafab", "gigafactory", "giga texas", "giga berlin",
  "giga shanghai", "giga nevada", "giga mexico", "fremont",
  "cybertruck", "cybercab", "model y", "model 3", "model s",
  "semi", "megapack", "supercharger", "4680", "fsd", "autopilot",
  "robotaxi", "optimus", "elon musk", "tsla", "spacex", "starship", "starlink",
];

/** Extended news item with thumbnail + excerpt for richer renderers (e.g. zigzag). */
export interface RichNewsItem extends NewsItem {
  image?: string;
  excerpt?: string;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/**
 * Try multiple RSS image conventions, returning the first hit.
 * Handles media:content, media:thumbnail, enclosure, itunes:image, and
 * inline <img> embeds inside <description> / <content:encoded>.
 */
function extractImage(itemXml: string): string | undefined {
  // media:content url="..." (medium="image" optional — many feeds omit it)
  let m = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (m) return m[1];

  // media:thumbnail url="..."
  m = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (m) return m[1];

  // enclosure with image type
  m = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image\//i);
  if (m) return m[1];

  // itunes:image href="..."
  m = itemXml.match(/<itunes:image[^>]+href=["']([^"']+)["']/i);
  if (m) return m[1];

  // First <img src="..."> inside description / content:encoded (CDATA-wrapped HTML)
  m = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];

  return undefined;
}

function extractExcerpt(itemXml: string): string | undefined {
  // Prefer <description>, fall back to <content:encoded>
  let m = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
  let raw = m?.[1];
  if (!raw) {
    m = itemXml.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/);
    raw = m?.[1];
  }
  if (!raw) {
    m = itemXml.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/);
    raw = m?.[1];
  }
  if (!raw) return undefined;
  const text = stripTags(raw);
  if (!text) return undefined;
  return text.length > 240 ? text.slice(0, 237).trimEnd() + "…" : text;
}

function parseXML(xml: string, source: string): RichNewsItem[] {
  const items: RichNewsItem[] = [];

  // Try RSS format (<item>)
  const rssRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = rssRegex.exec(xml)) !== null) {
    const block = match[1];
    const rawTitle =
      block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ??
      "";
    const title = decodeEntities(rawTitle.trim());
    const link =
      block.match(/<link>(.*?)<\/link>/)?.[1] ??
      block.match(/<link[^>]*href="([^"]*)"/)?.[1] ??
      "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    if (title && link) {
      const ts = pubDate ? new Date(pubDate).getTime() : 0;
      items.push({
        title,
        link: link.trim(),
        date: pubDate
          ? new Date(pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "",
        timestamp: ts,
        source,
        image: extractImage(block),
        excerpt: extractExcerpt(block),
      });
    }
  }

  // Try Atom format (<entry>) if no RSS items found
  if (items.length === 0) {
    const atomRegex = /<entry>([\s\S]*?)<\/entry>/g;
    while ((match = atomRegex.exec(xml)) !== null) {
      const block = match[1];
      const rawTitle =
        block.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ??
        block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
        "";
      const title = decodeEntities(rawTitle.trim());
      const link =
        block.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ??
        block.match(/<link[^>]*href="([^"]*)">/)?.[1] ??
        "";
      const updated =
        block.match(/<updated>(.*?)<\/updated>/)?.[1] ??
        block.match(/<published>(.*?)<\/published>/)?.[1] ??
        "";

      if (title && link) {
        const ts = updated ? new Date(updated).getTime() : 0;
        items.push({
          title,
          link: link.trim(),
          date: updated
            ? new Date(updated).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "",
          timestamp: ts,
          source,
          image: extractImage(block),
          excerpt: extractExcerpt(block),
        });
      }
    }
  }

  return items;
}

async function fetchFeed(url: string, source: string): Promise<RichNewsItem[]> {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
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

/**
 * Fetch all Tesla / Musk-empire RSS feeds, dedupe by title prefix, and
 * return newest first. Used by both NewsFeed (compact list) and
 * NewsZigzag (thumbnail grid) so source list + parsing stay in one place.
 */
export async function fetchAllNews(): Promise<RichNewsItem[]> {
  const results = await Promise.allSettled([
    // Tesla-dedicated feeds — no keyword filter needed
    ...TESLA_FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.url, feed.source);
      return items.slice(0, 10);
    }),
    // General feeds — filter for Tesla keywords
    ...GENERAL_FEEDS.map(async (feed) => {
      const items = await fetchFeed(feed.url, feed.source);
      return items
        .filter((item) => {
          const lower = item.title.toLowerCase();
          return TESLA_KEYWORDS.some((k) => lower.includes(k));
        })
        .slice(0, 5);
    }),
  ]);

  const allItems = results
    .filter((r): r is PromiseFulfilledResult<RichNewsItem[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Sort by date (newest first) and deduplicate by title prefix
  const seen = new Set<string>();
  return allItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Pretty-print a relative time. Server-rendered against build time. */
export function timeAgo(input: string | number | Date): string {
  const t = typeof input === "number" ? input : new Date(input).getTime();
  if (!Number.isFinite(t) || t === 0) return "";
  const ms = Date.now() - t;
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
