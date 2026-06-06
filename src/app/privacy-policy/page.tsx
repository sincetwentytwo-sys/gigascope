import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — GIGASCOPE",
  description:
    "What data GIGASCOPE collects, why, how long we keep it, who we share it with, and how to exercise your rights under PIPA (Korea), GDPR (EU), and CCPA (California).",
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
        <p className="text-sm text-dim mt-4">Effective 2026-05-27.</p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">1. Who we are</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is operated as a Korean sole proprietorship by Jaebin Kim, registered as GIGASCOPE,
          business registration number 568-24-02193, based at 42, Hongik-ro 5an-gil, Mapo-gu,
          Seoul 04039, Republic of Korea. Contact:{" "}
          <a href="mailto:support@gigascope.xyz" className="underline hover:text-dim">
            support@gigascope.xyz
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
            <strong>Email address</strong>. Collected when you subscribe to the free digest or start a paid
            subscription. Used to send the digest, billing receipts, and service notices.
          </li>
          <li>
            <strong>Subscription tier and status</strong>. Whether you are on the free digest, paid charter tier,
            or unsubscribed; the timestamp of state changes; the source string identifying which page you
            signed up from.
          </li>
          <li>
            <strong>Telegram chat ID</strong>. Only if you explicitly link a Telegram account at{" "}
            <Link href="/account" className="underline hover:text-dim">/account</Link>. Used to deliver alerts you
            opted into.
          </li>
          <li>
            <strong>Server-side request data</strong>. Standard web-server access logs (IP address, user-agent,
            request path, timestamp). The signup IP is held for at most one hour as a per-IP rate-limit
            counter and is never linked to an email address. Visit-counter records hash the IP plus
            user-agent (SHA-256, truncated) so the underlying IP cannot be recovered from our store.
          </li>
          <li>
            <strong>Payment and billing data</strong>. Processed by a third-party payment provider acting as our
            Merchant of Record. We receive only subscription status, customer identifier, and country (for tax
            classification). We do not store card numbers, bank details, or full billing addresses.
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
            <strong>Consent (GDPR Art. 6(1)(a); PIPA Art. 15(1)(1))</strong>. Free-digest signup is consent-based.
            Submitting the email form counts as consent; you can withdraw it at any time via the unsubscribe link
            in every email or by emailing us.
          </li>
          <li>
            <strong>Performance of contract (GDPR Art. 6(1)(b); PIPA Art. 15(1)(4))</strong>. To deliver paid
            charter features, billing receipts, and refunds you signed up for.
          </li>
          <li>
            <strong>Legitimate interest (GDPR Art. 6(1)(f))</strong>. To operate, secure, and improve the service
            (rate-limiting, anti-abuse, debugging).
          </li>
          <li>
            <strong>Consent</strong>. For optional features such as Telegram linking and any future marketing
            emails (none currently sent).
          </li>
          <li>
            <strong>Legal obligation (GDPR Art. 6(1)(c))</strong>. Tax record-keeping as required by Korean
            Commercial Code Art. 33 and the Framework Act on National Taxes (5-year retention).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">4. Where your data is actually stored</h2>
        <p className="text-text leading-relaxed mb-4">
          For full transparency, here is every place we hold data tied to your email address. Records that
          are not listed are not collected.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-custom mb-4">
            <thead className="bg-bg-2 text-dim">
              <tr>
                <th className="text-left px-3 py-2 border-b border-border-custom">Store</th>
                <th className="text-left px-3 py-2 border-b border-border-custom">What it contains</th>
                <th className="text-left px-3 py-2 border-b border-border-custom">Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">subscribers:emails</td>
                <td className="px-3 py-2">Active mailing-list set (email only).</td>
                <td className="px-3 py-2">Until unsubscribe.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">subscriber:{`<email>`}</td>
                <td className="px-3 py-2">Email, tier, signup-source string, timestamp; paid-only: Stripe IDs, plan, paidAt.</td>
                <td className="px-3 py-2">Free: until unsubscribe. Paid: 5 years after last transaction (KR tax).</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">subscribers:timeline</td>
                <td className="px-3 py-2">Sorted set of email → signup timestamp.</td>
                <td className="px-3 py-2">Same as subscriber hash above.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">telegram:chat:{`<email>`} / telegram:email:{`<chat_id>`}</td>
                <td className="px-3 py-2">Bidirectional link between email and Telegram chat ID (only if you used /start).</td>
                <td className="px-3 py-2">Until you send /stop to the bot, or unsubscribe.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">drip:sent:{`<email>`}:dN</td>
                <td className="px-3 py-2">Flag that drip N was already sent to this email (dedup).</td>
                <td className="px-3 py-2">400 days, or deleted on unsubscribe.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">catalyst:alert:sent:{`<email>`}:{`<id>`}:{`<window>`}</td>
                <td className="px-3 py-2">Flag that a T-7 / T-1 / T-0 milestone alert was already sent.</td>
                <td className="px-3 py-2">400 days, or deleted on unsubscribe.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">ratelimit:subscribe:{`<ip>`}</td>
                <td className="px-3 py-2">Per-IP signup counter (anti-abuse). Not linked to any email.</td>
                <td className="px-3 py-2">1 hour TTL.</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="px-3 py-2 font-mono text-xs">visits:{`<date>`}:uniques</td>
                <td className="px-3 py-2">SHA-256 hash of IP+UA. Pseudonymous; not reversible to PII.</td>
                <td className="px-3 py-2">48 hours.</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-xs">metric:sent:{`<type>`}:*</td>
                <td className="px-3 py-2">Aggregate per-email-type send counts. No per-user data.</td>
                <td className="px-3 py-2">90 days per-day; lifetime total has no TTL.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">5. Sub-processors</h2>
        <p className="text-text leading-relaxed mb-4">
          We share data only with the service providers needed to operate the site. We do not sell personal data.
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Upstash, Inc. (United States)</strong> — Redis storage for the subscriber list, Telegram
            links, dedup flags, and visit counters. Bound by Upstash&rsquo;s standard Data Processing Addendum
            including EU Standard Contractual Clauses.
          </li>
          <li>
            <strong>Resend, Inc. (United States)</strong> — Transactional and digest email delivery. Bound by
            Resend&rsquo;s Data Processing Addendum incorporating EU SCCs.
          </li>
          <li>
            <strong>Vercel, Inc. (United States)</strong> — Hosting, serverless function execution, edge
            request logs. Bound by Vercel&rsquo;s DPA and SCCs.
          </li>
          <li>
            <strong>Telegram FZ-LLC (Dubai, UAE)</strong> — Delivers bot messages if and only if you choose to
            link a Telegram chat. Telegram&rsquo;s own privacy policy governs its handling of the chat ID.
          </li>
          <li>
            <strong>Payment Merchant of Record</strong> — Currently onboarding; once live, the active provider
            will be named on the checkout page and every billing receipt. It will act as a separate controller
            for tax-invoicing purposes and as a processor for fraud-prevention purposes.
          </li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          Each provider receives only the minimum data needed for its function, and is contractually bound to use
          that data only for service delivery.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">6. International data transfer</h2>
        <p className="text-text leading-relaxed mb-4">
          The personal data we collect is exported from Korea to the United States so that Upstash, Resend, and
          Vercel can process it. This transfer is performed under:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            For EU / UK / EEA data subjects: the European Commission&rsquo;s Standard Contractual Clauses
            incorporated in each processor&rsquo;s DPA (GDPR Art. 46(2)(c)).
          </li>
          <li>
            For Korean data subjects: explicit consent at signup pursuant to PIPA Art. 28(8), with the
            recipient, transfer purpose, data categories, retention period, and refusal rights disclosed
            here. The recipients are the three US processors named in section 5; the purpose is operating
            the digest, alerts, and paid-subscription service; the retention follows section 7; you may
            refuse cross-border transfer by not subscribing, in which case the service is not available.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">7. How long we keep data</h2>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Free subscribers</strong>: email + subscription state kept until you unsubscribe. On
            unsubscribe, every record listed in section 4 above is deleted within 24 hours; an event-level
            unsubscribe log (timestamp only, no email retained) may be kept for one year to comply with
            anti-spam laws.
          </li>
          <li>
            <strong>Paid subscribers</strong>: subscription record kept for the duration of the subscription plus
            <strong> 5 years</strong> after the last transaction, in line with Korean tax record-retention rules
            for businesses (Framework Act on National Taxes; Commercial Code Art. 33).
          </li>
          <li>
            <strong>Server access logs</strong>: 30 days at Vercel&rsquo;s edge, then discarded.
          </li>
          <li>
            <strong>Telegram chat link</strong>: kept until you /stop the bot or unsubscribe.
          </li>
          <li>
            <strong>Visit-counter hashes</strong>: 48 hours per-day; lifetime aggregate is a non-reversible
            HyperLogLog approximation, not personal data.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">8. Your rights — GDPR / UK GDPR / CCPA</h2>
        <p className="text-text leading-relaxed mb-4">
          If you are in the EU, UK, or California you have the right to:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li><strong>Access</strong> the personal data we hold about you (GDPR Art. 15; CCPA &sect;1798.110).</li>
          <li><strong>Correct</strong> inaccurate data (GDPR Art. 16).</li>
          <li><strong>Delete</strong> your data (GDPR Art. 17; CCPA &sect;1798.105), subject to retention obligations above.</li>
          <li><strong>Export</strong> your data in a portable JSON format (GDPR Art. 20).</li>
          <li><strong>Object</strong> to processing based on legitimate interest (GDPR Art. 21).</li>
          <li><strong>Withdraw consent</strong> for any processing based on consent.</li>
          <li><strong>Opt-out of sale or sharing</strong> of personal data (CCPA &sect;1798.120). We do not sell or share for cross-context advertising; this right is informational.</li>
          <li><strong>Lodge a complaint</strong> with the EU Member State DPA, the UK ICO, or the California Privacy Protection Agency.</li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          To exercise any of these, email{" "}
          <a href="mailto:support@gigascope.xyz" className="underline hover:text-dim">
            support@gigascope.xyz
          </a>{" "}
          from the address associated with your subscription with subject line &ldquo;Privacy request&rdquo;.
          We respond within 30 days (GDPR) or 45 days (CCPA). Identity is verified by sending a one-click
          confirmation link to the registered email.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">9. Your rights — PIPA (Korea)</h2>
        <p className="text-text leading-relaxed mb-4">
          Korean residents have the following rights under the Personal Information Protection Act:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Right to be informed</strong> of processing purposes, items, retention, and recipients
            (PIPA Art. 4(1), Art. 20) — this policy itself.
          </li>
          <li>
            <strong>Right to access</strong> personal information held about you (PIPA Art. 35).
          </li>
          <li>
            <strong>Right to correction or deletion</strong> (PIPA Art. 36).
          </li>
          <li>
            <strong>Right to suspend processing</strong> (PIPA Art. 37).
          </li>
          <li>
            <strong>Right to refuse consent</strong> to cross-border transfer (PIPA Art. 28(8)). The
            consequence is that the service cannot be provided.
          </li>
          <li>
            <strong>Right to file a complaint</strong> with the Personal Information Protection Commission
            (개인정보보호위원회) on{" "}
            <a href="https://www.privacy.go.kr" className="underline" target="_blank" rel="noreferrer">
              www.privacy.go.kr
            </a>{" "}
            or the Korea Internet & Security Agency (KISA) on 118.
          </li>
          <li>
            <strong>Right to compensation</strong> for damage caused by violations (PIPA Art. 39).
          </li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          <strong>Personal-information manager (개인정보 보호책임자):</strong> Jaebin Kim, contact{" "}
          <a href="mailto:support@gigascope.xyz" className="underline hover:text-dim">
            support@gigascope.xyz
          </a>
          . Korean-language requests are accepted and answered in Korean.
        </p>
        <p className="text-text leading-relaxed mb-4">
          <strong>Cross-border transfer notice (PIPA Art. 28(8)):</strong> By subscribing, you consent to
          transfer of your email and Telegram chat ID (if linked) to the United States for storage and
          processing by Upstash, Resend, and Vercel as listed in section 5, for the purposes and retention
          periods described in this policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">10. Cookies</h2>
        <p className="text-text leading-relaxed mb-4">
          The site uses no marketing or tracking cookies. Strictly-necessary cookies may be set by our hosting and
          payment providers for fraud prevention, session continuity, and billing flow.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">11. Children</h2>
        <p className="text-text leading-relaxed mb-4">
          The service is not directed to children. We do not knowingly collect personal data from anyone under 14
          (Korea), under 16 (EU), or under 13 (US). If you believe we have collected data from a child, email the
          contact above and we will delete the data without delay.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">12. Security</h2>
        <p className="text-text leading-relaxed mb-4">
          All traffic between you and the service is TLS-encrypted. Subscriber data at rest is stored on Upstash
          and Vercel infrastructure with encryption at rest. Payment data is never stored on our infrastructure.
          It lives only with the third-party payment provider. Access to production systems is restricted to the
          operator using a personal credential.
        </p>
        <p className="text-text leading-relaxed mb-4">
          <strong>Breach notification:</strong> if a personal-data breach is likely to result in a risk to your
          rights or freedoms, we will notify the lead supervisory authority within 72 hours (GDPR Art. 33) and
          the Personal Information Protection Commission and affected individuals within 72 hours (PIPA Art. 34
          / Notification on Personal Information Safety Measures). Notice to affected users is delivered by
          email to the address on file and, when material, posted on this page.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">13. Changes to this policy</h2>
        <p className="text-text leading-relaxed mb-4">
          Material changes will be communicated by email to active subscribers at least 30 days before they take
          effect. The current version date is shown at the bottom of this page; prior versions are available on
          request.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">14. Contact</h2>
        <p className="text-text leading-relaxed mb-4">
          For privacy questions, data-subject requests, or complaints:{" "}
          <a href="mailto:support@gigascope.xyz" className="underline hover:text-dim">
            support@gigascope.xyz
          </a>
          . Mark the subject line &ldquo;Privacy request&rdquo; for fastest handling. You may write in English
          or Korean.
        </p>
      </section>

      <footer className="mt-16 pt-6 border-t border-border-custom">
        <p className="text-sm text-dim">Last updated: 2026-05-27</p>
      </footer>
    </div>
  );
}
