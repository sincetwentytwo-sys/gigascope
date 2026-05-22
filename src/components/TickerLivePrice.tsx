"use client";

import { useEffect, useState } from "react";

type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
};

export default function TickerLivePrice({
  symbol,
  size = "sm",
  className = "",
  showSymbol = true,
}: {
  symbol: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showSymbol?: boolean;
}) {
  const [q, setQ] = useState<Quote | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // symbol may contain '.' (e.g. "005930.KS"); encode for URL but our route also accepts "-"
        const safe = symbol.replace(/\./g, "-").toLowerCase();
        const res = await fetch(`/api/quote/${safe}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Quote;
        if (!cancelled) setQ(json);
      } catch {}
    };
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol]);

  const px = {
    xs: "text-[11px]",
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-lg",
  }[size];

  if (!q) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-dim ${px} ${className}`}>
        {showSymbol && <span className="font-bold">{symbol}</span>}
        <span className="opacity-60">—</span>
      </span>
    );
  }

  const fmtPrice =
    q.currency === "KRW"
      ? "₩" + Math.round(parseFloat(q.price)).toLocaleString("en-US")
      : (q.currency === "USD" ? "$" : "") + parseFloat(q.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <span className={`inline-flex items-center gap-1.5 ${px} ${className}`}>
      {showSymbol && <span className="font-bold">{symbol}</span>}
      <span>{fmtPrice}</span>
      <span className={q.up ? "text-green-600" : "text-red-500"}>
        {q.change} ({q.changePercent})
      </span>
    </span>
  );
}
