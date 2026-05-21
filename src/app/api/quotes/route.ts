import { NextResponse } from "next/server";

export const revalidate = 30;

type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
  ts: number;
};

function format(symbol: string, price: number, prevClose: number, currency: string): Quote {
  const change = price - prevClose;
  const pct = (change / prevClose) * 100;
  return {
    symbol,
    price: price.toFixed(2),
    change: (change >= 0 ? "+" : "") + change.toFixed(2),
    changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    up: change >= 0,
    currency,
    ts: Date.now(),
  };
}

async function fetchYahooOne(symbol: string): Promise<Quote | null> {
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
    return format(symbol, price, prevClose, meta.currency ?? "USD");
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("symbols") ?? "";
  const symbols = raw
    .split(",")
    .map((s) => s.trim().toUpperCase().replace(/-/g, "."))
    .filter(Boolean)
    .slice(0, 40); // hard cap

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const results = await Promise.all(symbols.map((s) => fetchYahooOne(s)));
  const quotes = results.filter((q): q is Quote => q !== null);
  return NextResponse.json(
    { quotes },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
  );
}
