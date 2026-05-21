import type { Metadata } from "next";
import EmailSignup from "@/components/EmailSignup";

export const metadata: Metadata = {
  title: "GIGASCOPE Pro — Catalyst alerts, satellite drops, custom watchlists",
  description:
    "Free tier covers the public dashboards. Pro unlocks milestone alerts, satellite drop notifications, custom watchlists, and a daily digest. Terminal adds API access and bulk data export.",
};

type Tier = {
  id: "free" | "pro" | "terminal";
  name: string;
  price: string;
  cadence: string;
  accent: string;
  bullets: string[];
  cta: string;
  ctaHref?: string;
  comingSoon?: boolean;
};

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    accent: "#86868b",
    bullets: [
      "Live multi-sector heatmap",
      "All factory + site dashboards",
      "Public news feed",
      "Daily email digest",
    ],
    cta: "Get the daily digest",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    cadence: "/ month",
    accent: "#0066cc",
    bullets: [
      "Catalyst alerts via email + push",
      "Satellite imagery drop notifications (new ESRI/Sentinel-2 captures)",
      "Custom watchlists across sectors",
      "Earnings call summaries (auto-generated)",
      "Pro members' Discord access",
      "No ads, no upsells",
    ],
    cta: "Join the Pro waitlist",
    comingSoon: true,
  },
  {
    id: "terminal",
    name: "Terminal",
    price: "$99",
    cadence: "/ month",
    accent: "#e31937",
    bullets: [
      "Everything in Pro",
      "Full historical milestone API (JSON, CSV)",
      "Per-ticker bulk export",
      "Custom alert webhooks (Slack, Discord, Telegram)",
      "Priority data refresh",
      "1:1 onboarding call",
    ],
    cta: "Request Terminal access",
    comingSoon: true,
  },
];

export default function ProPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <header className="text-center mb-12 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          Pro tier — built for the build-out
        </h1>
        <p className="text-dim">
          GIGASCOPE is free to read. Pro adds catalyst alerts, satellite drop notifications, watchlists, and digest tooling
          for analysts who treat this as a real workflow.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className="flex flex-col p-6 rounded-lg border border-border-custom"
            style={{ borderTopWidth: 4, borderTopColor: tier.accent }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold">{tier.name}</h2>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-dim text-sm">{tier.cadence}</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-sm flex-1 mb-5">
              {tier.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {tier.id === "free" ? (
              <EmailSignup tier="free" source={`pro:${tier.id}`} />
            ) : (
              <>
                <EmailSignup tier={tier.id} source={`pro:${tier.id}`} />
                <div className="text-[11px] text-dim mt-2">Waitlist · billing live soon</div>
              </>
            )}
          </div>
        ))}
      </div>

      <section className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">FAQ</h2>
        <dl className="flex flex-col gap-5 text-sm">
          <div>
            <dt className="font-bold mb-1">Is the free tier ever going away?</dt>
            <dd className="text-dim">No. The public dashboards stay free. Pro is additive — alerts, watchlists, export. Free remains the on-ramp.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">When does Pro launch?</dt>
            <dd className="text-dim">Waitlist is open now. We're tuning the alert pipeline before billing turns on. Subscribers get charter pricing.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Is this financial advice?</dt>
            <dd className="text-dim">No. Editorial + data. Verify with primary sources before acting. Theses are opinions.</dd>
          </div>
          <div>
            <dt className="font-bold mb-1">Where does the data come from?</dt>
            <dd className="text-dim">Prices: Yahoo Finance. News: vendor RSS. Satellite: ESRI World Imagery + Sentinel-2 (EOX). Factory milestones: official press + hand-verified secondary sources. See <a href="/about" className="underline">/about</a>.</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
