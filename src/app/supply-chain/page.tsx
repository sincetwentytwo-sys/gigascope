import type { Metadata } from "next";
import { EDGES, TIER_LABELS } from "@/data/supplyChain";
import { getTicker, tickerHref } from "@/data/tickers";

export const metadata: Metadata = {
  title: "Supply chain — how the AI build-out connects — GIGASCOPE",
  description:
    "Hand-curated graph of the dependencies upstream from raw materials to end products. ASML → TSMC → NVIDIA → Tesla. SK Hynix HBM → NVIDIA Blackwell. Mountain Pass → motor magnets.",
};

export default function SupplyChainPage() {
  // Layered layout. Group symbols by their min tier seen as `from` or `to`.
  const symbolsTier = new Map<string, number>();
  for (const e of EDGES) {
    const prevFrom = symbolsTier.get(e.from);
    if (prevFrom === undefined || e.fromTier < prevFrom) symbolsTier.set(e.from, e.fromTier);
    const prevTo = symbolsTier.get(e.to);
    if (prevTo === undefined || e.toTier < prevTo) symbolsTier.set(e.to, e.toTier);
  }

  const tiers: Map<number, string[]> = new Map();
  for (const [sym, tier] of symbolsTier.entries()) {
    if (!tiers.has(tier)) tiers.set(tier, []);
    tiers.get(tier)!.push(sym);
  }
  const tierEntries = Array.from(tiers.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Supply chain</h1>
        <p className="text-dim max-w-3xl">
          Hand-curated graph of dependencies — upstream raw materials, through wafer/litho, chips, compute systems, into the
          final products. Hover any edge to see what flows, why it matters, and the primary source if cited. Click any company
          to open its Atlas page.
        </p>
      </header>

      {/* Layered tier view */}
      <section className="mb-12">
        <div className="flex flex-col gap-6">
          {tierEntries.map(([tier, syms]) => (
            <div key={tier}>
              <div className="text-xs uppercase tracking-wider text-dim mb-2">Tier {tier} · {TIER_LABELS[tier]}</div>
              <div className="flex flex-wrap gap-2">
                {syms.sort().map((sym) => {
                  const t = getTicker(sym);
                  if (!t) {
                    return (
                      <span key={sym} className="px-3 py-1.5 rounded border border-border-custom text-sm font-mono text-dim">
                        {sym}
                      </span>
                    );
                  }
                  return (
                    <a
                      key={sym}
                      href={tickerHref(t)}
                      className="px-3 py-1.5 rounded border border-border-custom hover:border-text text-sm font-mono"
                      style={{ borderLeftWidth: 3, borderLeftColor: t.accent ?? "#86868b" }}
                    >
                      {t.symbol}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edges list */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Edges ({EDGES.length})</h2>
        <ul className="flex flex-col gap-2">
          {EDGES.map((e, i) => {
            const fromT = getTicker(e.from);
            const toT = getTicker(e.to);
            const critColor =
              e.criticality === "monopoly" ? "#e63946" :
              e.criticality === "primary" ? "#0066cc" : "#86868b";
            return (
              <li
                key={i}
                className="p-3 rounded border border-border-custom flex flex-wrap items-center gap-3"
                style={{ borderLeftWidth: 4, borderLeftColor: critColor }}
              >
                <div className="flex items-center gap-2">
                  {fromT ? (
                    <a href={tickerHref(fromT)} className="text-sm font-mono font-bold hover:underline">{e.from}</a>
                  ) : (
                    <span className="text-sm font-mono text-dim">{e.from}</span>
                  )}
                  <span className="text-dim">→</span>
                  {toT ? (
                    <a href={tickerHref(toT)} className="text-sm font-mono font-bold hover:underline">{e.to}</a>
                  ) : (
                    <span className="text-sm font-mono text-dim">{e.to}</span>
                  )}
                </div>
                <div className="text-sm flex-1 min-w-0">{e.flow}</div>
                <span
                  className="text-[10px] uppercase px-1.5 py-0.5 rounded"
                  style={{ background: `${critColor}22`, color: critColor }}
                >
                  {e.criticality}
                </span>
                {e.source && (
                  <a
                    href={e.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] underline text-dim hover:text-text"
                  >
                    source
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="text-xs text-dim leading-relaxed max-w-2xl">
        Coverage is intentionally non-exhaustive — we map only the dependencies that primary-source disclosures actually back.
        If you spot a missing edge with a real source, drop it in the GitHub issue tracker.
      </section>
    </div>
  );
}
