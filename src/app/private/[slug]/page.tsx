import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPrivateCompanies, getPrivateCompany } from "@/data/privateCompanies";
import { getSector, getTicker, tickerHref } from "@/data/tickers";
import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";
import FacilityMapWrapper from "@/components/FacilityMapWrapper";

export const revalidate = 1800;

export function generateStaticParams() {
  return listPrivateCompanies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const c = getPrivateCompany(slug);
  if (!c) return { title: "Private company — GIGASCOPE" };
  return {
    title: `${c.name} — facilities, thesis, sources (private) — GIGASCOPE`,
    description: c.thesis,
  };
}

export default async function PrivateCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getPrivateCompany(slug);
  if (!c) return notFound();

  const sectors = c.sectors.map((id) => getSector(id)).filter(Boolean);
  const sites = (c.relatedSites ?? [])
    .map((sl) => factories.find((f) => f.slug === sl))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const productsAll = listProducts();
  const products = (c.relatedProducts ?? [])
    .map((sl) => productsAll.find((p) => p.slug === sl))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const peers = (c.relatedTickers ?? [])
    .map((s) => getTicker(s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <a href="/private" className="text-xs text-dim hover:text-text">← Private companies</a>

      <header className="mt-3 mb-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{c.name}</h1>
          {c.koreanName && <span className="text-2xl text-dim">{c.koreanName}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-dim">
          <span className="text-[11px] uppercase tracking-wide px-2 py-0.5 rounded bg-surface border border-border-custom">Private</span>
          <span>HQ {c.hq}</span>
          {c.valuationB != null && (
            <span className="ml-auto">
              ~${c.valuationB}B <span className="text-[11px]">est.</span>
              {c.valuationAsOf && <span> · {c.valuationAsOf}</span>}
            </span>
          )}
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
          <section>
            <h2 className="text-lg font-bold mb-2">Why this matters</h2>
            <p className="text-[15px] leading-relaxed">{c.thesis}</p>
            {c.deepDive && (
              <p className="text-[14px] leading-relaxed text-dim mt-4 whitespace-pre-line">{c.deepDive}</p>
            )}
          </section>

          {c.facilities && c.facilities.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Facilities</h2>
              <FacilityMapWrapper facilities={c.facilities} height={360} />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {c.facilities.map((f, i) => (
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

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-md border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: "#00875a" }}>
              <h3 className="text-sm font-bold mb-2 text-green-600">Bull case</h3>
              <ul className="text-sm flex flex-col gap-1.5 list-disc pl-4">
                {c.bullCase.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div className="p-4 rounded-md border border-border-custom" style={{ borderLeftWidth: 4, borderLeftColor: "#e63946" }}>
              <h3 className="text-sm font-bold mb-2 text-red-500">Bear case</h3>
              <ul className="text-sm flex flex-col gap-1.5 list-disc pl-4">
                {c.bearCase.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          </section>

          {c.catalysts && c.catalysts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Catalysts</h2>
              <div className="flex flex-col gap-2">
                {c.catalysts.map((cat, i) => (
                  <div key={i} className="flex items-baseline gap-3 p-3 rounded border border-border-custom">
                    <span className="text-[11px] font-mono text-dim w-20">{cat.date}</span>
                    <div className="text-sm flex-1">{cat.label}</div>
                    {cat.confidence && (
                      <span className="text-[10px] uppercase text-dim">{cat.confidence}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {peers.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Public-market peers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {peers.map((p) => (
                  <a
                    key={p.symbol}
                    href={tickerHref(p)}
                    className="block p-2.5 rounded border border-border-custom hover:border-text"
                  >
                    <div className="text-sm font-bold">{p.symbol}</div>
                    <div className="text-[11px] text-dim truncate">{p.shortName ?? p.name}</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {sites.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Related sites</h2>
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

          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-3">Related products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((p) => (
                  <a key={p.slug} href={`/products/${p.slug}`} className="block p-3 rounded border border-border-custom hover:border-text">
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-xs text-dim">{p.category}</div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-5 text-sm">
          <div className="p-4 rounded border border-border-custom">
            <div className="text-xs text-dim mb-2">Snapshot</div>
            <dl className="grid grid-cols-[110px_1fr] gap-y-1 text-[13px]">
              <dt className="text-dim">Status</dt><dd>Private</dd>
              <dt className="text-dim">HQ</dt><dd>{c.hq}</dd>
              {c.ceo && (<><dt className="text-dim">CEO</dt><dd>{c.ceo}</dd></>)}
              {c.founded && (<><dt className="text-dim">Founded</dt><dd>{c.founded}</dd></>)}
              {c.valuationB != null && (
                <>
                  <dt className="text-dim">Valuation (est.)</dt>
                  <dd>~${c.valuationB}B · {c.valuationAsOf}</dd>
                </>
              )}
              {c.website && (
                <>
                  <dt className="text-dim">Web</dt>
                  <dd><a href={c.website} target="_blank" rel="noreferrer" className="underline">{c.website.replace(/^https?:\/\//, "")}</a></dd>
                </>
              )}
            </dl>
          </div>

          {c.valuationSource && (
            <div className="p-4 rounded border border-border-custom">
              <div className="text-xs text-dim mb-1.5">Valuation source</div>
              <div className="text-[12px] text-dim leading-relaxed">{c.valuationSource}</div>
            </div>
          )}

          {c.sources && c.sources.length > 0 && (
            <div className="p-4 rounded border border-border-custom">
              <div className="text-xs text-dim mb-2">Primary sources</div>
              <ul className="flex flex-col gap-1.5 text-[12px]">
                {c.sources.map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-text">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[11px] text-dim leading-relaxed">
            Private-company data is editorial; valuations are estimates from public secondary prints + journalist scoops.
            Verify with primary funding-round disclosures before acting on any number.
          </div>
        </aside>
      </div>
    </div>
  );
}
