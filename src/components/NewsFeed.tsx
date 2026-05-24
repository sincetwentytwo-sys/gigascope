import type { NewsItem } from "@/data/types";
import { fetchAllNews } from "@/lib/rss";

// Neutral source badge — one style for every publication. Used to be 11
// different color pills (green / blue / orange / emerald / red / sky /
// amber / yellow / stone / pink / indigo) which read as "sticker book"
// rather than newsroom. Source label stays; only the chrome goes neutral.
const SOURCE_BADGE_CLASS =
  "bg-surface text-dim border border-border-custom text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0";

function NewsItems({ items }: { items: NewsItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 py-2.5 border-b border-border-custom last:border-0 hover:bg-surface -mx-2 px-2 rounded"
        >
          <span className="font-mono text-[10px] text-dim shrink-0 w-12">{item.date}</span>
          <span className={SOURCE_BADGE_CLASS}>
            {item.source}
          </span>
          <span className="text-sm text-dim hover:text-text transition-colors leading-snug flex-1">{item.title}</span>
        </a>
      ))}
    </div>
  );
}

export default async function NewsFeed() {
  const allItems = await fetchAllNews();

  if (allItems.length === 0) {
    return (
      <p className="text-sm text-dim">
        No news available. See{" "}
        <a href="https://electrek.co/guides/tesla/" target="_blank" rel="noopener noreferrer" className="underline">Electrek</a>
        {" "}or{" "}
        <a href="https://www.teslarati.com" target="_blank" rel="noopener noreferrer" className="underline">Teslarati</a>.
      </p>
    );
  }

  return <NewsItems items={allItems.slice(0, 15)} />;
}

export async function FactoryNewsFeed({ keywords }: { keywords: string[] }) {
  const allItems = await fetchAllNews();

  // Factory-specific articles first
  const specific = allItems.filter((item) => {
    const lower = item.title.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  });

  // Fill remaining slots with general Tesla news (excluding duplicates)
  const specificIds = new Set(specific.map((item) => item.title));
  const general = allItems.filter((item) => !specificIds.has(item.title));

  const items = [...specific.slice(0, 10), ...general.slice(0, Math.max(0, 10 - specific.length))]
    .sort((a, b) => b.timestamp - a.timestamp);

  if (items.length === 0) {
    return <p className="text-sm text-dim">No recent news available.</p>;
  }

  return <NewsItems items={items} />;
}
