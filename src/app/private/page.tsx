import type { Metadata } from "next";
import { listPrivateCompanies } from "@/data/privateCompanies";

export const metadata: Metadata = {
  title: "Private companies — SpaceX, xAI, Anduril, Helion — GIGASCOPE",
  description:
    "Private frontier-tech companies tracked in the Atlas with estimated valuations + facility maps. SpaceX, xAI, Anduril Industries, Helion, Commonwealth Fusion Systems.",
};

export default function PrivateHub() {
  const cos = listPrivateCompanies();

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Private companies</h1>
        <p className="text-dim max-w-2xl">
          Companies with no public ticker but load-bearing in the frontier-tech story. Valuations are estimates from secondary
          tender prints, journalist scoops, or last-round disclosures — always cite as of a date.
        </p>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cos.map((c) => (
          <li key={c.slug}>
            <a
              href={`/private/${c.slug}`}
              className="block p-4 rounded border border-border-custom hover:border-text"
              style={{ borderLeftWidth: 4, borderLeftColor: c.accent ?? "#86868b" }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div className="font-bold">{c.name}</div>
                {c.valuationB != null && (
                  <div className="text-[11px] text-dim tabular-nums">
                    ~${c.valuationB}B est.
                    {c.valuationAsOf && <span> · {c.valuationAsOf}</span>}
                  </div>
                )}
              </div>
              <p className="text-sm text-dim leading-snug">{c.thesis}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
