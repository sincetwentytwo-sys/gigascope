import type { Metadata } from "next";
import EmailSignup from "@/components/EmailSignup";
import InvestorCheckout from "@/components/InvestorCheckout";

export const metadata: Metadata = {
  title: "Investor tier — early-bird $9 — GIGASCOPE",
  description:
    "GIGASCOPE Investor: real-time milestone alerts, AI-curated daily digest, full 3D product breakdowns, data downloads, no ads. Single tier, no upsells. $9 early-bird → $19 → $29.",
};

const FEATURES = [
  { label: "Real-time alerts (email + Telegram)", note: "Construction progress jumps, fab milestones, regulatory decisions, earnings, launches." },
  { label: "AI-curated daily digest", note: "One email at 7am local. Cross-company synthesis: what mattered, what's next, with primary-source links." },
  { label: "Full 3D interactive product breakdowns", note: "Click any component on Raptor, Optimus, Cybertruck, 4680, GB200 — see the part, the spec, the supplier." },
  { label: "Data downloads (CSV, JSON)", note: "Milestones, facility coordinates, supply-chain edges, historical timelines — bulk export for your own analysis." },
  { label: "Comparison tools", note: "Side-by-side: Gigafactories vs Pyeongtaek, MI300X vs B200, Tanbreez vs Mountain Pass." },
  { label: "No ads, no upsells", note: "Single tier. No 'Pro / Premium / Enterprise' nonsense. One identity: Investor." },
];

export default function InvestorPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <header className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-text text-bg text-[11px] font-bold uppercase tracking-wider mb-4">
          Early bird · first 100 founders only
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Investor tier
        </h1>
        <p className="text-dim max-w-xl mx-auto">
          GIGASCOPE is free to read. Investor unlocks alerts, AI digests, full 3D breakdowns, and data downloads —
          so you can act on what you see in the Atlas.
        </p>
      </header>

      <div className="text-center mb-10">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-5xl font-bold">$9</span>
          <span className="text-dim">/ month · early bird</span>
        </div>
        <div className="text-xs text-dim">→ $19 standard launch · $29 long-term target · early-bird price grandfathered for life</div>
        <div className="text-xs text-dim mt-2">or $99 / year (early bird) · cancel anytime</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {FEATURES.map((f, i) => (
          <div key={i} className="flex gap-3 p-4 rounded border border-border-custom">
            <span className="text-green-600 mt-0.5">✓</span>
            <div>
              <div className="font-bold text-sm mb-0.5">{f.label}</div>
              <div className="text-xs text-dim">{f.note}</div>
            </div>
          </div>
        ))}
      </div>

      <section className="max-w-md mx-auto mb-12">
        <InvestorCheckout />
      </section>

      <section className="max-w-md mx-auto mb-16">
        <div className="text-center text-xs text-dim mb-3">— or just get the free daily digest —</div>
        <EmailSignup tier="free" source="investor:landing" variant="card" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <dl className="flex flex-col gap-5 text-sm">
          <div>
            <dt className="font-bold mb-1">Why one tier and not three?</dt>
            <dd className="text-dim">Because "Pro / Premium / Enterprise" is a tax on attention. One identity: Investor. One price. Everything on.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Is the free tier going away?</dt>
            <dd className="text-dim">No. The public Atlas — every company page, every facility map, every news feed — stays free. Investor is additive.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Is this financial advice?</dt>
            <dd className="text-dim">No. GIGASCOPE is industrial intelligence — what's being built, where, by whom. We cite primary sources (SEC EDGAR, DART, IR decks, government data) so you can verify everything yourself.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Why early bird at $9?</dt>
            <dd className="text-dim">Charter members fund the next 50 company pages and the 3D product pipeline. You get lifetime price-lock at $9 even when we raise to $29.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">What happens to my data if I cancel?</dt>
            <dd className="text-dim">Your watchlist is local-only (browser storage), not server-side, so cancelling has no effect on it. Alerts and digest emails simply stop.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
