import { NextResponse } from "next/server";

export const revalidate = 2;

type Quote = {
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
};

function format(price: number, prevClose: number): Quote {
  const change = price - prevClose;
  const pct = (change / prevClose) * 100;
  return {
    price: price.toFixed(2),
    change: (change >= 0 ? "+" : "") + change.toFixed(2),
    changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
    up: change >= 0,
  };
}

async function fetchFinnhub(key: string): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=TSLA&token=${key}`,
      { next: { revalidate: 2 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const price = typeof json.c === "number" ? json.c : null;
    const prevClose = typeof json.pc === "number" ? json.pc : null;
    if (price == null || prevClose == null || prevClose === 0) return null;
    return format(price, prevClose);
  } catch {
    return null;
  }
}

async function fetchYahoo(): Promise<Quote | null> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d",
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GIGASCOPE/1.0)" },
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    if (typeof price !== "number" || typeof prevClose !== "number") return null;
    return format(price, prevClose);
  } catch {
    return null;
  }
}

export async function GET() {
  const key = process.env.FINNHUB_API_KEY;
  const quote = (key ? await fetchFinnhub(key) : null) ?? (await fetchYahoo());

  if (!quote) {
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  return NextResponse.json(quote, {
    headers: {
      "Cache-Control": "public, s-maxage=2, stale-while-revalidate=10",
    },
  });
}
