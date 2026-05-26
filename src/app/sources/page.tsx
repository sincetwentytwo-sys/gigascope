// /sources — the bibliography page.
//
// Lists every primary-source URL we cite across the site, grouped by
// factory. Built from the same /lib/sources aggregator the methodology
// page references. Exists so a skeptical reader can verify any number on
// the site by clicking through to the original filing.

import type { Metadata } from "next";
import Link from "next/link";
import { getAllSourceGroups, getSourceProviderCounts } from "@/lib/sources";
import { getCompanyMeta } from "@/data/companies";
import { getEmpireStats } from "@/lib/pulse";
import { safeJsonLd } from "@/lib/safeJsonLd";

export const revalidate = 3600;

const SITE_URL = "https://gigascope.xyz";

export const metadata: Metadata = {
  title: "Sources — primary citations behind every number — GIGASCOPE",
  description:
    "The bibliography behind the GIGASCOPE empire scoreboard. Every primary-source URL we cite — FAA filings, SEC EDGAR documents, Travis County permits, NASA mission pages, IR releases — grouped by site so any number can be verified at the original document.",
  alternates: { canonical: `${SITE_URL}/sources` },
  openGraph: {
    title: "Sources — primary citations behind GIGASCOPE",
    description:
      "Every primary-source URL we cite, grouped by site. FAA, SEC EDGAR, Travis County, NASA, IR releases.",
    url: `${SITE_URL}/sources`,
    type: "website",
  },
};

export default function SourcesPage() {
  const groups = getAllSourceGroups();
  const providers = getSourceProviderCounts();
  const stats = getEmpireStats();
  const totalEntries = groups.reduce((s, g) => s + g.entries.length, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GIGASCOPE Sources",
    description: "Bibliography of primary-source citations across the GIGASCOPE empire tracker.",
    url: `${SITE_URL}/sources`,
    isPartOf: { "@type": "WebSite", name: "GIGASCOPE", url: SITE_URL },
    mainEntity: {
      "@type": "Dataset",
      name: "GIGASCOPE primary sources",
      description: `${totalEntries} primary-source URLs cited across ${groups.length} sites.`,
    },
  };

  return (
    <div className="bg-bg text-text">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* Header */}
      <header className="border-b border-border-custom">
        <div className="max-w-[1100px] mx-auto px-6 py-12 sm:py-14">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-3">
            Sources · bibliography
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-[1.05]">
            Every number, every link.
          </h1>
          <p className="text-dim text-base sm:text-lg max-w-2xl leading-relaxed">
            The full bibliography behind the empire scoreboard. {totalEntries} primary-source
            URLs cited across {groups.length} sites. Click through to the original filing if
            you want to verify any single fact yourself.
          </p>
          <p className="text-[11px] font-mono text-dim mt-5">
            Data updated {stats.dataLastUpdated} · methodology at{" "}
            <Link href="/methodology" className="underline hover:text-text">/methodology</Link>
          </p>
        </div>
      </header>

      {/* Provider counts */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1100px] mx-auto px-6 py-8 sm:py-10">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-4">
            Citations by source provider
          </div>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <span
                key={p.provider}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-custom bg-surface text-[12px] font-mono"
              >
                <span className="text-text">{p.provider}</span>
                <span className="text-dim tabular-nums">{p.count}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Per-site bibliography */}
      <section>
        <div className="max-w-[1100px] mx-auto px-6 py-10 sm:py-14 flex flex-col gap-10">
          {groups.map(({ site, entries }) => {
            const meta = getCompanyMeta(site.company);
            return (
              <article
                key={site.slug}
                className="border-l-2 pl-4"
                style={{ borderColor: meta.color }}
              >
                <header className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {site.flag} {site.name}
                  </h2>
                  <span className="text-[10px] uppercase tracking-wider font-mono text-dim">
                    {meta.name}
                  </span>
                  <span className="text-[11px] font-mono text-dim">·</span>
                  <span className="text-[11px] font-mono text-dim tabular-nums">
                    {entries.length} cite{entries.length === 1 ? "" : "s"}
                  </span>
                  <Link
                    href={`/site/${site.slug}`}
                    className="ml-auto text-[12px] text-dim hover:text-text transition-colors"
                  >
                    Site detail →
                  </Link>
                </header>
                <ol className="flex flex-col gap-2.5">
                  {entries.map((e, i) => (
                    <li
                      key={`${site.slug}-${i}`}
                      className="grid grid-cols-[100px_1fr] gap-3 text-sm"
                    >
                      <div className="font-mono text-[10px] text-dim pt-0.5">
                        {e.date ?? "—"}
                      </div>
                      <div className="min-w-0">
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-text underline-offset-2 break-words"
                        >
                          {e.label}
                        </a>
                        <div className="text-[11px] text-dim font-mono break-all mt-0.5">
                          {hostFromUrl(e.url)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <section className="border-t border-border-custom bg-surface">
        <div className="max-w-[1100px] mx-auto px-6 py-8 text-center">
          <p className="text-sm text-dim leading-relaxed max-w-2xl mx-auto">
            See something we miscited?{" "}
            <a
              href="https://github.com/sincetwentytwo-sys/gigascope/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-text"
            >
              Drop an issue
            </a>{" "}
            with the corrected URL and we'll fix.
          </p>
        </div>
      </section>
    </div>
  );
}

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
