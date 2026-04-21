"use client";

import { useEffect, useState } from "react";

type TSLAData = {
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
};

export default function StockTicker() {
  const [data, setData] = useState<TSLAData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/tsla", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as TSLAData;
        if (!cancelled) setData(json);
      } catch {
        // ignore
      }
    };

    load();
    const id = setInterval(load, 3_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <a
        href="https://finance.yahoo.com/quote/TSLA"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-dim hover:text-text transition-colors"
      >
        <span className="font-bold">TSLA</span>
        <span>live price ↗</span>
      </a>
    );
  }

  return (
    <a
      href="https://finance.yahoo.com/quote/TSLA"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
    >
      <span className="font-bold">TSLA</span>
      <span>${data.price}</span>
      <span className={data.up ? "text-green-600" : "text-red-500"}>
        {`${data.change} (${data.changePercent})`}
      </span>
    </a>
  );
}
