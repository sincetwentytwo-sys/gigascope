import type { Metadata } from "next";
import Link from "next/link";
import { Redis } from "@upstash/redis";
import EmailSignup from "@/components/EmailSignup";
import InvestorCheckout from "@/components/InvestorCheckout";

// Live charter-counter — keep page fresh enough that the badge isn't stale,
// but don't hammer Upstash on every request.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Investor tier — charter $9 — GIGASCOPE",
  description:
    "GIGASCOPE Investor: real-time milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
  alternates: { canonical: "https://gigascope.xyz/investor" },
  openGraph: {
    title: "Investor tier — charter $9 — GIGASCOPE",
    description:
      "GIGASCOPE Investor: real-time milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
    url: "https://gigascope.xyz/investor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Investor tier — charter $9 — GIGASCOPE",
    description:
      "GIGASCOPE Investor: real-time milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
  },
};

const FEATURES = [
  { label: "Real-time alerts (email)", note: "Construction progress jumps, fab milestones, regulatory decisions, earnings, launches." },
  { label: "Curated daily digest", note: "One email at 7am local. Cross-company synthesis: what mattered, what's next, with primary-source links." },
  { label: "Interactive component breakdowns", note: "Click any component on Raptor, Optimus, Cybertruck, 4680, GB200 — see the part, the spec, the supplier." },
  { label: "Data downloads (CSV, JSON)", note: "Milestones, facility coordinates, supply-chain edges, historical timelines — bulk export for your own analysis." },
  { label: "Comparison tools", note: "Side-by-side: Gigafactories vs Pyeongtaek, MI300X vs B200, Tanbreez vs Mountain Pass." },
  { label: "No ads, no upsells", note: "Single tier. No 'Pro / Premium / Enterprise' nonsense. One identity: Investor." },
];

async function getCharterCount(): Promise<number | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const r = new Redis({ url, token });
    const count = await r.scard("subscribers:emails");
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}

export default async function InvestorPage() {
  const charterCount = await getCharterCount();
  const cap = 100;
  const taken = charterCount === null ? null : Math.min(charterCount, cap);
  const remaining = taken === null ? null : Math.max(cap - taken, 0);
  const badge =
    taken === null
      ? "Charter waitlist · first 100 spots"
      : `Charter waitlist · ${taken} of ${cap} spots`;
  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <header className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-text text-bg text-[11px] font-bold uppercase tracking-wider mb-4">
          {badge}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Investor tier
        </h1>
        <p className="text-dim max-w-xl mx-auto mb-3">
          A <strong className="text-text">paid software subscription</strong> to GIGASCOPE. Unlocks satellite-drop alerts,
          a curated daily digest, interactive component breakdowns, and CSV/JSON data exports.
        </p>
        {taken !== null && (
          <p className="text-[11px] text-dim max-w-md mx-auto mb-2">
            {taken} waitlisted · {remaining} charter spots remain · charter pricing locks when billing opens.
          </p>
        )}
        <p className="text-[11px] text-dim max-w-md mx-auto">
          ⚠ This is not equity in the project, not a token, not a security. It's a $9/month subscription to a software service. Cancel any time.
        </p>
        <p className="text-[11px] text-dim max-w-md mx-auto mt-2">
          <Link href="/charter-terms" className="underline">Charter price-lock terms →</Link>
        </p>
      </header>

      <div className="text-center mb-10">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-5xl font-bold">$9</span>
          <span className="text-dim">/ month · charter</span>
        </div>
        <div className="text-xs text-dim">→ $29 standard launch (Jun 2026) · $49-79 long-term · charter rate locked for life</div>
        <div className="text-xs text-dim mt-2">or $90 / year (charter · 17% off) · cancel anytime</div>
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
            <dd className="text-dim">No. The free site — every company page, every facility map, every news feed — stays open. Investor is additive.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Is this financial advice?</dt>
            <dd className="text-dim">No. GIGASCOPE is industrial intelligence — what's being built, where, by whom. We cite primary sources (SEC EDGAR, DART, IR decks, government data) so you can verify everything yourself.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Why charter at $9?</dt>
            <dd className="text-dim">Charter members fund the next 50 company pages, satellite pipeline, and Telegram alert system (on the build roadmap). You get lifetime price-lock at $9 even when public launch hits $29 (June 2026) and long-term reaches $49-79.</dd>
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
