"use client";

import { useEffect, useRef, useState } from "react";

type TSLAData = {
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
};

function format(price: number, prevClose: number): TSLAData {
  const change = price - prevClose;
  const pct = (change / prevClose) * 100;
  return {
    price: price.toFixed(2),
    change: (change >= 0 ? "+" : "") + change.toFixed(2),
    changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    up: change >= 0,
  };
}

export default function StockTicker() {
  const [data, setData] = useState<TSLAData | null>(null);
  const prevCloseRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let ws: WebSocket | null = null;
    let pollId: ReturnType<typeof setInterval> | null = null;

    const loadInitial = async () => {
      try {
        const res = await fetch("/api/tsla", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as TSLAData;
        if (cancelled) return;
        setData(json);
        const price = parseFloat(json.price);
        const change = parseFloat(json.change);
        if (Number.isFinite(price) && Number.isFinite(change)) {
          prevCloseRef.current = price - change;
        }
      } catch {
        // ignore
      }
    };

    const key = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    const connectWS = () => {
      if (!key) return false;
      try {
        ws = new WebSocket(`wss://ws.finnhub.io?token=${key}`);
        ws.onopen = () => {
          ws?.send(JSON.stringify({ type: "subscribe", symbol: "TSLA" }));
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type !== "trade" || !Array.isArray(msg.data) || msg.data.length === 0) return;
            const latest = msg.data[msg.data.length - 1];
            const price = typeof latest.p === "number" ? latest.p : null;
            const prev = prevCloseRef.current;
            if (price == null || prev == null) return;
            setData(format(price, prev));
          } catch {
            // ignore parse errors
          }
        };
        ws.onerror = () => {
          if (!pollId) pollId = setInterval(loadInitial, 30_000);
        };
        return true;
      } catch {
        return false;
      }
    };

    (async () => {
      await loadInitial();
      if (cancelled) return;
      const wsStarted = connectWS();
      if (!wsStarted) {
        pollId = setInterval(loadInitial, 30_000);
      }
    })();

    return () => {
      cancelled = true;
      if (ws) {
        try { ws.send(JSON.stringify({ type: "unsubscribe", symbol: "TSLA" })); } catch {}
        ws.close();
      }
      if (pollId) clearInterval(pollId);
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
