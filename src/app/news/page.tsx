import type { Metadata } from "next";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 1800;

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
          stay on-empire. No Yahoo Finance aggregation, no Canopy Growth, no off-thesis tickers. Latest on top —
          click any headline for the full story at the source.
        </p>
      </header>

      <NewsFeed />
    </div>
  );
}
