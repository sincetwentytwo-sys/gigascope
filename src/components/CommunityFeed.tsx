import Link from "next/link";
import { fetchCommunityPosts, type SocialPost } from "@/lib/social";
import { getLatestAnalyses, getAnalysesForFactory } from "@/data/analyses";

interface CommunityFeedProps {
  keywords?: string[];
  // factoryName is accepted (for backwards compatibility with existing call
  // sites) but no longer rendered — the compressed footer strip is generic
  // across all sites.
  factoryName?: string;
  // When present, prefer analyses cross-linked to this factory slug for the
  // fallback panel. Falls back to global latest if no per-factory matches.
  factorySlug?: string;
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

// Render a single GIGASCOPE-owned analysis card. Mirrors PostCard density but
// signals "our analysis" via the badge so users can tell it's curated, not a
// scraped community post.
function AnalysisCard({
  slug,
  title,
  kicker,
  publishedAt,
}: {
  slug: string;
  title: string;
  kicker: string;
  publishedAt: string;
}) {
  const ts = new Date(publishedAt).getTime();
  return (
    <Link
      href={`/pulse/${slug}`}
      className="block border border-border-custom rounded-lg p-3 hover:bg-surface transition-colors"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-text text-bg">
          GIGASCOPE
        </span>
        <span className="text-xs text-dim">{kicker}</span>
        <span className="text-xs text-dim">&middot;</span>
        <span className="text-xs text-dim">{timeAgo(ts)}</span>
      </div>
      <p className="text-sm font-medium leading-snug">{title}</p>
    </Link>
  );
}

export default async function CommunityFeed({
  keywords = [],
  factorySlug,
}: CommunityFeedProps) {
  const posts = await fetchCommunityPosts(keywords);
  const top = posts.slice(0, 8);

  // When the community feed is empty (Reddit blocks Vercel egress on many
  // days, HN returns nothing relevant), fall through to our own analysis
  // feed. Per-factory matches first, then global latest. The dead "No
  // recent community posts" state is gone — there's always something to
  // read, and that something is *our* work, not a Reddit cross-post.
  const fallbackAnalyses =
    top.length === 0
      ? (() => {
          const perFactory = factorySlug ? getAnalysesForFactory(factorySlug) : [];
          if (perFactory.length > 0) return perFactory.slice(0, 3);
          return getLatestAnalyses(3);
        })()
      : [];

  return (
    <div className="flex flex-col gap-2">
      {top.length > 0
        ? top.map((post) => <PostCard key={post.id} post={post} />)
        : fallbackAnalyses.map((a) => (
            <AnalysisCard
              key={a.slug}
              slug={a.slug}
              title={a.title}
              kicker={a.kicker}
              publishedAt={a.publishedAt}
            />
          ))}

      {/* X strip stays as a quiet footer regardless of what's above it —
          this is the audience pointer, not the feed. */}
      <OfficialStrip />
    </div>
  );
}
