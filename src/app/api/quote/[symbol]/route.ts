import { NextResponse } from "next/server";

export const revalidate = 30;

type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
  marketState?: string;
  exchange?: string;
  ts: number;
};

function format(symbol: string, price: number, prevClose: number, currency: string, marketState?: string, exchange?: string): Quote {
  const change = price - prevClose;
  const pct = (change / prevClose) * 100;
  return {
    symbol,
    price: price.toFixed(2),
    change: (change >= 0 ? "+" : "") + change.toFixed(2),
    changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    up: change >= 0,
    currency,
    marketState,
    exchange,
    ts: Date.now(),
  };
}

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GIGASCOPE/1.0)" },
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    if (typeof price !== "number" || typeof prevClose !== "number") return null;
    return format(symbol, price, prevClose, meta.currency ?? "USD", meta.marketState, meta.exchangeName);
  } catch {
    return null;
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await ctx.params;
  // accept "005930-ks" and convert to "005930.KS"
  const symbol = decodeURIComponent(raw).toUpperCase().replace(/-/g, ".");
  const q = await fetchYahoo(symbol);
  if (!q) {
    return NextResponse.json({ error: "upstream", symbol }, { status: 502 });
  }
  return NextResponse.json(q, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}
