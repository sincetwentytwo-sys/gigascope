"use client";

import { useEffect, useMemo, useState } from "react";
import { TICKERS, getTicker, tickerHref } from "@/data/tickers";
import { readWatchlist, writeWatchlist } from "@/components/WatchlistButton";

type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
};

export default function WatchlistClient() {
  const [list, setList] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setList(readWatchlist());
    sync();
    setHydrated(true);
    window.addEventListener("gigascope:watchlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("gigascope:watchlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const validTickers = useMemo(
    () => list.map((s) => getTicker(s)).filter((t): t is NonNullable<typeof t> => !!t),
    [list],
  );
  const yahooSymbols = useMemo(() => validTickers.map((t) => t.yahooSymbol).join(","), [validTickers]);

  useEffect(() => {
    if (!yahooSymbols) {
      setQuotes({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(yahooSymbols)}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { quotes: Quote[] };
        if (cancelled) return;
        const map: Record<string, Quote> = {};
        for (const q of json.quotes) map[q.symbol] = q;
        setQuotes(map);
      } catch {}
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [yahooSymbols]);

  if (!hydrated) {
    return <div className="text-dim text-sm">Loading watchlist…</div>;
  }

  if (validTickers.length === 0) {
    return (
      <div className="p-8 rounded-lg border border-dashed border-border-custom text-center">
        <div className="text-dim text-sm mb-4">Your watchlist is empty.</div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-dim">Quick-add featured:</span>
          {TICKERS.filter((t) => t.featured).slice(0, 6).map((t) => (
            <button
              key={t.symbol}
              onClick={() => {
                const cur = readWatchlist();
                writeWatchlist([...cur, t.symbol]);
              }}
              className="text-[11px] font-mono px-2 py-0.5 rounded border border-border-custom hover:border-text"
            >
              + {t.symbol}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <a href="/markets" className="text-sm underline">Browse the full universe →</a>
        </div>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-[11px] uppercase text-dim border-b border-border-custom">
        <tr>
          <th className="py-2">Symbol</th>
          <th className="py-2">Name</th>
          <th className="py-2 text-right">Price</th>
          <th className="py-2 text-right">Change %</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody>
        {validTickers.map((t) => {
          const q = quotes[t.yahooSymbol];
          const cp = q?.currency === "USD" ? "$" : q?.currency === "KRW" ? "₩" : "";
          return (
            <tr key={t.symbol} className="border-b border-border-custom">
              <td className="py-2.5">
                <a href={tickerHref(t)} className="font-bold hover:underline">{t.symbol}</a>
              </td>
              <td className="py-2.5 text-dim">{t.shortName ?? t.name}</td>
              <td className="py-2.5 text-right tabular-nums">{q ? `${cp}${q.price}` : "—"}</td>
              <td className={`py-2.5 text-right tabular-nums ${q ? (q.up ? "text-green-600" : "text-red-500") : ""}`}>
                {q ? q.changePercent : "—"}
              </td>
              <td className="py-2.5 text-right">
                <button
                  onClick={() => {
                    const cur = readWatchlist();
                    writeWatchlist(cur.filter((s) => s !== t.symbol));
                  }}
                  className="text-[11px] text-dim hover:text-red-500"
                  title="Remove from watchlist"
                >
                  remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
