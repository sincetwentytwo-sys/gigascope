import type { Metadata } from "next";
import Link from "next/link";
import { Redis } from "@upstash/redis";
import EmailSignup from "@/components/EmailSignup";
import InvestorCheckout from "@/components/InvestorCheckout";
import DailyDigestPreview from "@/components/DailyDigestPreview";
import TelegramAlertPreview from "@/components/TelegramAlertPreview";
import { getEmpireStats } from "@/lib/pulse";

// Charter-counter is live, page revalidates every minute so the badge
// reflects the most recent purchase without hammering Upstash.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Charter membership — $9/mo for life — GIGASCOPE",
  description:
    "GIGASCOPE charter: daily digest, satellite-drop alerts, and the Saturday weekly recap. First 100 charters lock $9/mo forever — public launch at $29 in Jun 2026.",
  alternates: { canonical: "https://gigascope.xyz/pro" },
  openGraph: {
    title: "Charter membership — $9/mo for life — GIGASCOPE",
    description:
      "GIGASCOPE charter: daily digest, satellite-drop alerts, and the Saturday weekly recap. First 100 charters lock $9/mo for life.",
    url: "https://gigascope.xyz/pro",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE Charter — $9/mo for life",
    description:
      "Daily digest, satellite-drop alerts, weekly recap. First 100 lock $9 forever.",
  },
};

