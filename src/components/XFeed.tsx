import { searchTweets, type XTweet } from "@/lib/x-api";

interface XFeedProps {
  query: string;
  factoryName: string;
}

function TweetCard({ tweet }: { tweet: XTweet }) {
  return (
    <a
      href={tweet.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-white/8 p-3 hover:border-white/15 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        {tweet.authorAvatar && (
          <img src={tweet.authorAvatar} alt="" className="w-7 h-7 rounded-full" />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold">{tweet.authorName}</span>
          <span className="text-[10px] text-dim font-mono ml-1">@{tweet.authorHandle} &middot; {tweet.date}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-dim shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>

      <p className="text-xs text-dim leading-relaxed mb-2">{tweet.text}</p>

      {tweet.images.length > 0 && (
        <div className={`grid gap-1 mb-2 ${tweet.images.length > 1 ? "grid-cols-2" : ""}`}>
          {tweet.images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-28 object-cover border border-white/5" />
          ))}
        </div>
      )}

      <div className="flex gap-4 text-[10px] text-dim font-mono">
        <span>{tweet.retweets.toLocaleString()} RT</span>
        <span>{tweet.likes.toLocaleString()} likes</span>
      </div>
    </a>
  );
}

export default async function XFeed({ query, factoryName }: XFeedProps) {
  const tweets = await searchTweets(query, 5);
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  return (
    <div className="flex flex-col gap-2">
      {tweets.length > 0 ? (
        tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
      ) : (
        <p className="text-xs text-dim font-mono py-2">No recent posts found.</p>
      )}

      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-mono text-dim hover:text-text transition-colors border border-white/8 px-3 py-2 w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        More on X &rarr;
      </a>
    </div>
  );
}
