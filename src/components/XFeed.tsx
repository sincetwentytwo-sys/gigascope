"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

function loadTwitterScript() {
  if (document.getElementById("twitter-wjs")) return;
  const script = document.createElement("script");
  script.id = "twitter-wjs";
  script.src = "https://platform.twitter.com/widgets.js";
  script.async = true;
  document.head.appendChild(script);
}

export function XEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTwitterScript();
    const interval = setInterval(() => {
      if (window.twttr && ref.current) {
        window.twttr.widgets.load(ref.current);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [url]);

  return (
    <div ref={ref} className="max-w-full overflow-hidden [&_iframe]:!max-width-full">
      <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true">
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
}

interface XPost {
  url: string;
  author: string;
  summary: string;
  date: string;
}

interface XFeedProps {
  query: string;
  factoryName: string;
  posts?: XPost[];
}

export default function XFeed({ query, factoryName, posts }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  return (
    <div className="flex flex-col gap-4">
      {/* Curated posts with embeds */}
      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-3">
          {posts.map((post, i) => (
            <div key={i}>
              {/* Summary card */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-mono text-[9px] text-dim shrink-0">{post.date}</span>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-dim hover:text-text transition-colors leading-snug"
                >
                  <span className="font-bold text-text">@{post.author}</span> &mdash; {post.summary}
                </a>
              </div>
              {/* Embedded tweet */}
              <XEmbed url={post.url} />
            </div>
          ))}
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
