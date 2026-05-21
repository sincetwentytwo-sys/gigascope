"use client";

import { useEffect, useState } from "react";

const KEY = "gigascope.watchlist.v1";

export function readWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(list: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(list))));
    window.dispatchEvent(new Event("gigascope:watchlist-change"));
  } catch {}
}

export default function WatchlistButton({ symbol }: { symbol: string }) {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    const sync = () => setOn(readWatchlist().includes(symbol));
    sync();
    window.addEventListener("gigascope:watchlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gigascope:watchlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [symbol]);

  if (on === null) return null;

  const toggle = () => {
    const cur = readWatchlist();
    const next = on ? cur.filter((s) => s !== symbol) : [...cur, symbol];
    writeWatchlist(next);
    setOn(!on);
  };

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border-custom hover:border-text transition-colors"
      title={on ? "Remove from watchlist" : "Add to watchlist"}
    >
      <span style={{ color: on ? "#f5a623" : "currentColor" }}>{on ? "★" : "☆"}</span>
      {on ? "Watching" : "Add to watchlist"}
    </button>
  );
}
