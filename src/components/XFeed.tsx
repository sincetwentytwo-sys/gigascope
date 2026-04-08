import { searchTweets, type XTweet } from "@/lib/x-api";

interface XFeedProps {
  query: string;
  factoryName: string;
}

const OFFICIAL_ACCOUNTS = [
  { handle: "Tesla", name: "Tesla", description: "Official Tesla updates" },
  { handle: "elonmusk", name: "Elon Musk", description: "CEO announcements" },
  { handle: "SpaceX", name: "SpaceX", description: "Rocket launches & Starlink" },
  { handle: "Tesla_AI", name: "Tesla AI", description: "FSD, Optimus, Dojo" },
];

function TweetCard({ tweet }: { tweet: XTweet }) {
  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border-custom rounded-lg p-3 hover:bg-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        {tweet.authorAvatar && (
          <img src={tweet.authorAvatar} alt="" className="w-8 h-8 rounded-full" />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold">{tweet.authorName}</span>
          <span className="text-xs text-dim ml-1">@{tweet.authorHandle} &middot; {tweet.date}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-dim shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <p className="text-sm text-dim leading-relaxed mb-2">{tweet.text}</p>

      {tweet.images.length > 0 && (
        <div className={`grid gap-1.5 mb-2 ${tweet.images.length > 1 ? "grid-cols-2" : ""}`}>
          {tweet.images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      )}

      <div className="flex gap-4 text-xs text-dim">
        <span>{tweet.retweets.toLocaleString()} retweets</span>
        <span>{tweet.likes.toLocaleString()} likes</span>
      </div>
    </a>
  );
}

function AccountCard({ handle, name, description }: { handle: string; name: string; description: string }) {
  return (
    <a
      href={`https://x.com/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border border-border-custom rounded-lg p-3 hover:bg-surface transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{name}</div>
        <div className="text-xs text-dim">@{handle} &middot; {description}</div>
      </div>
      <span className="text-xs text-dim shrink-0">Follow &rarr;</span>
    </a>
  );
}

export default async function XFeed({ query, factoryName }: XFeedProps) {
  // Two parallel searches: keyword query + Tesla official accounts.
  // Official posts are merged in so we never miss them.
  const [keywordTweets, officialTweets] = await Promise.all([
    searchTweets(query, 5),
    searchTweets("(from:Tesla OR from:elonmusk OR from:SpaceX OR from:Tesla_AI)", 10),
  ]);

  const seen = new Set<string>();
  const merged = [...officialTweets, ...keywordTweets].filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  // Newest first (Twitter snowflake ids: larger = newer)
  merged.sort((a, b) => (BigInt(b.id) > BigInt(a.id) ? 1 : -1));

  const items = merged.slice(0, 6);
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  // If API returned tweets, show them. Otherwise show always-useful account cards.
  if (items.length > 0) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)}
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-dim hover:text-text transition-colors mt-1"
        >
          More on X &rarr;
        </a>
      </div>
    );
  }

  // Fallback: official account follow cards (always useful, never empty)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-dim mb-1">Follow official accounts for latest updates:</p>
      {OFFICIAL_ACCOUNTS.map((acc) => (
        <AccountCard key={acc.handle} {...acc} />
      ))}
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-dim hover:text-text transition-colors mt-1"
      >
        Search &ldquo;{factoryName}&rdquo; on X &rarr;
      </a>
    </div>
  );
}
