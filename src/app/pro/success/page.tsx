import type { Metadata } from "next";
import { getEmpireStats } from "@/lib/pulse";

export const metadata: Metadata = {
  title: "You're in — welcome — GIGASCOPE",
  description:
    "Charter member welcome page. Your subscription is active — first daily digest arrives within 24 hours.",
  alternates: { canonical: "https://gigascope.xyz/pro/success" },
  openGraph: {
    title: "You're in — welcome — GIGASCOPE",
    description:
      "Charter member welcome page. Your subscription is active — first daily digest arrives within 24 hours.",
    url: "https://gigascope.xyz/pro/success",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "You're in — welcome — GIGASCOPE",
    description:
      "Charter member welcome page. Your subscription is active — first daily digest arrives within 24 hours.",
  },
  robots: { index: false, follow: false },
};

export default function ProSuccess() {
  const stats = getEmpireStats();
  return (
    <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">You're in.</h1>
      <p className="text-dim mb-6">
        Charter pricing locked for the life of your subscription. We'll send the first daily digest within
        24 hours, plus a welcome email with what's next.
      </p>
      <p className="text-sm text-dim mb-8">
        Want instant satellite-drop alerts? Connect Telegram below. Questions or feature requests — reply
        directly to the welcome email. Founder-led support.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a href="/account" className="px-4 py-2 rounded bg-text text-bg text-sm font-bold">
          Connect Telegram →
        </a>
        <a href="/pulse" className="px-4 py-2 rounded border border-border-custom text-sm font-bold hover:bg-surface">
          Browse {stats.sites} sites →
        </a>
      </div>
    </div>
  );
}
