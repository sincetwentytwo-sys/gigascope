/**
 * Server-side quote fetcher used by SSR/SSG pages so featured tickers
 * render with prices already populated — no client "loading..." flash.
 */

export type Quote = {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  up: boolean;
  currency: string;
};

async function fetchOne(symbol: string, revalSec: number): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      {
        next: { revalidate: revalSec },
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
    const change = price - prevClose;
    const pct = (change / prevClose) * 100;
    return {
      symbol,
      price: price.toFixed(2),
      change: (change >= 0 ? "+" : "") + change.toFixed(2),
      changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
      up: change >= 0,
      currency: meta.currency ?? "USD",
    };
  } catch {
    return null;
  }
}

/** Fetch multiple quotes in parallel, server-side. */
export async function fetchQuotes(symbols: string[], revalSec = 300): Promise<Record<string, Quote>> {
  const results = await Promise.all(symbols.map((s) => fetchOne(s, revalSec)));
  const map: Record<string, Quote> = {};
  for (const q of results) if (q) map[q.symbol] = q;
  return map;
}

/** Format helper shared with client components. */
export function formatPrice(q: Quote): string {
  return q.currency === "KRW"
    ? "₩" + Math.round(parseFloat(q.price)).toLocaleString("en-US")
    : (q.currency === "USD" ? "$" : "") +
        parseFloat(q.price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
