import type { Metadata } from "next";
import { SECTORS, TICKERS, tickersBySector, tickerHref } from "@/data/tickers";
import TickerGrid from "@/components/TickerGrid";
import TopMovers from "@/components/TopMovers";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Markets — Live multi-sector dashboard — GIGASCOPE",
  description:
    "Live heatmap across the Musk Empire + Semis & AI + Quantum + Critical Materials + Defense & Space + Fusion/Nuclear universe.",
};

export default function MarketsPage() {
  const allRows = TICKERS.map((t) => ({
    symbol: t.symbol,
    yahooSymbol: t.yahooSymbol,
    name: t.shortName ?? t.name,
    href: tickerHref(t),
    accent: t.accent,
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Markets</h1>
        <p className="text-dim max-w-2xl">
          Live snapshot across {TICKERS.length} tickers in {SECTORS.length} sectors. Prices via Yahoo Finance, refreshed every 30 seconds.
          Click any cell for the full thesis, catalysts, and news feed.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-3">Top movers</h2>
        <TopMovers rows={allRows} />
      </section>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-xl font-bold">Full universe</h2>
          <a href="/sectors" className="text-xs text-dim hover:text-text">All sectors →</a>
        </div>
        <TickerGrid rows={allRows} />
      </section>

      <section className="flex flex-col gap-10">
        {SECTORS.map((s) => {
          const ts = tickersBySector(s.id);
          if (ts.length === 0) return null;
          const rows = ts.map((t) => ({
            symbol: t.symbol,
            yahooSymbol: t.yahooSymbol,
            name: t.shortName ?? t.name,
            href: tickerHref(t),
            accent: t.accent,
          }));
          return (
            <div key={s.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <h3 className="text-lg font-bold">{s.icon} {s.name}</h3>
                <a href={`/sectors/${s.id}`} className="ml-auto text-xs text-dim hover:text-text">Sector page →</a>
              </div>
              <TickerGrid rows={rows} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
