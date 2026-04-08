// Free social feeds: Reddit RSS + HN Algolia API.
// Reddit JSON API is blocked from Vercel IPs, so we use the public RSS
// feed instead. HN Algolia API has no rate limits.

export interface SocialPost {
  id: string;
  source: "reddit" | "hn";
  sourceLabel: string;
  author: string;
  title: string;
  url: string;           // article link
  discussionUrl: string; // reddit/hn thread
  score: number;         // 0 if unknown (RSS doesn't expose it)
  comments: number;
  timestamp: number;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripCData(str: string): string {
  return str.replace(/^<!\[CDATA\[|\]\]>$/g, "");
}

// Reddit via RSS (Atom format). JSON API gets blocked from cloud IPs.
async function fetchSubredditRSS(sub: string): Promise<SocialPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/top/.rss?t=day&limit=10`,
      {
        headers: {
          "User-Agent": "web:gigascope:v1.0 (https://gigascope-ten.vercel.app)",
          Accept: "application/atom+xml,application/xml,text/xml",
        },
        next: { revalidate: 1800 },
      }
    );
    if (!res.ok) {
      console.error(`Reddit r/${sub} RSS: HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();

    const posts: SocialPost[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleRaw = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const title = decodeEntities(stripCData(titleRaw).trim());
      const threadUrl = block.match(/<link[^>]*href="([^"]*)"/)?.[1] ?? "";
      const id = block.match(/<id>([^<]+)<\/id>/)?.[1] ?? "";
      const updated = block.match(/<updated>([^<]+)<\/updated>/)?.[1] ?? "";
      const authorName = block.match(/<author>[\s\S]*?<name>\/u\/([^<]+)<\/name>/)?.[1] ?? "";

      if (!title || !threadUrl) continue;

      posts.push({
        id: `reddit-${id}`,
        source: "reddit",
        sourceLabel: `r/${sub}`,
        author: `u/${authorName}`,
        title,
        url: threadUrl,
        discussionUrl: threadUrl,
        score: 0, // RSS doesn't expose upvotes
        comments: 0,
        timestamp: updated ? new Date(updated).getTime() : 0,
      });
    }
    return posts;
  } catch (err) {
    console.error(`Reddit r/${sub} RSS fetch failed:`, err);
    return [];
  }
}

interface HNHit {
  objectID: string;
  title?: string;
  url?: string;
  author: string;
  points?: number;
  num_comments?: number;
  created_at_i: number;
}

interface HNResponse {
  hits?: HNHit[];
}

// HN Algolia: use popularity sort, filter by points + recency.
async function fetchHN(query: string, limit = 10): Promise<SocialPost[]> {
  try {
    const weekAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 3600; // 30 days
    const params = new URLSearchParams({
      query,
      tags: "story",
      hitsPerPage: String(limit),
      numericFilters: `points>20,created_at_i>${weekAgo}`,
    });
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?${params}`, // default sort = popularity
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) {
      console.error(`HN "${query}": HTTP ${res.status}`);
      return [];
    }
    const json: HNResponse = await res.json();
    const hits = json.hits ?? [];
    return hits
      .filter((h) => h.title && h.url)
      .map((h) => ({
        id: `hn-${h.objectID}`,
        source: "hn" as const,
        sourceLabel: "Hacker News",
        author: h.author,
        title: h.title!,
        url: h.url!,
        discussionUrl: `https://news.ycombinator.com/item?id=${h.objectID}`,
        score: h.points ?? 0,
        comments: h.num_comments ?? 0,
        timestamp: h.created_at_i * 1000,
      }));
  } catch (err) {
    console.error(`HN fetch failed:`, err);
    return [];
  }
}

// Fetch all community sources. `keywords` boost factory-relevant posts.
export async function fetchCommunityPosts(keywords: string[] = []): Promise<SocialPost[]> {
  const results = await Promise.allSettled([
    fetchSubredditRSS("teslamotors"),
    fetchSubredditRSS("SpaceXLounge"),
    fetchSubredditRSS("teslainvestorsclub"),
    fetchHN("Tesla Gigafactory OR Cybertruck OR Cybercab OR \"Tesla Semi\" OR Optimus OR \"Full Self Driving\"", 8),
    fetchHN("SpaceX Starship OR Starlink OR \"Falcon 9\"", 5),
  ]);

  const all = results
    .filter((r): r is PromiseFulfilledResult<SocialPost[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Dedupe by URL (and title as fallback)
  const seen = new Set<string>();
  const deduped = all.filter((p) => {
    const key = p.url || p.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter to posts from last 14 days max (no more 48-week-old stragglers)
  const cutoff = Date.now() - 14 * 24 * 3600 * 1000;
  const recent = deduped.filter((p) => p.timestamp >= cutoff);

  // If factory keywords provided, prioritize matches
  if (keywords.length > 0) {
    const matches = (p: SocialPost) => {
      const lower = p.title.toLowerCase();
      return keywords.some((k) => lower.includes(k.toLowerCase()));
    };
    const relevant = recent.filter(matches).sort((a, b) => b.timestamp - a.timestamp);
    const general = recent.filter((p) => !matches(p)).sort((a, b) => b.timestamp - a.timestamp);
    return [...relevant, ...general];
  }

  recent.sort((a, b) => b.timestamp - a.timestamp);
  return recent;
}
