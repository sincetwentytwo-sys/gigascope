import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're an Investor — welcome — GIGASCOPE",
  robots: { index: false, follow: false },
};

export default function InvestorSuccess() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-4">⚡</div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-3">You're in.</h1>
      <p className="text-dim mb-6">
        Charter pricing locked. We'll send the first daily digest within 24 hours, plus a welcome email
        with what's next.
      </p>
      <p className="text-sm text-dim mb-8">
        Questions or feature requests — reply directly to the welcome email. Founder-led support.
      </p>
      <div className="flex justify-center gap-3">
        <a href="/" className="px-4 py-2 rounded bg-text text-bg text-sm font-bold">Open the Atlas →</a>
        <a href="/watchlist" className="px-4 py-2 rounded border border-border-custom text-sm">Set up watchlist</a>
      </div>
    </div>
  );
}
