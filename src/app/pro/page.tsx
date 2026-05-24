import type { Metadata } from "next";
import Link from "next/link";
import { Redis } from "@upstash/redis";
import EmailSignup from "@/components/EmailSignup";
import InvestorCheckout from "@/components/InvestorCheckout";

// Live charter-counter — keep page fresh enough that the badge isn't stale,
// but don't hammer Upstash on every request.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Charter membership — $9/mo for life — GIGASCOPE",
  description:
    "GIGASCOPE charter: daily milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
  alternates: { canonical: "https://gigascope.xyz/pro" },
  openGraph: {
    title: "Charter membership — $9/mo for life — GIGASCOPE",
    description:
      "GIGASCOPE charter: daily milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
    url: "https://gigascope.xyz/pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Charter membership — $9/mo for life — GIGASCOPE",
    description:
      "GIGASCOPE charter: daily milestone alerts, curated daily digest, interactive component breakdowns, data downloads, no ads. Single tier, no upsells. $9 charter → $29 (Jun 2026) → $49-79 long-term.",
  },
};

const FEATURES = [
  { label: "Daily alerts (email)", note: "One digest at 14:00 UTC: construction progress jumps, fab milestones, regulatory decisions, earnings, launches." },
  { label: "Curated daily digest", note: "One email at 7am local. Cross-company synthesis: what mattered, what's next, with primary-source links." },
  { label: "Interactive component breakdowns", note: "Click any component on Raptor, Optimus, Cybertruck, 4680, GB200 — see the part, the spec, the supplier." },
  { label: "Data downloads (CSV, JSON)", note: "Milestones, facility coordinates, supply-chain edges, historical timelines — bulk export for your own analysis." },
  { label: "Comparison tools", note: "Side-by-side: Gigafactories vs Pyeongtaek, MI300X vs B200, Tanbreez vs Mountain Pass." },
  { label: "No ads, no upsells", note: "Single tier. No 'Pro / Premium / Enterprise' nonsense. One price. Everything on." },
];

// IMPORTANT: paid charter count and free digest count are different keys.
//   `subscribers:charter:count` — INCR'd only by the Stripe webhook on a
//     successful checkout. Stays at 0 until billing goes live AND someone pays.
//   `subscribers:emails` — every email that hit the signup form (free digest).
// Earlier this used SCARD subscribers:emails for the "charter" counter,
// which inflated paid traction with free signups → phantom scarcity. Now we
// surface them separately and honestly.
async function getCounts(): Promise<{ paidCharter: number | null; freeDigest: number | null }> {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { paidCharter: null, freeDigest: null };
  try {
    const r = new Redis({ url, token });
    const [paidRaw, freeRaw] = await Promise.all([
      r.get<number | string>("subscribers:charter:count"),
      r.scard("subscribers:emails"),
    ]);
    const paid =
      typeof paidRaw === "number"
        ? paidRaw
        : typeof paidRaw === "string"
        ? parseInt(paidRaw, 10) || 0
        : 0;
    const free = typeof freeRaw === "number" ? freeRaw : null;
    return { paidCharter: paid, freeDigest: free };
  } catch {
    return { paidCharter: null, freeDigest: null };
  }
}

export default async function ProPage() {
  const { paidCharter, freeDigest } = await getCounts();
  const cap = 100;
  const taken = paidCharter === null ? null : Math.min(paidCharter, cap);
  const remaining = taken === null ? null : Math.max(cap - taken, 0);

  // Gate the paid-charter counter: only surface a literal count once at
  // least one person has actually paid. Below 1, lean on "Founding 100"
  // framing without claiming traction we don't have.
  const showCount = taken !== null && taken >= 1;
  const badge = showCount
    ? `${taken} of ${cap} charter spots claimed`
    : "Founding 100 · first 100 paid charters lock $9/mo forever";

  // Separate free-digest count gates its own "join N readers" line. We
  // require ≥10 before exposing the number so we don't show "join 2 readers".
  const FREE_PROOF_THRESHOLD = 10;
  const showFreeCount = freeDigest !== null && freeDigest >= FREE_PROOF_THRESHOLD;

  // Server-side gate: hide Stripe POST entirely until billing is wired.
  // Server-only env, can't be probed from the client — exactly the point.
  const stripeLive = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <header className="text-center mb-10">
        <div className="inline-block px-3 py-1 rounded-full bg-text text-bg text-[11px] font-bold uppercase tracking-wider mb-4">
          {badge}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Charter membership
        </h1>
        <p className="text-dim max-w-xl mx-auto mb-3">
          A <strong className="text-text">paid software subscription</strong> to GIGASCOPE. Unlocks satellite-drop alerts,
          a curated daily digest, interactive component breakdowns, and CSV/JSON data exports.
        </p>
        {showCount ? (
          <>
            <p className="text-[11px] text-dim max-w-md mx-auto mb-2">
              {taken} of {cap} charter spots claimed · {remaining} remaining · charter pricing locks when billing opens.
            </p>
            <div className="max-w-xs mx-auto mb-2">
              <div className="h-1 rounded-full bg-surface border border-border-custom overflow-hidden">
                <div
                  className="h-full bg-text transition-all"
                  style={{ width: `${Math.round(((taken ?? 0) / cap) * 100)}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-dim max-w-md mx-auto mb-2">
            Founding 100 — charter pricing locked at $9/mo forever for the first 100 members.
          </p>
        )}
        <p className="text-[11px] text-dim max-w-md mx-auto">
          ⚠ This is not equity in the project, not a token, not a security. It's a $9/month subscription to a software service. Cancel any time.
        </p>
        {showFreeCount && (
          <p className="text-[11px] text-dim max-w-md mx-auto mt-2">
            Already <strong className="text-text">{freeDigest}</strong> reading the free daily digest.
          </p>
        )}
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
        <InvestorCheckout stripeLive={stripeLive} />
      </section>

      <section className="max-w-md mx-auto mb-16">
        <div className="text-center text-xs text-dim mb-3">— or just get the free daily digest —</div>
        <EmailSignup tier="free" source="pro:landing" variant="card" />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <dl className="flex flex-col gap-5 text-sm">
          <div>
            <dt className="font-bold mb-1">Why one tier and not three?</dt>
            <dd className="text-dim">Because "Pro / Premium / Enterprise" is a tax on attention. One price. Everything on.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Is the free tier going away?</dt>
            <dd className="text-dim">No. The free site — every company page, every facility map, every news feed — stays open. Charter membership is additive.</dd>
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
