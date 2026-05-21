import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEARN, getLearn } from "@/data/learn";
import { getTicker, tickerHref } from "@/data/tickers";

export const revalidate = 3600;

export function generateStaticParams() {
  return LEARN.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const e = getLearn(slug);
  if (!e) return { title: "Learn — GIGASCOPE" };
  return {
    title: `${e.term} — first-principles explainer — GIGASCOPE`,
    description: e.oneLiner,
  };
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getLearn(slug);
  if (!e) return notFound();

  const tickers = (e.relatedTickers ?? [])
    .map((s) => getTicker(s))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const terms = (e.relatedTerms ?? [])
    .map((s) => getLearn(s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      <a href="/learn" className="text-xs text-dim hover:text-text">← Learn</a>

      <header className="mt-3 mb-8">
        <div className="text-[11px] uppercase tracking-wider text-dim mb-2">{e.category}</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{e.term}</h1>
        <p className="text-lg text-dim">{e.oneLiner}</p>
      </header>

      <article className="prose-tight">
        {e.body.split(/\n\n+/).map((para, i) => (
          <p key={i} className="text-[15px] leading-relaxed mb-4 whitespace-pre-line">{para}</p>
        ))}
      </article>

      {tickers.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-wider text-dim mb-3">Companies that pay rent on this layer</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tickers.map((t) => (
              <a
                key={t.symbol}
                href={tickerHref(t)}
                className="block p-3 rounded border border-border-custom hover:border-text"
                style={{ borderLeftWidth: 3, borderLeftColor: t.accent ?? "#86868b" }}
              >
                <div className="text-sm font-bold">{t.symbol}</div>
                <div className="text-[11px] text-dim truncate">{t.shortName ?? t.name}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {terms.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm uppercase tracking-wider text-dim mb-3">Related terms</h2>
          <div className="flex flex-wrap gap-2">
            {terms.map((t) => (
              <a
                key={t.slug}
                href={`/learn/${t.slug}`}
                className="text-sm px-2.5 py-1 rounded border border-border-custom hover:border-text"
              >
                {t.term}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
