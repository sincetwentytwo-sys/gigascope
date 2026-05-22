import type { Metadata } from "next";
import { SECTORS, tickersBySector } from "@/data/tickers";
import { listPrivateCompanies } from "@/data/privateCompanies";

export const metadata: Metadata = {
  title: "Sectors — GIGASCOPE",
  description:
    "Sector-by-sector intelligence: Musk Empire, Semis & AI Compute, Quantum, Critical Materials, Defense & Space, Fusion & Nuclear, Robotics.",
};

export default function SectorsHub() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Sectors</h1>
        <p className="text-dim max-w-2xl">
          Seven distinct macro theses tracked across the public-market universe. Click into any sector for a leaderboard,
          thesis, and per-name catalysts.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTORS.map((s) => {
          const ts = tickersBySector(s.id);
          const privates = listPrivateCompanies().filter((c) => c.sectors.includes(s.id));
          const total = ts.length + privates.length;
          return (
            <a
              key={s.id}
              href={`/sectors/${s.id}`}
              className="block p-6 rounded-lg border border-border-custom hover:border-text transition-colors"
              style={{ borderLeftWidth: 4, borderLeftColor: s.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{s.icon}</span>
                <h2 className="text-xl font-bold">{s.name}</h2>
                <span className="ml-auto text-xs text-dim">{total} {total === 1 ? "name" : "names"}</span>
              </div>
              <p className="text-sm text-dim mb-3">{s.blurb}</p>
              <div className="flex flex-wrap gap-1.5">
                {ts.slice(0, 8).map((t) => (
                  <span
                    key={t.symbol}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-custom"
                  >
                    {t.symbol}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
