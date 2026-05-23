import { fetchAllNews, timeAgo, type RichNewsItem } from "@/lib/rss";
import NewsThumb from "@/components/NewsThumb";

const SOURCE_COLORS: Record<string, string> = {
  Electrek: "bg-green-100 text-green-700",
  Teslarati: "bg-blue-100 text-blue-700",
  InsideEVs: "bg-orange-100 text-orange-700",
  CleanTechnica: "bg-emerald-100 text-emerald-700",
  TorqueNews: "bg-red-100 text-red-700",
  CNBC: "bg-sky-100 text-sky-700",
};

function NewsCard({ item }: { item: RichNewsItem }) {
  const sourceColor = SOURCE_COLORS[item.source] ?? "bg-gray-100 text-gray-600";
  return (
    <article className="border border-border-custom rounded-lg overflow-hidden bg-surface hover:opacity-90 transition">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <NewsThumb src={item.image} source={item.source} />
        <div className="p-4 bg-bg">
          <div className="text-[11px] mb-2 flex items-center gap-2">
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${sourceColor}`}
            >
              {item.source}
            </span>
            <span className="text-dim">·</span>
            <span className="text-dim">{timeAgo(item.timestamp)}</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg leading-snug line-clamp-3 text-text">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="mt-2 text-sm text-dim leading-snug line-clamp-2">
              {item.excerpt}
            </p>
          )}
        </div>
      </a>
    </article>
  );
}

export default async function NewsZigzag() {
  const allItems = await fetchAllNews();

  if (allItems.length === 0) {
    return (
      <p className="text-sm text-dim">
        No news available. See{" "}
        <a
          href="https://electrek.co/guides/tesla/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Electrek
        </a>{" "}
        or{" "}
        <a
          href="https://www.teslarati.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Teslarati
        </a>
        .
      </p>
    );
  }

  const items = allItems.slice(0, 30);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
      {items.map((item, i) => (
        <div
          key={item.link}
          // Right column gets a vertical offset on desktop to create the
          // Threads-style zigzag rhythm. First left-column card sits at
          // the top, first right-column card drops by mt-12. On mobile
          // (single column) the offset is suppressed.
          className={i % 2 === 1 ? "sm:mt-12" : ""}
        >
          <NewsCard item={item} />
        </div>
      ))}
    </div>
  );
}
