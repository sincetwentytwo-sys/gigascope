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
};

function pctNum(q: Quote): number {
  const m = q.changePercent.match(/-?\d+\.?\d*/);
  return m ? parseFloat(m[0]) : 0;
}

export default function TopMovers({ rows }: { rows: Row[] }) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  const symbolList = useMemo(() => rows.map((r) => r.yahooSymbol).join(","), [rows]);

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

  const ranked = useMemo(() => {
    return rows
      .map((r) => ({ row: r, q: quotes[r.yahooSymbol] }))
      .filter((x) => !!x.q)
      .sort((a, b) => pctNum(b.q!) - pctNum(a.q!));
  }, [rows, quotes]);

  if (ranked.length === 0) {
    return <div className="text-sm text-dim">Loading movers…</div>;
  }

  const gainers = ranked.filter((x) => pctNum(x.q!) > 0).slice(0, 5);
  const losers = ranked.filter((x) => pctNum(x.q!) < 0).slice(-5).reverse();

  const Cell = ({ row, q }: { row: Row; q: Quote }) => {
    const cp = q.currency === "USD" ? "$" : q.currency === "KRW" ? "₩" : "";
    return (
      <a
        href={row.href}
        className="flex items-center justify-between gap-3 p-2 rounded hover:bg-surface transition-colors"
      >
        <div className="min-w-0">
          <div className="text-sm font-bold">{row.symbol}</div>
          <div className="text-[11px] text-dim truncate">{row.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm tabular-nums">{cp}{q.price}</div>
          <div className={`text-[11px] tabular-nums ${q.up ? "text-green-600" : "text-red-500"}`}>
            {q.changePercent}
          </div>
        </div>
      </a>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-3 rounded-md border border-border-custom">
        <div className="text-xs uppercase tracking-wide text-green-600 font-bold mb-2">Top gainers</div>
        <div className="flex flex-col">
          {gainers.length === 0 && <div className="text-sm text-dim p-2">No gainers in tracked names.</div>}
          {gainers.map((g) => <Cell key={g.row.symbol} row={g.row} q={g.q!} />)}
        </div>
      </div>
      <div className="p-3 rounded-md border border-border-custom">
        <div className="text-xs uppercase tracking-wide text-red-500 font-bold mb-2">Top losers</div>
        <div className="flex flex-col">
          {losers.length === 0 && <div className="text-sm text-dim p-2">No losers in tracked names.</div>}
          {losers.map((l) => <Cell key={l.row.symbol} row={l.row} q={l.q!} />)}
        </div>
      </div>
    </div>
  );
}
