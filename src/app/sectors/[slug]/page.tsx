import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SECTORS, tickersBySector, getSector, tickerHref } from "@/data/tickers";
import TickerGrid from "@/components/TickerGrid";

export const revalidate = 1800;

export function generateStaticParams() {
  return SECTORS.map((s) => ({ slug: s.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const s = getSector(slug as never);
  if (!s) return { title: "Sector — GIGASCOPE" };
  return {
    title: `${s.name} — Sector intel — GIGASCOPE`,
    description: s.longBlurb,
  };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = getSector(slug as never);
  if (!sector) return notFound();

  const tickers = tickersBySector(sector.id);
  const rows = tickers.map((t) => ({
    symbol: t.symbol,
    yahooSymbol: t.yahooSymbol,
    name: t.shortName ?? t.name,
    href: tickerHref(t),
    accent: t.accent,
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <a href="/sectors" className="text-xs text-dim hover:text-text">← All sectors</a>

      <header
        className="mt-3 mb-8 pl-4"
        style={{ borderLeft: `4px solid ${sector.color}` }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{sector.icon}</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{sector.name}</h1>
        </div>
        <p className="text-dim max-w-3xl">{sector.longBlurb}</p>
      </header>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-bold">Heatmap</h2>
          <span className="text-xs text-dim">{tickers.length} names · live · 30s refresh</span>
        </div>
        <TickerGrid rows={rows} />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Names in this sector</h2>
        <div className="flex flex-col gap-3">
          {tickers.map((t) => (
            <a
              key={t.symbol}
              href={tickerHref(t)}
              className="block p-4 rounded-md border border-border-custom hover:border-text transition-colors"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <span className="font-bold text-base">{t.symbol}</span>
                <span className="text-sm text-dim">{t.name}</span>
                {t.marketCapB != null && (
                  <span className="ml-auto text-xs text-dim tabular-nums">
                    ${t.marketCapB >= 1000 ? `${(t.marketCapB / 1000).toFixed(2)}T` : `${t.marketCapB.toFixed(0)}B`} mkt cap
                  </span>
                )}
              </div>
              <p className="text-sm text-dim">{t.thesis}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