// IMPORTANT: paid charter count and free digest count are different keys.
//   `subscribers:charter:count` — INCR'd only by the Stripe webhook on a
//     successful checkout. Stays at 0 until billing goes live AND someone pays.
//   `subscribers:emails` — every email that hit the signup form (free digest).
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
  const stats = getEmpireStats();
  const { paidCharter, freeDigest } = await getCounts();
  const cap = 100;
  const taken = paidCharter === null ? null : Math.min(paidCharter, cap);
  const remaining = taken === null ? null : Math.max(cap - taken, 0);
  const showCount = taken !== null && taken >= 1;
  const FREE_PROOF_THRESHOLD = 10;
  const showFreeCount = freeDigest !== null && freeDigest >= FREE_PROOF_THRESHOLD;

  // Server-side gate: hide Stripe POST entirely until billing is wired.
  // Server-only env, can't be probed from the client — exactly the point.
  const stripeLive = !!process.env.STRIPE_SECRET_KEY;

  // Lemon Squeezy (Merchant of Record) checkout. The store + product are
  // live; this is the hosted checkout URL for the $9/mo charter. Gated
  // behind an env var so the public site keeps showing the waitlist until
  // the owner explicitly flips it on in Vercel — no surprise charges.
  // To go live: set LEMONSQUEEZY_CHECKOUT_URL to the buy link in Vercel.
  const lsCheckoutUrl = process.env.LEMONSQUEEZY_CHECKOUT_URL || undefined;
  // Optional annual ($90/yr) LS product. When set alongside the monthly URL,
  // InvestorCheckout renders a monthly/annual toggle; until then the checkout
  // is monthly-only. Create the annual LS product, then set this in Vercel.
  const lsCheckoutUrlAnnual = process.env.LEMONSQUEEZY_CHECKOUT_URL_ANNUAL || undefined;

  return (
    <div className="bg-bg text-text">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="border-b border-border-custom">
        <div className="max-w-[1100px] mx-auto px-6 py-12 sm:py-16 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-text text-bg text-[11px] font-bold uppercase tracking-wider mb-5">
            {showCount
              ? `${taken} of ${cap} charter spots claimed`
              : "Founding 100 · first 100 lock $9/mo for life"}
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 leading-[1.05]">
            $9 for the empire,<br />locked for life.
          </h1>
          <p className="text-base sm:text-lg text-text font-medium max-w-2xl mx-auto mb-4 leading-snug">
            For retail investors tracking Tesla / SpaceX / xAI capex velocity without paying $30K for Planet Labs.
          </p>
          <p className="text-dim text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A paid subscription to GIGASCOPE. Daily digest, satellite-drop alerts, and the
            Saturday weekly recap. Public launches at $29 in June 2026. Charter pricing
            is grandfathered for as long as your subscription stays active.
          </p>
          {showCount && remaining !== null && (
            <div className="max-w-md mx-auto mt-7">
              <div className="flex justify-between text-[11px] font-mono text-dim mb-1.5">
                <span>{taken} of {cap} claimed</span>
                <span>{remaining} remaining</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface border border-border-custom overflow-hidden">
                <div
                  className="h-full bg-text transition-all"
                  style={{ width: `${Math.round(((taken ?? 0) / cap) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Pricing + checkout ───────────────────────────────────────── */}
      <section className="border-b border-border-custom bg-surface">
        <div className="max-w-[900px] mx-auto px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border-2 border-text bg-bg p-6 sm:p-8 flex flex-col">
              <div className="text-[10px] uppercase tracking-widest font-mono text-text font-bold mb-2">
                Charter · first 100
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold tabular-nums">$9</span>
                <span className="text-dim">/ month</span>
              </div>
              <div className="text-xs text-dim mb-5">or $90 / year · 17% off · charter rate locked for life</div>
              <ul className="text-sm flex flex-col gap-2 mb-6">
                <Bullet>Daily digest, ~7 AM ET</Bullet>
                <Bullet>Satellite-drop alerts (Telegram + email)</Bullet>
                <Bullet>Saturday weekly recap</Bullet>
                <Bullet soon>Founding member badge in account</Bullet>
                <Bullet>$9/mo locked when public hits $29</Bullet>
              </ul>
              <p className="text-[10px] text-dim mb-4 leading-snug">
                <span className="text-text">✓ built &amp; live</span> ·{" "}
                <span className="text-text">◇ not yet built — charter pricing funds it</span>
              </p>
              <div className="mt-auto">
                {showCount && remaining !== null && remaining > 0 && (
                  <div className="text-center text-[11px] font-mono uppercase tracking-widest text-dim mb-3">
                    Charter spots remaining: <span className="text-text font-bold">{remaining}</span> / {cap}
                  </div>
                )}
                <InvestorCheckout stripeLive={stripeLive} lsCheckoutUrl={lsCheckoutUrl} lsCheckoutUrlAnnual={lsCheckoutUrlAnnual} />
              </div>
            </div>

            <div className="rounded-lg border border-border-custom bg-bg p-6 sm:p-8 flex flex-col">
              <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
                Free
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-bold tabular-nums">$0</span>
                <span className="text-dim">/ forever</span>
              </div>
              <div className="text-xs text-dim mb-5">no card, no time limit</div>
              <ul className="text-sm flex flex-col gap-2 mb-6">
                <Bullet>Daily digest, ~7 AM ET</Bullet>
                <Bullet>Public site, all {stats.sites} site pages</Bullet>
                <Bullet>Compare imagery + product cutaways</Bullet>
                <Bullet muted>No drop alerts</Bullet>
                <Bullet muted>No weekly recap</Bullet>
                <Bullet>CSV / JSON data exports (free)</Bullet>
              </ul>
              <div className="mt-auto">
                <EmailSignup tier="free" source="pro:free-card" variant="inline" />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-dim text-center mt-6 max-w-md mx-auto">
            ⚠ This is a paid software subscription, not equity, not a token, not a security.
            Cancel any time.{" "}
            <Link href="/charter-terms" className="underline">Charter price-lock terms →</Link>
            {showFreeCount && (
              <> · Already <strong className="text-text">{freeDigest}</strong> on the free digest.</>
            )}
          </p>
        </div>
      </section>

      {/* ── What it actually looks like ──────────────────────────────── */}
      <section className="border-b border-border-custom">
        <div className="max-w-[1100px] mx-auto px-6 py-14 sm:py-20">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
              What you get
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              No marketing copy. The actual product.
            </h2>
            <p className="text-dim max-w-2xl mx-auto leading-relaxed">
              Both the digest and the alert feed are wired to the same data the public site
              uses: {stats.satelliteFrames} satellite frames, {stats.milestonesTracked}{" "}
              milestones, {stats.sourcesCited} cited sources. Below is exactly what a
              recipient inbox looks like.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
                1 · Daily digest email
              </div>
              <h3 className="text-xl font-bold mb-2">Every morning, ET · empire-wide</h3>
              <p className="text-sm text-dim mb-5 leading-relaxed">
                Every morning, the milestones verified in the last 24 hours plus a 30-day
                lookahead of catalysts (earnings, FAA static-fire windows, county filings).
                Charter members get the same email, on the same schedule, plus the right to
                turn on the alert channel below.
              </p>
              <DailyDigestPreview />
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
                2 · Satellite-drop alert
              </div>
              <h3 className="text-xl font-bold mb-2">Telegram + email · charter only</h3>
              <p className="text-sm text-dim mb-5 leading-relaxed">
                When a tracked site gets a fresh satellite frame, you get an email the same
                day — plus Telegram, if you've linked it — pointing you straight to the new
                imagery so you can see what changed on the ground. No "TSLA is up 2%" market
                noise. This fires on new pictures of the site, not stock ticks.
              </p>
              <p className="text-xs text-dim mb-5">
                Charter member?{" "}
                <Link href="/account" className="underline hover:text-text">
                  Connect Telegram →
                </Link>
              </p>
              <TelegramAlertPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Roadmap honesty ──────────────────────────────────────────── */}
      <section className="border-b border-border-custom bg-surface">
        <div className="max-w-[900px] mx-auto px-6 py-12 sm:py-16">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
            Roadmap honesty
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            What's live, what's next, what's not yet built.
          </h2>
          <p className="text-dim mb-8 leading-relaxed">
            Charter pricing pays for the build. We list every feature in one of three columns
            so you can see exactly where the product is, not where the deck says it will be.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <RoadmapCol
              title="Live"
              tone="ops"
              items={[
                "Daily digest (~7 AM ET)",
                "Full /pulse scoreboard",
                `${stats.sites} site pages + before/after`,
                "Compare imagery slider",
                "Product cutaway hotspots",
                "Methodology + sources cited",
                "CSV / JSON data exports (free)",
                "Satellite-drop alerts (charter)",
                "Saturday weekly recap (charter)",
              ]}
            />
            <RoadmapCol
              title="Charter unlocks at launch"
              tone="text"
              items={[
                "Account-level alert filters",
                "Founding member badge",
              ]}
            />
            <RoadmapCol
              title="On the build list"
              tone="dim"
              items={[
                "Polygon-trace overlays on /compare",
                "Per-site progress sparklines",
                "Construction velocity API",
                "Email-only digest archive page",
                "Discord / Slack relay",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section>
        <div className="max-w-[900px] mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
            Frequently asked
          </h2>
          <dl className="flex flex-col gap-6 text-sm">
            <FaqRow q="Why one tier and not three?">
              Because "Pro / Premium / Enterprise" is a tax on attention. One tier, one
              price. Pay it once and stop thinking about it.
            </FaqRow>
            <FaqRow q="Is the free tier going away?">
              No. The free site — every company page, every satellite map, every product
              cutaway — stays open. Charter is additive, not gated.
            </FaqRow>
            <FaqRow q="Is this financial advice?">
              No. GIGASCOPE is industrial intelligence — what is being built, where, by
              whom. We cite primary sources (FAA filings, SEC EDGAR, county permits) so you
              can verify everything yourself.
            </FaqRow>
            <FaqRow q="Why $9, locked for life?">
              Charter members fund the build of the alert system and the next
              cohort of company pages. Locking your rate means you pay $9 even when the
              public price is $29 (June 2026) and likely $49-79 long-term, as long as your
              subscription stays active.
            </FaqRow>
            <FaqRow q="What if I cancel and come back?">
              The charter rate is for continuous, active subscriptions. A cancelled
              subscription forfeits the lock — restart pricing is public-rate at that time.
              Full terms at <Link href="/charter-terms" className="underline">/charter-terms</Link>.
            </FaqRow>
            <FaqRow q="When does billing actually open?">
              The day the payment provider clears KYB. Until then, leaving your email on
              the form above puts you on the charter waitlist and pulls you in the moment
              the gate opens — at the rate shown today.
            </FaqRow>
          </dl>
        </div>
      </section>
    </div>
  );
}

// ── Local subcomponents ────────────────────────────────────────────────

// Bullet states:
//   default (no flag) — feature is live RIGHT NOW. Green ✓.
//   muted             — feature is excluded from this tier. Dim em-dash.
//   soon              — feature is part of the charter promise but not yet
//                       wired. Dim diamond — honest "not yet" signal so
//                       people who pay know they're funding the build, not
//                       walking into a finished house.
function Bullet({
  children,
  muted = false,
  soon = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  soon?: boolean;
}) {
  let glyph = "✓";
  let glyphClass = "text-accent-green mt-0.5";
  let textClass = "";
  if (muted) {
    glyph = "—";
    glyphClass = "text-dim mt-0.5";
    textClass = "text-dim";
  } else if (soon) {
    glyph = "◇";
    glyphClass = "text-dim mt-0.5";
    textClass = "text-dim";
  }
  return (
    <li className="flex gap-2 items-start">
      <span className={glyphClass}>{glyph}</span>
      <span className={textClass}>{children}</span>
    </li>
  );
}

function RoadmapCol({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "ops" | "text" | "dim";
}) {
  const headColor =
    tone === "ops" ? "text-accent-green" : tone === "text" ? "text-text" : "text-dim";
  return (
    <div className="bg-bg rounded-md border border-border-custom p-4">
      <div className={`text-[10px] uppercase tracking-widest font-mono mb-3 ${headColor}`}>
        {title}
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 items-start">
            <span className={`mt-0.5 shrink-0 ${headColor}`}>·</span>
            <span className={tone === "dim" ? "text-dim" : ""}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqRow({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-custom pb-5 last:border-0">
      <dt className="font-bold mb-1.5">{q}</dt>
      <dd className="text-dim leading-relaxed">{children}</dd>
    </div>
  );
}
