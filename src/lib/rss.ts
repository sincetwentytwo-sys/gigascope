import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
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

  // First non-decorative <img src="..."> inside description / content:encoded.
  // Skip Wordpress emoji (s.w.org/.../emoji/), Gravatar avatars, and old wp-includes smilies —
  // those are common false-positives when a publication leads its post with an emoji.
  const imgMatches = [...itemXml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  for (const im of imgMatches) {
    const url = im[1];
    if (
      url.includes("s.w.org/images/core/emoji") ||
      url.includes("gravatar.com/avatar") ||
      url.includes("/wp-includes/images/smilies/")
    ) continue;
    return decodeEntities(url);
  }

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
 * Lazy Upstash client. Mirrors the pattern used by other API routes
 * (src/app/api/subscribe/route.ts etc.). If credentials aren't set we
 * return null and callers skip caching/enrichment.
 */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Short stable cache key per article URL — first 16 hex chars of sha256. */
function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

/**
 * Fetch the article HTML and pull og:image (then twitter:image as fallback).
 * 4-second timeout — slow publishers get skipped rather than blocking the feed.
 * Any error (network, timeout, non-2xx, no match) returns undefined.
 */
async function scrapeOgImage(articleUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(articleUrl, {
      headers: {
        // Pretend to be Facebook's link-preview crawler — news sites whitelist it
        // because they want their articles to render in social shares. A custom
        // GIGASCOPE/1.0 UA gets 403'd by Cloudflare on insideevs.com and similar.
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;
    const html = await res.text();
    // og:image — attribute order varies, try both property-first and content-first.
    let m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    // Fall back to twitter:image
    if (!m) m = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (!m) return undefined;
    // Decode HTML entities — CNBC and others double-encode & in image URLs which
    // would otherwise render as <img src="...&amp;amp;w=1920"> and fail to load.
    return decodeEntities(m[1]);
  } catch {
    return undefined;
  }
}

/**
 * For items where RSS didn't include an image, scrape og:image from the
 * article page. Results cached in Upstash for 1 day; "none" is cached to
 * avoid retrying URLs that genuinely have no og:image every render.
 * Concurrency capped at 6 to avoid hammering publishers + Vercel limits.
 */
async function enrichImages(items: RichNewsItem[]): Promise<RichNewsItem[]> {
  // Skip during the static-prerender build phase. The Upstash REST SDK uses
  // `fetch` with `cache: 'no-store'` internally, which flips any caller page
  // from ISR to dynamic at build time even when we catch the error. ISR
  // revalidation (running in a serverless function, not the build) will
  // populate the cache, so users see real thumbnails within one revalidate
  // tick (~30 min) of the first deploy. Without this guard, /, /news, and
  // /site/[slug] all become dynamic-rendered.
  if (process.env.NEXT_PHASE === "phase-production-build") return items;

  const r = getRedis();
  if (!r) return items;

  const missing = items.filter((i) => !i.image);
  if (missing.length === 0) return items;

  const keys = missing.map((i) => `og:image:${hashUrl(i.link)}`);
  let cached: Array<string | null> = [];
  try {
    cached = (await r.mget<Array<string | null>>(...keys)) ?? [];
  } catch (e) {
    console.error("og:image mget failed", e);
    // Fall through with empty cached array — we'll treat everything as a miss.
  }

  const queue: Array<{ item: RichNewsItem; key: string }> = [];
  for (let i = 0; i < missing.length; i++) {
    const v = cached[i];
    if (typeof v === "string" && v !== "none") {
      missing[i].image = v;
    } else if (v === "none") {
      // Known no og:image — leave undefined for gradient fallback.
    } else {
      queue.push({ item: missing[i], key: keys[i] });
    }
  }

  if (queue.length === 0) return items;

  const concurrency = Math.min(6, queue.length);
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) break;
      const { item, key } = next;
      const img = await scrapeOgImage(item.link);
      try {
        if (img) {
          item.image = img;
          await r.set(key, img, { ex: 86400 });
        } else {
          await r.set(key, "none", { ex: 86400 });
        }
      } catch (e) {
        // Cache write failure is non-fatal — image (if any) is already set on item.
        console.error("og:image set failed", e);
      }
    }
  });
  await Promise.all(workers);
  return items;
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
  const merged = allItems
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Scrape og:image for items the RSS didn't include images for. Cached in
  // Upstash for 24h. Gracefully no-ops when Upstash isn't configured.
  return await enrichImages(merged);
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
