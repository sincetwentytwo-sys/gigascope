import type { Metadata } from "next";
import { LEARN } from "@/data/learn";

export const metadata: Metadata = {
  title: "Learn — Frontier-tech glossary — GIGASCOPE",
  description:
    "First-principles explainers on HBM, EUV, GAA, CoWoS, FSD/Robotaxi, hyperscaler capex, qubits, rare earths, LFP vs NMC, SMR. Linked back to the companies that own each layer.",
};

const CATEGORY_LABEL: Record<string, string> = {
  semiconductors: "Semiconductors",
  compute: "AI compute",
  autonomy: "Autonomy",
  energy: "Energy",
  materials: "Materials",
  space: "Space",
  quantum: "Quantum",
};

const CATEGORY_COLOR: Record<string, string> = {
  semiconductors: "#76b900",
  compute: "#0066cc",
  autonomy: "#e31937",
  energy: "#00875a",
  materials: "#bf5600",
  space: "#005288",
  quantum: "#7b2dbd",
};

export default function LearnHub() {
  const byCategory: Map<string, typeof LEARN> = new Map();
  for (const e of LEARN) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, [] as never);
    byCategory.get(e.category)!.push(e);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Learn</h1>
        <p className="text-dim max-w-2xl">
          First-principles explainers on the technical concepts behind the Atlas. What HBM actually is. Why ASML's EUV is a monopoly. What CoWoS-L means for NVIDIA shipments. No marketing copy.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {Array.from(byCategory.entries()).map(([cat, entries]) => (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLOR[cat] ?? "#86868b" }} />
              <h2 className="text-lg font-bold">{CATEGORY_LABEL[cat] ?? cat}</h2>
              <span className="text-xs text-dim">{entries.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entries.map((e) => (
                <a
                  key={e.slug}
                  href={`/learn/${e.slug}`}
                  className="block p-4 rounded border border-border-custom hover:border-text"
                >
                  <div className="text-sm font-bold mb-0.5">{e.term}</div>
                  <div className="text-xs text-dim leading-relaxed">{e.oneLiner}</div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
