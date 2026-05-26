import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — GIGASCOPE",
  description:
    "What data GIGASCOPE collects, why, how long we keep it, who we share it with (Paddle, Resend, Upstash, Vercel), and how to exercise your rights under PIPA (Korea), GDPR (EU), and CCPA (California). Effective 2026-05-26.",
  alternates: { canonical: "https://gigascope.xyz/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-dim hover:text-text transition-colors">
          &larr; Home
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-dim text-lg leading-relaxed">
          What we collect, why, how long we keep it, and what control you have over it.
        </p>
        <p className="text-sm text-dim mt-4">Plain English. Effective 2026-05-26.</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">1. Who we are</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is operated as a Korean sole proprietorship (개인사업자) by Jaebin Kim, registered as 기가스코프
          (GIGASCOPE), business registration number 568-24-02193, based at 42, Hongik-ro 5an-gil, Mapo-gu,
          Seoul 04039, Republic of Korea. Contact:{" "}
          <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
            sincetwentytwo@gmail.com
          </a>
          .
        </p>
        <p className="text-text leading-relaxed mb-4">
          We are the &ldquo;data controller&rdquo; for the personal data described below. The same individual
          serves as the personal-information manager (개인정보 보호책임자) under the Korean Personal Information
          Protection Act (PIPA).
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">2. What we collect</h2>
        <p className="text-text leading-relaxed mb-4">
          We minimize collection. The categories we collect are:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Email address</strong> &mdash; collected when you subscribe to the free digest or start a paid
            subscription. Used to send the digest, billing receipts, and service notices.
          </li>
          <li>
            <strong>Subscription tier and status</strong> &mdash; whether you are on the free digest, charter paid
            tier, or unsubscribed; the timestamp of state changes.
          </li>
          <li>
            <strong>Telegram chat ID</strong> &mdash; only if you explicitly link a Telegram account at{" "}
            <Link href="/account" className="underline hover:text-dim">/account</Link>. Used to deliver alerts you
            opted into.
          </li>
          <li>
            <strong>Server-side request data</strong> &mdash; standard web-server access logs: IP address,
            user-agent, request path, timestamp. Retained for security and rate-limiting; not used for advertising.
          </li>
          <li>
            <strong>Payment and billing data</strong> &mdash; processed by Paddle, our Merchant of Record. We
            receive only the subscription status, customer identifier, and country (for tax classification). We
            <strong> do not store</strong> card numbers, bank details, or full billing addresses.
          </li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          We do not run third-party advertising trackers. The site uses a privacy-respecting visit counter that
          stores only an aggregate count per IP per day in our Upstash Redis store.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">3. Why we collect (lawful basis)</h2>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Performance of contract</strong> &mdash; to deliver the digest, alerts, and paid features you
            signed up for.
          </li>
          <li>
            <strong>Legitimate interest</strong> &mdash; to operate, secure, and improve the service (rate
            limiting, anti-abuse, debugging).
          </li>
          <li>
            <strong>Consent</strong> &mdash; for optional features such as Telegram linking and any future
            marketing emails (none currently sent).
          </li>
          <li>
            <strong>Legal obligation</strong> &mdash; tax record-keeping under Korean law (5-year retention of
            transactional records).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">4. Who we share data with</h2>
        <p className="text-text leading-relaxed mb-4">
          We share data only with the processors needed to operate the service. We do not sell personal data.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-custom">
            <thead className="text-left text-[11px] uppercase text-dim bg-surface">
              <tr>
                <th className="py-2.5 px-3 border-b border-border-custom">Processor</th>
                <th className="py-2.5 px-3 border-b border-border-custom">Purpose</th>
                <th className="py-2.5 px-3 border-b border-border-custom">Location</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Paddle.com Market Limited</td>
                <td className="py-2.5 px-3">Payment processing, tax remittance, billing support (Merchant of Record)</td>
                <td className="py-2.5 px-3 text-dim">United Kingdom / United States</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Resend, Inc.</td>
                <td className="py-2.5 px-3">Transactional email delivery (digest, receipts, alerts)</td>
                <td className="py-2.5 px-3 text-dim">United States</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Upstash, Inc.</td>
                <td className="py-2.5 px-3">Redis storage for subscriber list, visit counters, dedup flags</td>
                <td className="py-2.5 px-3 text-dim">United States (US-east region)</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Vercel, Inc.</td>
                <td className="py-2.5 px-3">Web hosting, CDN, serverless function execution</td>
                <td className="py-2.5 px-3 text-dim">United States (multi-region)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Telegram Messenger LLP</td>
                <td className="py-2.5 px-3">Optional bot alerts (only if you link Telegram)</td>
                <td className="py-2.5 px-3 text-dim">Global infrastructure</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-text leading-relaxed mb-4 mt-4">
          Each processor receives only the minimum data needed for its function and is contractually bound to use
          that data only for service delivery.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">5. International data transfer</h2>
        <p className="text-text leading-relaxed mb-4">
          Our processors are based primarily in the United States. Cross-border transfers from Korea, the EU, and
          the UK rely on the processors&rsquo; standard contractual clauses or equivalent safeguards. If you are
          located in a jurisdiction with data-localization requirements that cannot be met by US-hosted services,
          please do not use the paid service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">6. How long we keep data</h2>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Free subscribers</strong>: email + subscription state kept until you unsubscribe. On
            unsubscribe, the address is removed from the active mailing set within 24 hours; unsubscribe-event
            logs are retained for one year to comply with anti-spam laws.
          </li>
          <li>
            <strong>Paid subscribers</strong>: subscription record kept for the duration of the subscription plus
            <strong> 5 years</strong> after the last transaction, as required by Korean tax law (전자상거래법 6조,
            국세기본법 85조의3).
          </li>
          <li>
            <strong>Server access logs</strong>: 90 days, then aggregated and discarded.
          </li>
          <li>
            <strong>Telegram chat link</strong>: kept until you /stop the bot or unsubscribe.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">7. Your rights</h2>
        <p className="text-text leading-relaxed mb-4">
          Depending on your jurisdiction, you have the right to:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Correct</strong> inaccurate data.</li>
          <li><strong>Delete</strong> your data (subject to retention obligations above).</li>
          <li><strong>Export</strong> your data in a portable format.</li>
          <li><strong>Object</strong> to processing based on legitimate interest.</li>
          <li><strong>Withdraw consent</strong> for any processing based on consent.</li>
          <li><strong>Lodge a complaint</strong> with your local data-protection authority (Korea: 개인정보보호위원회; EU: your national DPA; UK: ICO; California: California Privacy Protection Agency).</li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          To exercise any of these, email{" "}
          <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
            sincetwentytwo@gmail.com
          </a>{" "}
          from the address associated with your subscription. We respond within 30 days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">8. Cookies</h2>
        <p className="text-text leading-relaxed mb-4">
          The site uses no marketing or tracking cookies. Strictly-necessary cookies may be set by our hosting and
          payment providers for fraud prevention, session continuity, and billing flow.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">9. Children</h2>
        <p className="text-text leading-relaxed mb-4">
          The service is not directed to children. We do not knowingly collect personal data from anyone under 14
          (Korea) or under 16 (EU). If you believe we have collected data from a child, email the contact above
          and we will delete the data.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">10. Security</h2>
        <p className="text-text leading-relaxed mb-4">
          All traffic between you and the service is TLS-encrypted. Subscriber data at rest is stored on Upstash
          and Vercel infrastructure with encryption at rest. Payment data is never stored on our infrastructure;
          it lives only with Paddle. Access to production systems is restricted to the operator.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">11. Changes to this policy</h2>
        <p className="text-text leading-relaxed mb-4">
          Material changes will be communicated by email to active subscribers at least 30 days before they take
          effect. The current version date is shown at the bottom of this page; prior versions are available on
          request.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">12. Contact</h2>
        <p className="text-text leading-relaxed mb-4">
          For privacy questions, data-subject requests, or complaints:{" "}
          <a href="mailto:sincetwentytwo@gmail.com" className="underline hover:text-dim">
            sincetwentytwo@gmail.com
          </a>
          . Mark the subject line &ldquo;Privacy request&rdquo; for fastest handling.
        </p>
      </section>

      <footer className="mt-16 pt-6 border-t border-border-custom">
        <p className="text-sm text-dim">Last updated: 2026-05-26</p>
      </footer>
    </div>
  );
}
