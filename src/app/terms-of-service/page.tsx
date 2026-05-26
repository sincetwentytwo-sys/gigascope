import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — GIGASCOPE",
  description:
    "Plain-English terms governing your use of GIGASCOPE. Service definition, account terms, acceptable use, intellectual property, disclaimers, governing law (Republic of Korea). Effective 2026-05-26.",
  alternates: { canonical: "https://gigascope.xyz/terms-of-service" },
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-dim hover:text-text transition-colors">
          &larr; Home
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-dim text-lg leading-relaxed">
          The agreement between you and GIGASCOPE for use of the website, the daily digest, and any paid subscription.
        </p>
        <p className="text-sm text-dim mt-4">
          Plain English. Effective 2026-05-26.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">1. Acceptance</h2>
        <p className="text-text leading-relaxed mb-4">
          By accessing gigascope.xyz, subscribing to the free email digest, or starting a paid subscription, you agree
          to these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">2. The service</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a subscription dashboard that tracks construction progress
          at 16 industrial sites operated by Tesla, SpaceX, xAI, Neuralink, and The Boring Company. We publish:
          satellite imagery comparisons (Sentinel-2, ESRI Wayback), hand-traced timelapses, milestone logs, a daily
          email digest, and (for paid charter members) priority alerts.
        </p>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is not affiliated with Tesla, SpaceX, xAI, Neuralink, The Boring Company, Elon Musk, or any
          subsidiary or affiliate thereof. All trademarks belong to their respective owners; we use them solely to
          identify the sites and products we track.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">3. Account and subscription</h2>
        <p className="text-text leading-relaxed mb-4">
          A free email address subscription gives access to the daily digest. A paid charter subscription unlocks
          additional features described on the{" "}
          <Link href="/pro" className="underline hover:text-dim">/pro</Link> page. Charter-specific commercial terms
          (price-lock, forfeiture conditions) are documented separately at{" "}
          <Link href="/charter-terms" className="underline hover:text-dim">/charter-terms</Link>.
        </p>
        <p className="text-text leading-relaxed mb-4">
          You are responsible for the email address you provide and for keeping it accurate. You may unsubscribe at
          any time using the link in any email, or by emailing the contact address below.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">4. Acceptable use</h2>
        <p className="text-text leading-relaxed mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>Scrape, crawl, or otherwise extract content at a rate that disrupts the service or circumvents the public API rate limits.</li>
          <li>Resell, sublicense, or redistribute the daily digest, satellite imagery, or paid-tier content without written permission.</li>
          <li>Use the service to defame, harass, or violate the rights of any third party.</li>
          <li>Submit false information (including a payment instrument that is not yours) to obtain access.</li>
          <li>Attempt to reverse-engineer paid features, bypass billing, or circumvent access controls.</li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          We may suspend or terminate access for any of the above, with or without notice depending on severity.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">5. Pricing, billing, and refunds</h2>
        <p className="text-text leading-relaxed mb-4">
          Paid subscriptions are processed by <strong>Paddle.com Market Limited</strong> (&ldquo;Paddle&rdquo;), our
          Merchant of Record. Paddle handles payment processing, sales-tax/VAT/GST collection and remittance, and
          customer support for billing matters. Prices on the{" "}
          <Link href="/pro" className="underline hover:text-dim">/pro</Link> page are in USD and exclude any
          applicable tax that Paddle will add at checkout.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Refund eligibility, request procedure, and processing time are documented at{" "}
          <Link href="/refund-policy" className="underline hover:text-dim">/refund-policy</Link>.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Subscriptions renew automatically at the rate locked at the start of the subscription (Charter members:
          see <Link href="/charter-terms" className="underline hover:text-dim">/charter-terms</Link>). Cancellation
          takes effect at the end of the current billing cycle unless a pro-rata refund is requested.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">6. Intellectual property</h2>
        <p className="text-text leading-relaxed mb-4">
          The GIGASCOPE codebase, dashboard, written commentary, hand-traced polygons, and curated timelapses are
          our copyrighted work. Subject to your paid subscription staying in good standing, we grant you a limited,
          non-exclusive, non-transferable, revocable license to access and view the content for your own
          investing-research purposes.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Underlying satellite imagery is licensed from third parties (Copernicus Sentinel-2 — free use under
          European Commission terms; ESRI World Imagery / Wayback — display use under ESRI tile-service terms).
          You may not extract or redistribute satellite imagery outside the GIGASCOPE viewing context without
          obtaining your own license from the upstream provider.
        </p>
        <p className="text-text leading-relaxed mb-4">
          The GIGASCOPE source code is published at{" "}
          <a
            href="https://github.com/sincetwentytwo-sys/gigascope"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-dim"
          >
            github.com/sincetwentytwo-sys/gigascope
          </a>{" "}
          under the license stated in the repository.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">7. Disclaimers — not financial advice</h2>
        <p className="text-text leading-relaxed mb-4">
          <strong>
            GIGASCOPE is strictly informational. We do not provide investment, trading, securities, tax, legal, or
            financial advice.
          </strong>{" "}
          The dashboard, digest, milestone logs, timelapses, and any commentary are research aids only and do not
          constitute a recommendation to buy, sell, or hold any security or other financial instrument.
        </p>
        <p className="text-text leading-relaxed mb-4">
          A GIGASCOPE subscription is a software service. It is not equity, a token, a stake in any business, or a
          security under any jurisdiction. It confers no ownership, voting rights, profit share, or financial
          interest in GIGASCOPE or its operator. You are paying for access to a software service.
        </p>
        <p className="text-text leading-relaxed mb-4">
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; Satellite imagery refresh
          cadence depends on Copernicus Sentinel-2, ESRI, and other upstream providers and is not guaranteed to
          any specific frequency. Milestone dates and confidence tiers are best-effort estimates from primary
          sources; we do not warrant their accuracy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">8. Limitation of liability</h2>
        <p className="text-text leading-relaxed mb-4">
          To the maximum extent permitted by applicable law, GIGASCOPE and its operator are not liable for any
          indirect, incidental, special, consequential, or punitive damages, including lost profits, lost trading
          opportunities, or losses arising from investment decisions made in reliance on the service.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Our aggregate liability arising from or relating to your use of the service is limited to the amount you
          paid us in the twelve (12) months preceding the event giving rise to the claim, or USD $50, whichever is
          greater.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">9. Termination</h2>
        <p className="text-text leading-relaxed mb-4">
          You may terminate your subscription at any time. We may terminate or suspend access if you breach these
          Terms or the Acceptable Use clause. On termination, your right to use the paid features ends; the free
          email digest remains available unless you also unsubscribe from that.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">10. Governing law and disputes</h2>
        <p className="text-text leading-relaxed mb-4">
          These Terms are governed by the laws of the Republic of Korea. Any dispute arising out of or relating to
          the service or these Terms will be brought in the courts of Seoul, Republic of Korea.
        </p>
        <p className="text-text leading-relaxed mb-4">
          If you are a consumer resident in the European Union, the United Kingdom, or another jurisdiction whose
          consumer-protection laws grant you mandatory rights, those rights are preserved.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">11. Changes to these Terms</h2>
        <p className="text-text leading-relaxed mb-4">
          We may update these Terms from time to time. Material changes will be communicated by email to active
          subscribers at least 30 days before they take effect. Continued use of the service after the effective
          date constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">12. Operator and contact</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is operated as a Korean sole proprietorship (개인사업자):
        </p>
        <ul className="list-none text-text leading-relaxed mb-4 space-y-1 text-sm font-mono">
          <li>Trade name: 기가스코프 (GIGASCOPE)</li>
          <li>Business registration: 568-24-02193</li>
          <li>Representative: Jaebin Kim</li>
          <li>Address: 42, Hongik-ro 5an-gil, Mapo-gu, Seoul 04039, Republic of Korea</li>
          <li>
            Email:{" "}
            <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
              sincetwentytwo@gmail.com
            </a>
          </li>
        </ul>
      </section>

      <footer className="mt-16 pt-6 border-t border-border-custom">
        <p className="text-sm text-dim">Last updated: 2026-05-26</p>
      </footer>
    </div>
  );
}
