import { NextResponse } from "next/server";

export const revalidate = 30;

export async function GET() {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d",
      {
        next: { revalidate: 30 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GIGASCOPE/1.0)" },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) {
      return NextResponse.json({ error: "no data" }, { status: 502 });
    }

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    if (typeof price !== "number" || typeof prevClose !== "number") {
      return NextResponse.json({ error: "invalid" }, { status: 502 });
    }

    const change = price - prevClose;
    const pct = (change / prevClose) * 100;

    return NextResponse.json(
      {
        price: price.toFixed(2),
        change: (change >= 0 ? "+" : "") + change.toFixed(2),
        changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
        up: change >= 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
