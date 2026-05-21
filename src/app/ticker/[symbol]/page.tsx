import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TICKERS, tickerSlugToSymbol, getTicker, getSector, tickerHref } from "@/data/tickers";
import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";
import TickerLivePrice from "@/components/TickerLivePrice";
import TickerNews from "@/components/TickerNews";

export const revalidate = 1800;

export function generateStaticParams() {
  return TICKERS.map((t) => ({
    symbol: t.symbol.toLowerCase().replace(/\./g, "-"),
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ symbol: string }> },
): Promise<Metadata> {
  const { symbol } = await params;
  const canonical = tickerSlugToSymbol(symbol);
  const t = getTicker(canonical);
  if (!t) return { title: "Ticker — GIGASCOPE" };
  return {
    title: `${t.symbol} ${t.shortName ?? t.name} — Live price, thesis, catalysts — GIGASCOPE`,
    description: t.thesis,
  };
}

export default async function TickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await params;
  const canonical = tickerSlugToSymbol(raw);
  const t = getTicker(canonical);
  if (!t) return notFound();

  const sectors = t.sectors.map((id) => getSector(id)).filter(Boolean);
  const sites = (t.relatedSites ?? [])
    .map((slug) => factories.find((f) => f.slug === slug))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const productsAll = listProducts();
  const products = (t.relatedProducts ?? [])
    .map((slug) => productsAll.find((p) => p.slug === slug))
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <a href="/sectors" className="text-xs text-dim hover:text-text">← Sectors</a>

      <header className="mt-3 mb-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t.symbol}</h1>
          <span className="text-xl text-dim">{t.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TickerLivePrice symbol={t.symbol} size="lg" showSymbol={false} />
          <span className="text-xs text-dim">· {t.exchange} · {t.hq}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sectors.map((s) => s && (
            <a
              key={s.id}
              href={`/sectors/${s.id}`}
              className="text-[11px] px-2 py-0.5 rounded border border-border-custom hover:border-text"
              style={{ borderLeftWidth: 3, borderLeftColor: s.color }}
            >
              {s.icon} {s.name}
            </a>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-8">
          {/* Thesis */}
          <section>
            <h2 className="text-lg font-bold mb-2">Thesis</h2>
            <p className="text-[15px] leading-relaxed">{t.thesis}</p>
          </section>

          {/* Bull / Bear */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-md border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: "#00875a" }}>
              <h3 className="text-sm font-bold mb-2 text-green-600">Bull case</h3>
              <ul className="text-sm flex flex-col gap-1.5 list-disc pl-4">
                {t.bullCase.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-md border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: "#e63946" }}>
              <h3 className="text-sm font-bold mb-2 text-red-500">Bear case</h3>
              <ul className="text-sm flex flex-col gap-1.5 list-disc pl-4">
                {t.bearCase.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </section>

          {/* Catalysts */}
          {t.catalysts && t.catalysts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Upcoming catalysts</h2>
              <div className="flex flex-col gap-2">
                {t.catalysts.map((c, i) => (
                  <div key={i} className="flex items-baseline gap-3 p-3 rounded border border-border-custom">
                    <span className="text-[11px] font-mono text-dim w-20 flex-shrink-0">{c.date}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{c.label}</div>
                      {c.blurb && <div className="text-xs text-dim mt-0.5">{c.blurb}</div>}
                    </div>
                    {c.confidence && (
                      <span
                        className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{
                          background:
                            c.confidence === "high" ? "rgba(0,135,90,0.15)" :
                            c.confidence === "medium" ? "rgba(0,102,204,0.15)" :
                            c.confidence === "low" ? "rgba(191,86,0,0.15)" :
                            "rgba(123,45,189,0.15)",
                          color:
                            c.confidence === "high" ? "#00875a" :
                            c.confidence === "medium" ? "#0066cc" :
                            c.confidence === "low" ? "#bf5600" :
                            "#7b2dbd",
                        }}
                      >
                        {c.confidence}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* News */}
          <section>
            <h2 className="text-lg font-bold mb-3">Latest news</h2>
            <TickerNews symbol={t.symbol} />
          </section>

          {/* Related sites */}
          {sites.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Related sites</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sites.map((s) => (
                  <a
                    key={s.slug}
                    href={`/site/${s.slug}`}
                    className="block p-3 rounded border border-border-custom hover:border-text"
                  >
                    <div className="text-sm font-bold">{s.flag} {s.name}</div>
                    <div className="text-xs text-dim">{s.location} · {s.status}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Related products */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Related products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <a
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="block p-3 rounded border border-border-custom hover:border-text"
                  >
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-xs text-dim">{p.category}</div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5 text-sm">
          <div className="p-4 rounded border border-border-custom">
            <div className="text-xs text-dim mb-2">Snapshot</div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-[13px]">
              <dt className="text-dim">Exchange</dt><dd>{t.exchange}</dd>
              <dt className="text-dim">HQ</dt><dd>{t.hq}</dd>
              {t.ceo && (<><dt className="text-dim">CEO</dt><dd>{t.ceo}</dd></>)}
              {t.founded && (<><dt className="text-dim">Founded</dt><dd>{t.founded}</dd></>)}
              {t.marketCapB != null && (
                <>
                  <dt className="text-dim">Mkt cap</dt>
                  <dd>
                    ${t.marketCapB >= 1000 ? `${(t.marketCapB / 1000).toFixed(2)}T` : `${t.marketCapB.toFixed(0)}B`}
                    {t.marketCapAsOf && <span className="text-dim text-[11px]"> · {t.marketCapAsOf}</span>}
                  </dd>
                </>
              )}
              {t.website && (
                <>
                  <dt className="text-dim">Web</dt>
                  <dd><a href={t.website} target="_blank" rel="noreferrer" className="underline">{t.website.replace(/^https?:\/\//, "")}</a></dd>
                </>
              )}
            </dl>
          </div>

          {t.metrics && t.metrics.length > 0 && (
            <div className="p-4 rounded border border-border-custom">
              <div className="text-xs text-dim mb-2">Key metrics</div>
              <dl className="flex flex-col gap-1.5 text-[13px]">
                {t.metrics.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3">
                    <dt className="text-dim">{m.label}</dt>
                    <dd className="font-mono text-right">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {t.competitors && t.competitors.length > 0 && (
            <div className="p-4 rounded border border-border-custom">
              <div className="text-xs text-dim mb-2">Competitors</div>
              <div className="flex flex-wrap gap-1.5">
                {t.competitors.map((c) => {
                  const peer = getTicker(c);
                  if (!peer) return (
                    <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-custom text-dim">
                      {c}
                    </span>
                  );
                  return (
                    <a
                      key={c}
                      href={tickerHref(peer)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-custom hover:border-text"
                    >
                      {c}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-[11px] text-dim leading-relaxed">
            Data is reference/editorial only. Not investment advice. Always verify with a primary source before acting.
            {t.lastVerified && <span> Last verified {t.lastVerified}.</span>}
          </div>
        </aside>
      </div>
    </div>
  );
}
