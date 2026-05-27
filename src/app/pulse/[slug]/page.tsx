// /pulse/[slug] — AI-augmented inference articles.
//
// Pure static (SSG) — `generateStaticParams` enumerates every analysis at
// build time. Revalidates every 30 min so a redeploy or fresh
// `analyses.json` lands within half an hour without manual purge.
//
// Each page renders: kicker → title → metadata strip (publishedAt +
// confidence badge) → factoryRef chips → markdown body → sources block.
// Confidence badges are color-coded (verified=green, medium=amber,
// speculative=red) using the project's existing accent tokens.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { analyses, getAnalysisBySlug } from "@/data/analyses";
import { getFactory } from "@/data/factories";
import { safeJsonLd } from "@/lib/safeJsonLd";

export const revalidate = 1800; // 30 min

const SITE_URL = "https://gigascope.xyz";

export function generateStaticParams() {
  return analyses.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getAnalysisBySlug(slug);
  if (!a) return { title: "Analysis — GIGASCOPE" };
  const url = `${SITE_URL}/pulse/${a.slug}`;
  return {
    title: `${a.title} — GIGASCOPE`,
    description: a.kicker,
    alternates: { canonical: url },
    openGraph: {
      title: a.title,
      description: a.kicker,
      url,
      type: "article",
      publishedTime: a.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.kicker,
    },
  };
}

// Color-coded confidence badge. Maps to existing accent tokens so it
// inherits the project's light-theme palette without hardcoding hexes.
function confidenceStyle(c: "verified" | "medium" | "speculative") {
  switch (c) {
    case "verified":
      return { color: "var(--green)", label: "Verified" };
    case "medium":
      return { color: "var(--amber)", label: "Medium confidence" };
    case "speculative":
      return { color: "var(--red)", label: "Speculative" };
  }
}

function formatPublished(iso: string): string {
  // YYYY-MM-DD form — short, locale-agnostic. Avoids hydration mismatch
  // that you'd get from toLocaleDateString().
  return iso.slice(0, 10);
}

export default async function PulseArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getAnalysisBySlug(slug);
  if (!a) notFound();

  const conf = confidenceStyle(a.confidence);
  const url = `${SITE_URL}/pulse/${a.slug}`;

  // Resolve factoryRefs → real names so the chips show readable labels
  // instead of raw slugs. Falls back to a title-cased slug if the ref
  // doesn't exist (defensive — analyses.json should always match).
  const factoryChips = a.factoryRefs.map((ref) => {
    const f = getFactory(ref);
    return {
      slug: ref,
      name: f?.name ?? ref.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    datePublished: a.publishedAt,
    author: { "@type": "Organization", name: "GIGASCOPE" },
    publisher: { "@type": "Organization", name: "GIGASCOPE" },
    url,
    keywords: a.tags.join(", "),
  };

  return (
    <div className="bg-bg text-text min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <article className="max-w-[760px] mx-auto px-6 py-10 sm:py-16">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/pulse" className="text-dim hover:text-text transition-colors">
            &larr; Pulse
          </Link>
        </div>

        {/* Kicker */}
        <div className="text-[11px] uppercase tracking-widest font-mono text-dim mb-3">
          {a.kicker}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-[1.15] mb-5">
          {a.title}
        </h1>

        {/* Metadata strip: published date + confidence badge */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-[11px] font-mono">
          <time dateTime={a.publishedAt} className="text-dim">
            {formatPublished(a.publishedAt)}
          </time>
          <span className="text-border-custom">·</span>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded uppercase tracking-wider font-bold"
            style={{ background: `${conf.color}15`, color: conf.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: conf.color }}
            />
            {conf.label}
          </span>
        </div>

        {/* Factory chips — link to the sites this analysis covers */}
        {factoryChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {factoryChips.map((c) => (
              <Link
                key={c.slug}
                href={`/site/${c.slug}`}
                className="font-mono text-[11px] px-2 py-1 border border-border-custom hover:border-text text-text transition-colors"
              >
                {c.name} &rarr;
              </Link>
            ))}
          </div>
        )}

        {/* Markdown body. Component overrides map every tag we expect
            to use onto the project's typography tokens so we don't need
            a global prose stylesheet. Anything not listed falls back to
            the raw tag, which inherits .text/.bg-bg from the wrapper. */}
        <div className="text-text">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-10 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base sm:text-lg font-semibold tracking-tight mt-8 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-[15px] leading-relaxed text-text mb-5">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-5 mb-5 space-y-2 text-[15px] leading-relaxed">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-5 mb-5 space-y-2 text-[15px] leading-relaxed">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="text-text">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-dim"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-text">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="font-mono text-[13px] px-1 py-0.5 bg-surface border border-border-custom rounded">
                  {children}
                </code>
              ),
            }}
          >
            {a.bodyMarkdown}
          </ReactMarkdown>
        </div>

        {/* Sources */}
        {a.sources.length > 0 && (
          <section
            aria-label="Sources"
            className="mt-12 pt-6 border-t border-border-custom"
          >
            <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-4">
              Sources
            </div>
            <ol className="space-y-2 text-[13px]">
              {a.sources.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono text-dim tabular-nums shrink-0">
                    [{i + 1}]
                  </span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-dim break-words"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  );
}
