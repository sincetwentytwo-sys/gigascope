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
    const res = await fetch(url, {
      // Browser-shaped headers. Plain (no-header) fetch from Vercel egress
      // was returning empty or 403 from most publisher RSS endpoints —
      // some publishers have moved RSS behind the same WAF as their
      // article pages, so a bare Node fetch user-agent gets blocked.
      // Chrome UA + Accept header makes us look like Feedly/a normal
      // RSS reader.
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept:
          "application/rss+xml, application/xml, application/atom+xml, text/xml;q=0.9, */*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // 60s fetch cache. Was 1800s — far too long, a single timeout-induced
      // empty result would freeze /news at 1 article for half an hour
      // even after revalidatePath() invalidated the page cache (fetch
      // cache is separate). 60s matches the /news page ISR revalidate,
      // so a transient RSS failure self-heals within one minute.
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`RSS ${source}: HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const items = parseXML(xml, source);
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

// UAs tried in order. Browser UA first — looks like a real visitor and bypasses
// any WAF that filters purely on bot-string. Discordbot as the only fallback
// because it's the recognized link-preview crawler with the highest success
// rate on our specific source list (publishers explicitly allow it for X/
// Discord/Slack preview unfurls). Trimmed from 4 UAs to 2 to stay inside
// Vercel's 10s function budget — 4 UAs × 4s each = 16s/article, worst case
// blew through the entire enrichImages budget on a single hard-blocked URL.
const SCRAPE_UAS = [
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
];

function extractImageFromHtml(html: string): string | undefined {
  // og:image — attribute order varies, try both property-first and content-first.
  let m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  // Fall back to twitter:image
  if (!m) m = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (!m) m = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (!m) return undefined;
  return decodeEntities(m[1]);
}

/**
 * Fetch the article HTML and pull og:image (then twitter:image as fallback).
 * Retries across 4 UAs with browser-shaped headers and an 8s timeout. Any
 * single attempt returning 200 with no image short-circuits (no image is no
 * image — UA doesn't change that). Network/timeout/4xx-5xx errors fall
 * through to the next UA.
 */
async function scrapeOgImage(articleUrl: string): Promise<string | undefined> {
  for (let attempt = 0; attempt < SCRAPE_UAS.length; attempt++) {
    try {
      const res = await fetch(articleUrl, {
        headers: {
          "User-Agent": SCRAPE_UAS[attempt],
          // Realistic browser Accept header. Some WAFs reject the bare
          // "text/html,application/xhtml+xml" we used to send because real
          // browsers never look like that.
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        // 4s per attempt × 2 UAs = max 8s/article. Fits well inside the
        // 5s enrichImages budget alongside other workers. Originally 8s,
        // but with 4 UAs that compounded to ~32s and starved the rest of
        // the queue.
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue; // next UA
      const html = await res.text();
      const img = extractImageFromHtml(html);
      if (img) return img;
      // 200 OK but no image tag — article genuinely has none. Stop retrying.
      return undefined;
    } catch {
      continue; // network/timeout — next UA
    }
  }
  return undefined;
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
          // Found a real image — cache for a day (the article URL is stable
          // and the image rarely changes).
          item.image = img;
          await r.set(key, img, { ex: 86400 });
        } else {
          // Negative cache shorter (2h, not 1 day): some publishers add
          // og:image hours after publish, or our Discordbot UA briefly trips
          // a WAF rate-limit. A 2h TTL means a failed scrape retries on the
          // next ISR tick rather than locking the card to a placeholder for
          // a full day. The "scraped but no image" outcome is genuinely
          // permanent for some podcast/list posts, but those just re-scrape
          // 12× a day at near-zero cost.
          await r.set(key, "none", { ex: 7200 });
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

  // DEBUG: emit the per-source count to Vercel function logs so we can
  // see which feeds are timing out. Temporary — strip once /news article
  // count stabilizes.
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    const bySource = merged.reduce<Record<string, number>>((acc, item) => {
      acc[item.source] = (acc[item.source] ?? 0) + 1;
      return acc;
    }, {});
    console.log("fetchAllNews source counts:", JSON.stringify(bySource), "total:", merged.length);
  }

  // Skip enrichImages for now — Upstash cache wipe + fresh SSR was running
  // og scrape on every article and burning the entire Vercel function
  // budget before the page could render. Article count on /news dropped
  // from ~25 to 1 because the function got killed mid-render. We bring
  // enrichment back as a separate background cron once the article
  // pipeline is stable; in the meantime articles render with whatever
  // RSS image their feed gave us, which is most of them. The image proxy
  // handles the client-load step from there.
  return merged;
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
