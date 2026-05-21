"use client";

import { useEffect, useState } from "react";

type Item = {
  title: string;
  link: string;
  source: string;
  pubDate: string;
};

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export default function TickerNews({ symbol }: { symbol: string }) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const safe = symbol.replace(/\./g, "-");
        const res = await fetch(`/api/news?symbol=${encodeURIComponent(safe)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { items: Item[] };
        if (!cancelled) setItems(json.items);
      } catch {}
    };
    load();
  }, [symbol]);

  if (items === null) {
    return <div className="text-sm text-dim">Loading news…</div>;
  }
  if (items.length === 0) {
    return <div className="text-sm text-dim">No recent news available for {symbol}.</div>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.slice(0, 10).map((it, i) => (
        <li key={i} className="border-b border-border-custom pb-2 last:border-0">
          <a href={it.link} target="_blank" rel="noopener noreferrer" className="block group">
            <div className="text-sm group-hover:underline">{it.title}</div>
            <div className="text-[11px] text-dim mt-0.5">
              {it.source} · {timeAgo(it.pubDate)} ago
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
