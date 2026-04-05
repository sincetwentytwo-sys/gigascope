"use client";

import { useEffect, useState } from "react";

interface FeedItem {
  title: string;
  link: string;
  date: string;
  source: string;
}

const FEEDS = [
  {
    source: "Electrek",
    url: "https://electrek.co/guides/tesla/feed/",
  },
  {
    source: "Teslarati",
    url: "https://www.teslarati.com/feed/",
  },
];

// Use a public CORS proxy for RSS fetching from client
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

function parseRSS(xml: string, source: string): FeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const items = doc.querySelectorAll("item");
  const results: FeedItem[] = [];

  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent ?? "";
    const link = item.querySelector("link")?.textContent ?? "";
    const pubDate = item.querySelector("pubDate")?.textContent ?? "";

    // Only include items mentioning factory/gigafactory/terafab keywords
    const lower = title.toLowerCase();
    const relevant =
      lower.includes("factory") ||
      lower.includes("gigafactory") ||
      lower.includes("giga") ||
      lower.includes("terafab") ||
      lower.includes("fremont") ||
      lower.includes("shanghai") ||
      lower.includes("berlin") ||
      lower.includes("nevada") ||
      lower.includes("mexico") ||
      lower.includes("buffalo") ||
      lower.includes("construction") ||
      lower.includes("expansion") ||
      lower.includes("production");

    if (relevant && title && link) {
      results.push({
        title,
        link,
        date: pubDate ? new Date(pubDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }) : "",
        source,
      });
    }
  });

  return results.slice(0, 5);
}

export default function NewsFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchFeeds() {
      try {
        const results = await Promise.allSettled(
          FEEDS.map(async (feed) => {
            const res = await fetch(CORS_PROXY + encodeURIComponent(feed.url));
            if (!res.ok) return [];
            const xml = await res.text();
            return parseRSS(xml, feed.source);
          })
        );

        const allItems = results
          .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === "fulfilled")
          .flatMap((r) => r.value)
          .sort((a, b) => {
            const da = new Date(a.date).getTime() || 0;
            const db = new Date(b.date).getTime() || 0;
            return db - da;
          })
          .slice(0, 8);

        setItems(allItems);
        if (allItems.length === 0) setError(true);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchFeeds();
  }, []);

  if (loading) {
    return (
      <div className="text-dim font-mono text-xs py-4">
        Loading news...
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="text-dim font-mono text-xs py-4">
        Unable to load news feed. Check{" "}
        <a
          href="https://electrek.co/guides/tesla/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text"
        >
          Electrek
        </a>{" "}
        or{" "}
        <a
          href="https://www.teslarati.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text"
        >
          Teslarati
        </a>{" "}
        for latest updates.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-baseline gap-3 py-1.5 border-b border-white/5 last:border-0 group"
        >
          <span className="font-mono text-[9px] text-dim shrink-0 w-16">
            {item.date}
          </span>
          <span className="text-xs group-hover:text-text transition-colors text-dim leading-snug">
            {item.title}
          </span>
          <span className="font-mono text-[8px] text-dim/50 shrink-0 ml-auto">
            {item.source}
          </span>
        </a>
      ))}
    </div>
  );
}
