async function getTSLAPrice(): Promise<{ price: string; change: string; changePercent: string; up: boolean } | null> {
  try {
    // Yahoo Finance API (free, no key required)
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?interval=1d&range=1d",
      { next: { revalidate: 300 } } // 5min cache
    );
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    const change = price - prevClose;
    const pct = (change / prevClose) * 100;

    return {
      price: price.toFixed(2),
      change: (change >= 0 ? "+" : "") + change.toFixed(2),
      changePercent: (change >= 0 ? "+" : "") + pct.toFixed(2) + "%",
      up: change >= 0,
    };
  } catch {
    return null;
  }
}

export default async function StockTicker() {
  const data = await getTSLAPrice();
  if (!data) return null;

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
        {data.change} ({data.changePercent})
      </span>
    </a>
  );
}
