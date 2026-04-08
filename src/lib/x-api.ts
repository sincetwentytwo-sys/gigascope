export interface XTweet {
  id: string;
  text: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  date: string;
  likes: number;
  retweets: number;
  url: string;
  images: string[];
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

interface TwitterMedia {
  type: string;
  url?: string;
  preview_image_url?: string;
  media_key: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
  };
  attachments?: {
    media_keys?: string[];
  };
}

interface TwitterSearchResponse {
  data?: TwitterTweet[];
  includes?: {
    users?: TwitterUser[];
    media?: TwitterMedia[];
  };
}

export async function searchTweets(query: string, maxResults = 5): Promise<XTweet[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    console.error("X_BEARER_TOKEN not set");
    return [];
  }

  try {
    // Only add lang:en for keyword queries — from: queries already constrain the source
    // and would lose image/video posts that have no detected language
    const finalQuery = query.includes("from:")
      ? `${query} -is:retweet`
      : `${query} -is:retweet lang:en`;

    const params = new URLSearchParams({
      query: finalQuery,
      max_results: String(Math.max(10, Math.min(maxResults, 100))),
      "tweet.fields": "created_at,public_metrics,attachments,author_id",
      expansions: "author_id,attachments.media_keys",
      "user.fields": "name,username,profile_image_url",
      "media.fields": "url,preview_image_url,type",
    });

    const res = await fetch(
      `https://api.x.com/2/tweets/search/recent?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 1800 },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`X API error ${res.status} for query "${finalQuery}": ${errorText}`);
      return [];
    }

    const json: TwitterSearchResponse = await res.json();
    if (!json.data) return [];

    const users = new Map<string, TwitterUser>();
    json.includes?.users?.forEach((u) => users.set(u.id, u));

    const media = new Map<string, TwitterMedia>();
    json.includes?.media?.forEach((m) => media.set(m.media_key, m));

    return json.data.map((tweet) => {
      const author = users.get(tweet.author_id);
      const images: string[] = [];

      tweet.attachments?.media_keys?.forEach((key) => {
        const m = media.get(key);
        if (m && (m.type === "photo" || m.type === "animated_gif")) {
          images.push(m.url ?? m.preview_image_url ?? "");
        }
      });

      return {
        id: tweet.id,
        text: tweet.text,
        authorName: author?.name ?? "",
        authorHandle: author?.username ?? "",
        authorAvatar: author?.profile_image_url ?? "",
        date: new Date(tweet.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        url: `https://x.com/${author?.username ?? "x"}/status/${tweet.id}`,
        images: images.filter(Boolean),
      };
    });
  } catch (err) {
    console.error("X API fetch failed:", err);
    return [];
  }
}
