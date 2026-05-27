import { fetchCommunityPosts, type SocialPost } from "@/lib/social";

interface CommunityFeedProps {
  keywords?: string[];
  // factoryName is accepted (for backwards compatibility with existing call
  // sites) but no longer rendered — the compressed footer strip is generic
  // across all sites.
  factoryName?: string;
}

const SOURCE_BADGE: Record<SocialPost["source"], string> = {
  reddit: "bg-red-100 text-red-700",
  hn: "bg-orange-100 text-orange-700",
};

const OFFICIAL_ACCOUNTS = ["Tesla", "elonmusk", "SpaceX"];

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
      {(post.score > 0 || post.comments > 0) && (
        <div className="flex gap-3 text-xs text-dim">
          {post.score > 0 && <span title="points">▲ {formatScore(post.score)}</span>}
          {post.comments > 0 && <span title="comments">💬 {formatScore(post.comments)}</span>}
        </div>
      )}
    </a>
  );
}

function OfficialStrip() {
  // Single inline strip: tiny X glyph + "Live community is on X: @links".
  // Used to be three full-width follow cards but they screamed "I have no
  // real community of my own." Compressed so they don't dominate the panel
  // when we have actual Reddit/HN posts, and stay quiet but visible when
  // the community feed is empty.
  return (
    <div className="mt-3 pt-3 border-t border-border-custom">
      <p className="text-[11px] text-dim flex items-center gap-1.5 flex-wrap">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 opacity-70">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Live community is on X:</span>
        {OFFICIAL_ACCOUNTS.map((handle, i) => (
          <span key={handle} className="inline-flex items-center">
            <a
              href={`https://x.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text hover:underline"
            >
              @{handle}
            </a>
            {i < OFFICIAL_ACCOUNTS.length - 1 && <span className="text-dim">,&nbsp;</span>}
          </span>
        ))}
      </p>
    </div>
  );
}

export default async function CommunityFeed({ keywords = [] }: CommunityFeedProps) {
  const posts = await fetchCommunityPosts(keywords);
  const top = posts.slice(0, 8);

  return (
    <div className="flex flex-col gap-2">
      {top.length > 0 ? (
        top.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <p className="text-sm text-dim py-2">No recent community posts.</p>
      )}

      {/* When we have real Reddit/HN posts the X strip is filler — hide it.
          When there's nothing else, surface the compressed inline strip so
          the user has at least one path to follow live updates. */}
      {top.length === 0 && <OfficialStrip />}
    </div>
  );
}
