import { fetchCommunityPosts, type SocialPost } from "@/lib/social";

interface CommunityFeedProps {
  keywords?: string[];
  factoryName: string;
}

const SOURCE_BADGE: Record<SocialPost["source"], string> = {
  reddit: "bg-orange-100 text-orange-700",
  hn: "bg-orange-200 text-orange-800",
  x: "bg-gray-900 text-white",
};

const OFFICIAL_ACCOUNTS = [
  { handle: "Tesla", name: "Tesla", description: "Official Tesla updates" },
  { handle: "elonmusk", name: "Elon Musk", description: "CEO announcements" },
  { handle: "SpaceX", name: "SpaceX", description: "Rocket launches & Starlink" },
];

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function formatScore(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function PostCard({ post }: { post: SocialPost }) {
  return (
    <a
      href={post.discussionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-border-custom rounded-lg p-3 hover:bg-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${SOURCE_BADGE[post.source]}`}>
          {post.sourceLabel}
        </span>
        <span className="text-xs text-dim">{post.author}</span>
        <span className="text-xs text-dim">&middot;</span>
        <span className="text-xs text-dim">{timeAgo(post.timestamp)}</span>
      </div>
      <p className="text-sm font-medium leading-snug mb-2">{post.title}</p>
      <div className="flex gap-3 text-xs text-dim">
        <span title="upvotes / points">▲ {formatScore(post.score)}</span>
        <span title="comments">💬 {formatScore(post.comments)}</span>
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
      className="flex items-center gap-3 border border-border-custom rounded-lg p-2.5 hover:bg-surface transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold">{name}</div>
        <div className="text-[10px] text-dim">@{handle} &middot; {description}</div>
      </div>
      <span className="text-[10px] text-dim shrink-0">Follow &rarr;</span>
    </a>
  );
}

export default async function CommunityFeed({ keywords = [], factoryName }: CommunityFeedProps) {
  const posts = await fetchCommunityPosts(keywords);
  const top = posts.slice(0, 8);

  return (
    <div className="flex flex-col gap-2">
      {top.length > 0 ? (
        top.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-sm text-dim py-2">No recent community posts.</p>
      )}

      {/* X official accounts always shown below — never miss official posts */}
      <div className="mt-3 pt-3 border-t border-border-custom">
        <p className="text-[10px] text-dim mb-2 uppercase tracking-wider">Official on X</p>
        <div className="flex flex-col gap-1.5">
          {OFFICIAL_ACCOUNTS.map((acc) => (
            <AccountCard key={acc.handle} {...acc} />
          ))}
        </div>
      </div>
    </div>
  );
}
