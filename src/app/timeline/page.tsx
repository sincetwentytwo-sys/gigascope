import type { Metadata } from "next";
import { factories } from "@/data/factories";
import TimelineContent from "@/components/TimelineContent";

export const metadata: Metadata = {
  title: "Timeline — Construction milestones across Musk-empire sites — GIGASCOPE",
  description:
    "Date-sorted construction milestones from Tesla Gigafactories, SpaceX sites, xAI Colossus, Neuralink, and The Boring Company — primary-source citations.",
  alternates: { canonical: "https://gigascope.xyz/timeline" },
  openGraph: {
    title: "Timeline — Construction milestones across Musk-empire sites — GIGASCOPE",
    description:
      "Date-sorted construction milestones from Tesla Gigafactories, SpaceX sites, xAI Colossus, Neuralink, and The Boring Company — primary-source citations.",
    url: "https://gigascope.xyz/timeline",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timeline — Construction milestones across Musk-empire sites — GIGASCOPE",
    description:
      "Date-sorted construction milestones from Tesla Gigafactories, SpaceX sites, xAI Colossus, Neuralink, and The Boring Company — primary-source citations.",
  },
};

function getAllMilestones() {
  const all = factories.flatMap((f) =>
    f.milestones.map((m) => ({ factory: f, ...m }))
  );
  return all.sort((a, b) => {
    const da = a.date.replace(/Q\d|H\d/g, "").trim();
    const db = b.date.replace(/Q\d|H\d/g, "").trim();
    return db.localeCompare(da);
  });
}

export default function TimelinePage() {
  const milestones = getAllMilestones();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Global Timeline</h1>
        <p className="text-dim text-sm">
          All milestones across {factories.length} sites — past and projected.
        </p>
      </div>

      <TimelineContent factories={factories} milestones={milestones} />
    </div>
  );
}
