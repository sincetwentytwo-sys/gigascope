// Free social feeds: Reddit JSON API + HN Algolia API.
// No tokens, no rate limits in practice. Cached for 30min via fetch revalidate.

export interface SocialPost {
  id: string;
  source: "reddit" | "hn" | "x";
  sourceLabel: string; // r/teslamotors, HN, @elonmusk
  author: string;
  title: string;
  url: string;          // direct article/link
  discussionUrl: string; // reddit/hn discussion thread
  score: number;
  comments: number;
  timestamp: number;
  thumbnail?: string;
}

interface RedditChild {
  data: {
    id: string;
    title: string;
    author: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    thumbnail?: string;
    over_18?: boolean;
    stickied?: boolean;
  };
}

interface RedditResponse {
  data?: { children?: RedditChild[] };
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

const REDDIT_HEADERS = {
  "User-Agent": "gigascope-tracker/1.0 (+https://gigascope-ten.vercel.app)",
};

async function fetchSubreddit(sub: string, limit = 5): Promise<SocialPost[]> {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${sub}/top.json?t=day&limit=${limit}`,
      {
        headers: REDDIT_HEADERS,
        next: { revalidate: 1800 },
      }
    );
    if (!res.ok) {
      console.error(`Reddit r/${sub}: HTTP ${res.status}`);
      return [];
    }
    const json: RedditResponse = await res.json();
    const children = json.data?.children ?? [];
    return children
      .filter((c) => !c.data.over_18 && !c.data.stickied)
      .map((c) => {
        const d = c.data;
        const thumb = d.thumbnail && d.thumbnail.startsWith("http") ? d.thumbnail : undefined;
        return {
          id: `reddit-${d.id}`,
          source: "reddit" as const,
          sourceLabel: `r/${sub}`,
          author: `u/${d.author}`,
          title: d.title,
          url: d.url,
          discussionUrl: `https://www.reddit.com${d.permalink}`,
          score: d.score,
          comments: d.num_comments,
          timestamp: d.created_utc * 1000,
          thumbnail: thumb,
        };
      });
  } catch (err) {
    console.error(`Reddit r/${sub} fetch failed:`, err);
    return [];
  }
}

async function fetchHN(query: string, limit = 5): Promise<SocialPost[]> {
  try {
    const params = new URLSearchParams({
      query,
      tags: "story",
      hitsPerPage: String(limit),
    });
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search_by_date?${params}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) {
      console.error(`HN search "${query}": HTTP ${res.status}`);
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

// Fetch all community sources for a factory.
// `keywords` are used to filter Reddit posts down to factory-relevant ones,
// but if filtering yields too few, we fall back to general Tesla/SpaceX posts.
export async function fetchCommunityPosts(keywords: string[] = []): Promise<SocialPost[]> {
  const results = await Promise.allSettled([
    fetchSubreddit("teslamotors", 10),
    fetchSubreddit("SpaceXLounge", 5),
    fetchSubreddit("teslainvestorsclub", 5),
    fetchHN("Tesla", 5),
    fetchHN("SpaceX OR Starship", 5),
  ]);

  const all = results
    .filter((r): r is PromiseFulfilledResult<SocialPost[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  // Dedupe by URL
  const seen = new Set<string>();
  const deduped = all.filter((p) => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  // If keywords provided, prefer factory-relevant posts at the top
  if (keywords.length > 0) {
    const matches = (p: SocialPost) => {
      const lower = p.title.toLowerCase();
      return keywords.some((k) => lower.includes(k.toLowerCase()));
    };
    const relevant = deduped.filter(matches);
    const general = deduped.filter((p) => !matches(p));
    // Sort each group by timestamp desc
    relevant.sort((a, b) => b.timestamp - a.timestamp);
    general.sort((a, b) => b.timestamp - a.timestamp);
    return [...relevant, ...general];
  }

  // No keywords: just sort by timestamp desc
  deduped.sort((a, b) => b.timestamp - a.timestamp);
  return deduped;
}
