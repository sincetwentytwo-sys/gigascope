"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
};

type Row = {
  symbol: string;
  yahooSymbol: string;
  name: string;
  href: string;
  accent?: string;
};

function pctNum(q: Quote): number {
  // "+2.34%" → 2.34
  const m = q.changePercent.match(/-?\d+\.?\d*/);
  return m ? parseFloat(m[0]) : 0;
}

export default function TickerGrid({ rows }: { rows: Row[] }) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  const symbolList = useMemo(
    () => rows.map((r) => r.yahooSymbol).join(","),
    [rows],
  );

  useEffect(() => {
    if (!symbolList) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(symbolList)}`, { cache: "no-store" });
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
  }, [symbolList]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {rows.map((r) => {
        const q = quotes[r.yahooSymbol];
        const pct = q ? pctNum(q) : 0;
        // heatmap-ish background color from pct
        const bg = !q
          ? "transparent"
          : pct >= 5
          ? "rgba(0, 135, 90, 0.18)"
          : pct >= 2
          ? "rgba(0, 135, 90, 0.10)"
          : pct >= 0
          ? "rgba(0, 135, 90, 0.04)"
          : pct >= -2
          ? "rgba(230, 57, 70, 0.06)"
          : pct >= -5
          ? "rgba(230, 57, 70, 0.12)"
          : "rgba(230, 57, 70, 0.22)";

        const fmtPrice = q
          ? q.currency === "KRW"
            ? "₩" + Math.round(parseFloat(q.price)).toLocaleString("en-US")
            : (q.currency === "USD" ? "$" : "") + parseFloat(q.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "";
        return (
          <a
            key={r.symbol}
            href={r.href}
            className="block p-3 rounded-md border border-border-custom hover:border-text transition-colors"
            style={{ background: bg }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm tracking-tight">{r.symbol}</span>
              {r.accent && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.accent }} />
              )}
            </div>
            <div className="text-[11px] text-dim truncate mb-2">{r.name}</div>
            {q ? (
              <>
                <div className="text-sm tabular-nums">{fmtPrice}</div>
                <div className={`text-[11px] tabular-nums ${q.up ? "text-green-600" : "text-red-500"}`}>
                  {q.change} ({q.changePercent})
                </div>
              </>
            ) : (
              <div className="text-[11px] text-dim">loading…</div>
            )}
          </a>
        );
      })}
    </div>
  );
}
