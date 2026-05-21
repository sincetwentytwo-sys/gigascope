import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TICKERS, tickerSlugToSymbol, getTicker, getSector, tickerHref } from "@/data/tickers";
import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";
import TickerLivePrice from "@/components/TickerLivePrice";
import TickerNews from "@/components/TickerNews";
import WatchlistButton from "@/components/WatchlistButton";
import Sparkline from "@/components/Sparkline";
import FacilityMapWrapper from "@/components/FacilityMapWrapper";
import { upstreamOf, downstreamOf } from "@/data/supplyChain";

export const revalidate = 1800;

export function generateStaticParams() {
  return TICKERS.map((t) => ({
    slug: t.symbol.toLowerCase().replace(/\./g, "-"),
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const canonical = tickerSlugToSymbol(slug);
  const t = getTicker(canonical);
  if (!t) return { title: "Company — GIGASCOPE" };
  return {
    title: `${t.name} (${t.symbol}) — Facilities, products, supply chain — GIGASCOPE`,
    description: t.thesis,
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonical = tickerSlugToSymbol(slug);
  const t = getTicker(canonical);
  if (!t) return notFound();

  const sectors = t.sectors.map((id) => getSector(id)).filter(Boolean);
  const sites = (t.relatedSites ?? [])
    .map((sl) => factories.find((f) => f.slug === sl))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const productsAll = listProducts();
  const products = (t.relatedProducts ?? [])
    .map((sl) => productsAll.find((p) => p.slug === sl))
    .filter((x): x is NonNullable<typeof x> => !!x);

  const competitors = (t.competitors ?? [])
    .map((c) => getTicker(c))
    .filter((x): x is NonNullable<typeof x> => !!x);

  const upstream = upstreamOf(t.symbol);
  const downstream = downstreamOf(t.symbol);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <a href="/markets" className="text-xs text-dim hover:text-text">← Atlas</a>

      {/* Header */}
      <header className="mt-3 mb-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t.name}</h1>
          {t.koreanName && <span className="text-2xl text-dim">{t.koreanName}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <a href={tickerHref(t)} className="text-xs font-mono px-2 py-1 rounded bg-surface border border-border-custom hover:border-text">
            {t.symbol} · {t.exchange}
          </a>
          <TickerLivePrice symbol={t.symbol} size="md" showSymbol={false} />
          <span className="text-xs text-dim">· HQ {t.hq}</span>
          <span className="ml-auto"><WatchlistButton symbol={t.symbol} /></span>
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
        <div className="flex flex-col gap-10">
          {/* Why this matters */}
          <section>
            <h2 className="text-lg font-bold mb-2">Why this matters</h2>
            <p className="text-[15px] leading-relaxed">{t.thesis}</p>
          </section>

          {/* Price chart */}
          <section>
            <h2 className="text-lg font-bold mb-3">Price (recent)</h2>
            <Sparkline symbol={t.symbol} accent={t.accent ?? "#0066cc"} />
          </section>

          {/* Facilities map */}
          {t.facilities && t.facilities.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-lg font-bold">Facilities</h2>
                <span className="text-[11px] text-dim">{t.facilities.length} sites · satellite via ESRI</span>
              </div>
              <FacilityMapWrapper facilities={t.facilities} height={380} />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {t.facilities.map((f, i) => (
                  <li key={i} className="p-3 rounded border border-border-custom">
                    <div className="text-sm font-bold">{f.flag} {f.name}</div>
                    <div className="text-[11px] text-dim mb-1">{f.city}, {f.country} · {f.status}</div>
                    {f.blurb && <div className="text-xs">{f.blurb}</div>}
                    {f.siteSlug && (
                      <a href={`/site/${f.siteSlug}`} className="text-[11px] underline mt-1 inline-block">Full site dashboard →</a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Products */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Flagship products</h2>
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

          {/* Supply chain */}
          {(upstream.length > 0 || downstream.length > 0) && (
            <section>
              <div className="flex items-end justify-between mb-3">
                <h2 className="text-lg font-bold">Supply chain</h2>
                <a href="/supply-chain" className="text-xs text-dim hover:text-text">Full graph →</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-dim mb-2">Upstream — feeds into {t.symbol}</div>
                  {upstream.length === 0 ? (
                    <div className="text-xs text-dim p-3 rounded border border-dashed border-border-custom">
                      No tracked upstream dependencies yet.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {upstream.map((e, i) => {
                        const from = getTicker(e.from);
                        return (
                          <li key={i} className="p-2.5 rounded border border-border-custom">
                            <div className="flex items-center gap-2 text-sm">
                              {from ? (
                                <a href={`/company/${from.symbol.toLowerCase().replace(/\./g, "-")}`} className="font-mono font-bold hover:underline">{e.from}</a>
                              ) : (<span className="font-mono">{e.from}</span>)}
                              <span className="text-dim">→</span>
                              <span className="text-dim text-xs">{e.criticality}</span>
                            </div>
                            <div className="text-xs text-dim mt-0.5">{e.flow}</div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-dim mb-2">Downstream — {t.symbol} feeds into</div>
                  {downstream.length === 0 ? (
                    <div className="text-xs text-dim p-3 rounded border border-dashed border-border-custom">
                      No tracked downstream customers yet.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {downstream.map((e, i) => {
                        const to = getTicker(e.to);
                        return (
                          <li key={i} className="p-2.5 rounded border border-border-custom">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-dim">→</span>
                              {to ? (
                                <a href={`/company/${to.symbol.toLowerCase().replace(/\./g, "-")}`} className="font-mono font-bold hover:underline">{e.to}</a>
                              ) : (<span className="font-mono">{e.to}</span>)}
                              <span className="text-dim text-xs">{e.criticality}</span>
                            </div>
                            <div className="text-xs text-dim mt-0.5">{e.flow}</div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Adjacent companies (competitors) */}
          {competitors.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Adjacent companies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {competitors.map((c) => (
                  <a
                    key={c.symbol}
                    href={`/company/${c.symbol.toLowerCase().replace(/\./g, "-")}`}
                    className="block p-2.5 rounded border border-border-custom hover:border-text"
                  >
                    <div className="text-sm font-bold">{c.symbol}</div>
                    <div className="text-[11px] text-dim truncate">{c.shortName ?? c.name}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Related Musk-empire sites (if applicable) */}
          {sites.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Related sites tracked here</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sites.map((s) => (
                  <a key={s.slug} href={`/site/${s.slug}`} className="block p-3 rounded border border-border-custom hover:border-text">
                    <div className="text-sm font-bold">{s.flag} {s.name}</div>
                    <div className="text-xs text-dim">{s.location} · {s.status}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* News */}
          <section>
            <h2 className="text-lg font-bold mb-3">Latest news</h2>
            <TickerNews symbol={t.symbol} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5 text-sm">
          <div className="p-4 rounded border border-border-custom">
            <div className="text-xs text-dim mb-2">Snapshot</div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-[13px]">
              <dt className="text-dim">Ticker</dt><dd>{t.symbol}</dd>
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

          {t.sources && t.sources.length > 0 && (
            <div className="p-4 rounded border border-border-custom">
              <div className="text-xs text-dim mb-2">Primary sources</div>
              <ul className="flex flex-col gap-1.5 text-[12px]">
                {t.sources.map((s, i) => (
                  <li key={i} className="leading-snug">
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-text">
                      {s.label}
                    </a>
                    {s.tier && (
                      <span
                        className="ml-1.5 text-[10px] px-1 py-0.5 rounded"
                        style={{
                          background:
                            s.tier === 1 ? "rgba(0,135,90,0.15)" :
                            s.tier === 2 ? "rgba(0,102,204,0.15)" :
                            "rgba(191,86,0,0.15)",
                          color:
                            s.tier === 1 ? "#00875a" :
                            s.tier === 2 ? "#0066cc" :
                            "#bf5600",
                        }}
                      >
                        T{s.tier}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-dim leading-relaxed">
            Atlas data is editorial. Verify everything against primary sources before acting.
            {t.lastVerified && <span> Last verified {t.lastVerified}.</span>}
          </div>
        </aside>
      </div>
    </div>
  );
}
