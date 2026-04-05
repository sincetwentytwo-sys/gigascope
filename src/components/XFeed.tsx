import { Suspense } from "react";
import { Tweet } from "react-tweet";

export interface XPostData {
  url: string;
  author: string;
  summary: string;
  date: string;
}

function getTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

interface XFeedProps {
  query: string;
  factoryName: string;
  posts?: XPostData[];
}

export default function XFeed({ query, factoryName, posts }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  return (
    <div className="flex flex-col gap-3">
      {/* Embedded tweets via react-tweet (server rendered, no widgets.js) */}
      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto [&_.react-tweet-theme]:!m-0 [&_.react-tweet-theme]:!max-w-full">
          {posts.map((post, i) => {
            const id = getTweetId(post.url);
            if (!id) return null;
            return (
              <Suspense
                key={i}
                fallback={
                  <div className="border border-white/10 p-3 text-xs text-dim font-mono animate-pulse">
                    Loading tweet...
                  </div>
                }
              >
                <Tweet id={id} />
              </Suspense>
            );
          })}
        </div>
      )}

      {/* Live search link */}
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-mono text-dim hover:text-text transition-colors border border-white/8 px-3 py-2 w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        See all {factoryName} posts on X &rarr;
      </a>
    </div>
  );
}
