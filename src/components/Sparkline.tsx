"use client";

import { useEffect, useState } from "react";

type ChartData = {
  series: { t: number; c: number }[];
  high: number;
  low: number;
  first: number;
  last: number;
};

const RANGES: { id: string; label: string; interval: string }[] = [
  { id: "5d", label: "5D", interval: "30m" },
  { id: "1mo", label: "1M", interval: "1d" },
  { id: "3mo", label: "3M", interval: "1d" },
  { id: "6mo", label: "6M", interval: "1d" },
  { id: "1y", label: "1Y", interval: "1d" },
  { id: "5y", label: "5Y", interval: "1wk" },
];

export default function Sparkline({ symbol, accent = "#0066cc" }: { symbol: string; accent?: string }) {
  const [range, setRange] = useState("1mo");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const r = RANGES.find((x) => x.id === range) ?? RANGES[1];
    const safe = symbol.replace(/\./g, "-").toLowerCase();
    fetch(`/api/chart/${safe}?range=${r.id}&interval=${r.interval}`, { cache: "force-cache" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json && Array.isArray(json.series)) setData(json);
        if (!cancelled) setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [symbol, range]);

  if (loading && !data) {
    return (
      <div className="h-[120px] flex items-center justify-center text-xs text-dim border border-dashed border-border-custom rounded">
        Loading chart…
      </div>
    );
  }
  if (!data || data.series.length < 2) {
    return null;
  }

  const W = 800;
  const H = 120;
  const pad = 4;
  const n = data.series.length;
  const span = Math.max(1e-6, data.high - data.low);
  const points = data.series.map((p, i) => {
    const x = pad + (i / (n - 1)) * (W - 2 * pad);
    const y = pad + (1 - (p.c - data.low) / span) * (H - 2 * pad);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `M ${pad},${H - pad} L ${points.join(" L ")} L ${W - pad},${H - pad} Z`;
  const up = data.last >= data.first;
  const stroke = up ? "#00875a" : "#e63946";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5 text-[11px]">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-1.5 py-0.5 rounded ${range === r.id ? "bg-text text-bg" : "text-dim hover:text-text"}`}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-dim">
          high {data.high.toFixed(2)} · low {data.low.toFixed(2)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${symbol}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${symbol})`} />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
