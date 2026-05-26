import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy — GIGASCOPE",
  description:
    "How refunds work for GIGASCOPE subscriptions. Pro-rata refunds for mid-cycle cancellation, EU 14-day cooling-off, Korean consumer protection, processing time. Effective 2026-05-26.",
  alternates: { canonical: "https://gigascope.xyz/refund-policy" },
  robots: { index: true, follow: true },
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-dim hover:text-text transition-colors">
          &larr; Home
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Refund Policy</h1>
        <p className="text-dim text-lg leading-relaxed">
          Plain English. Eligibility, how to request, and how long refunds take.
        </p>
        <p className="text-sm text-dim mt-4">Effective 2026-05-26.</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">1. Paddle as Merchant of Record</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE paid subscriptions are sold and processed by <strong>Paddle.com Market Limited</strong>
          (&ldquo;Paddle&rdquo;), acting as our Merchant of Record. Paddle issues the receipt, collects any
          applicable sales tax / VAT / GST, and processes refunds back to the original payment method.
        </p>
        <p className="text-text leading-relaxed mb-4">
          You can request a refund directly from Paddle using the link in your billing receipt, or by emailing
          GIGASCOPE support &mdash; we&rsquo;ll review and approve eligible requests through Paddle on your behalf.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">2. Standard refund — pro-rata on cancellation</h2>
        <p className="text-text leading-relaxed mb-4">
          If you cancel a subscription mid-cycle, you receive a <strong>pro-rata refund</strong> for the unused
          portion of the current billing cycle, calculated from the date your cancellation request is received.
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Monthly plan</strong>: refund of unused days in the current month (e.g. cancel on day 10 of a
            30-day cycle → refund of 20 days&rsquo; worth).
          </li>
          <li>
            <strong>Annual plan</strong>: refund of unused months in the current year, calculated against the
            actual amount paid (Charter members: against the locked annual rate).
          </li>
          <li>
            No refund is issued for prior <em>completed</em> billing cycles.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">3. EU/UK 14-day cooling-off</h2>
        <p className="text-text leading-relaxed mb-4">
          If you are a consumer in the European Union or the United Kingdom, you have a statutory right to
          withdraw from a digital-service contract within <strong>14 days</strong> of starting it, for any reason,
          with a full refund.
        </p>
        <p className="text-text leading-relaxed mb-4">
          By starting a paid subscription and immediately accessing paid-tier features, you consent to the digital
          service being supplied before the 14-day period ends and acknowledge that the right of withdrawal may be
          partially reduced once the service has been used. We will still refund the unused portion on a pro-rata
          basis (see section 2) within the 14-day window.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">4. Korean consumer protection</h2>
        <p className="text-text leading-relaxed mb-4">
          For consumers in the Republic of Korea, the Act on Consumer Protection in Electronic Commerce
          (전자상거래법) provides a 7-day right of withdrawal for digital content from the date of purchase or the
          date of first access, whichever is later. The right may be limited where the digital content has been
          consumed or where the limitation has been disclosed in advance, in accordance with Article 17(2) of the
          Act.
        </p>
        <p className="text-text leading-relaxed mb-4">
          In practice, GIGASCOPE will issue a pro-rata refund (section 2) regardless of the 7-day cap if the
          request is made in good faith and reflects a service-quality concern.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">5. How to request a refund</h2>
        <ol className="list-decimal pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Easiest path</strong>: open your most recent Paddle receipt email and click the
            &ldquo;Cancel subscription / request refund&rdquo; link. Paddle handles the rest.
          </li>
          <li>
            <strong>Or email</strong>{" "}
            <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
              sincetwentytwo@gmail.com
            </a>{" "}
            from the address associated with the subscription. Subject line: &ldquo;Refund request&rdquo;. Include
            your Paddle order ID (visible on the receipt) if you have it.
          </li>
        </ol>
        <p className="text-text leading-relaxed mb-4">
          We acknowledge requests within 2 business days and confirm the outcome within 5 business days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">6. Processing time</h2>
        <p className="text-text leading-relaxed mb-4">
          Once approved, Paddle issues the refund to your original payment method within{" "}
          <strong>14 business days</strong>. Bank or card-network settlement may add a further 3-5 business days
          before the refund appears on your statement, depending on your card issuer.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">7. Non-refundable cases</h2>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>Subscriptions cancelled <em>before</em> any charge took place (nothing to refund).</li>
          <li>Refund requests filed more than 90 days after the relevant charge.</li>
          <li>Subscriptions terminated for breach of the <Link href="/terms-of-service" className="underline hover:text-dim">Terms of Service</Link> (e.g. chargeback abuse, scraping at scale, fraudulent payment instrument).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">8. Chargebacks</h2>
        <p className="text-text leading-relaxed mb-4">
          If you have a billing concern, please contact us first &mdash; we resolve almost every legitimate
          dispute within 5 business days. Filing a chargeback before contacting us results in immediate forfeiture
          of Charter status and termination of the subscription, per the{" "}
          <Link href="/charter-terms" className="underline hover:text-dim">Charter terms</Link>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">9. Contact</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE / 기가스코프, business registration 568-24-02193, Seoul, Republic of Korea. Email:{" "}
          <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
            sincetwentytwo@gmail.com
          </a>
          .
        </p>
      </section>

      <footer className="mt-16 pt-6 border-t border-border-custom">
        <p className="text-sm text-dim">Last updated: 2026-05-26</p>
      </footer>
    </div>
  );
}
