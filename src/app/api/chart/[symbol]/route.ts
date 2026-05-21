import { NextResponse } from "next/server";

export const revalidate = 600;

type ChartResp = {
  symbol: string;
  range: string;
  interval: string;
  series: { t: number; c: number }[];
  high: number;
  low: number;
  first: number;
  last: number;
  currency: string;
};

async function fetchYahoo(symbol: string, range: string, interval: string): Promise<ChartResp | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`,
      {
        next: { revalidate: 600 },
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GIGASCOPE/1.0)" },
      },
    );
    if (!res.ok) return null;
    const json = await res.json();
    const r = json.chart?.result?.[0];
    if (!r) return null;
    const ts: number[] = r.timestamp ?? [];
    const closes: (number | null)[] = r.indicators?.quote?.[0]?.close ?? [];
    const series: { t: number; c: number }[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = closes[i];
      if (typeof c === "number") series.push({ t: ts[i], c });
    }
    if (series.length === 0) return null;
    const closesOnly = series.map((p) => p.c);
    return {
      symbol,
      range,
      interval,
      series,
      high: Math.max(...closesOnly),
      low: Math.min(...closesOnly),
      first: closesOnly[0],
      last: closesOnly[closesOnly.length - 1],
      currency: r.meta?.currency ?? "USD",
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await ctx.params;
  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "1mo";
  const interval = url.searchParams.get("interval") ?? "1d";
  const symbol = decodeURIComponent(raw).toUpperCase().replace(/-/g, ".");
  const data = await fetchYahoo(symbol, range, interval);
  if (!data) return NextResponse.json({ error: "upstream" }, { status: 502 });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
  });
}
