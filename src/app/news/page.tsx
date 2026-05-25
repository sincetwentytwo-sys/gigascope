import type { Metadata } from "next";
import NewsZigzag from "@/components/NewsZigzag";

// Force dynamic rendering — ISR was caching empty/partial results from
// region-specific background revalidations (Vercel's icn1/Seoul edge was
// hitting publisher WAFs that the iad1/build-region didn't, so the cached
// SSR kept holding 1 article even though the build-time fetch saw 34).
// force-dynamic means every page hit triggers a fresh SSR from Vercel's
// default function region (US East), which has publisher access.
// fetchAllNews still uses next.revalidate=60 internally to dedupe the
// 6 RSS fetches across multiple concurrent visitors → cost is bounded.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — Musk-empire build-out, primary sources — GIGASCOPE",
  description:
    "Tesla, SpaceX, xAI, Neuralink and Boring Company headlines from primary publications (Electrek, Teslarati, InsideEVs, CleanTechnica, TorqueNews, CNBC). No aggregator churn, no off-empire noise.",
  alternates: { canonical: "https://gigascope.xyz/news" },
  openGraph: {
    title: "News — Musk-empire build-out, primary sources — GIGASCOPE",
    description:
      "Tesla, SpaceX, xAI, Neuralink and Boring Company headlines from primary publications. No aggregator churn, no off-empire noise.",
    url: "https://gigascope.xyz/news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News — Musk-empire build-out, primary sources — GIGASCOPE",
    description:
      "Tesla, SpaceX, xAI, Neuralink and Boring Company headlines from primary publications. No aggregator churn, no off-empire noise.",
  },
};

export default function NewsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">News</h1>
        <p className="text-dim max-w-2xl leading-relaxed">
          What counts as news on GIGASCOPE: Musk-empire build-out — Tesla, SpaceX, xAI, Neuralink, Boring Company —
          factory milestones, launches, hardware ships, regulatory turns. Pulled directly from primary publications
          (Electrek, Teslarati, InsideEVs, CleanTechnica, TorqueNews, CNBC); general feeds are keyword-filtered to
          stay on-empire. Latest on top — click any headline for the full story at the source.
        </p>
      </header>

      <NewsZigzag />
    </div>
  );
}
