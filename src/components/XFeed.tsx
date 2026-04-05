"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, string>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

function getTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

function loadWidgetsJs(): Promise<void> {
  return new Promise((resolve) => {
    if (window.twttr) {
      resolve();
      return;
    }
    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = () => {
        const check = setInterval(() => {
          if (window.twttr) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      };
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.twttr) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    }
  });
}

function TweetEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const id = getTweetId(url);
    if (!id || !containerRef.current) return;

    const el = containerRef.current;
    el.innerHTML = "";

    loadWidgetsJs().then(() => {
      if (!window.twttr) return;
      window.twttr.widgets
        .createTweet(id, el, { theme: "dark", dnt: "true", width: "500" })
        .then((result) => {
          if (!result) setFailed(true);
        })
        .catch(() => setFailed(true));
    });
  }, [url]);

  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-white/10 p-3 text-xs text-dim hover:text-text font-mono"
      >
        View post on X &rarr;
      </a>
    );
  }

  return <div ref={containerRef} className="min-h-[100px]" />;
}

export interface XPostData {
  url: string;
  author: string;
  summary: string;
  date: string;
}

interface XFeedProps {
  query: string;
  factoryName: string;
  posts?: XPostData[];
}

export default function XFeed({ query, factoryName, posts }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  return (
    <div className="flex flex-col gap-4">
      {/* Embedded tweets */}
      {posts && posts.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
          {posts.map((post, i) => (
            <TweetEmbed key={i} url={post.url} />
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
