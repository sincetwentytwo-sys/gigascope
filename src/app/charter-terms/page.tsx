import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Charter terms — price-lock — GIGASCOPE",
  description:
    "The Charter promise: first 100 paid subscribers get $9/month locked for life of subscription. Standard launches at $29 (June 2026), long-term target $49-79. Plain-English terms, no legalese.",
  alternates: { canonical: "https://gigascope.xyz/charter-terms" },
  robots: { index: true, follow: true },
};

export default function CharterTermsPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/pro"
          className="text-sm text-dim hover:text-text transition-colors"
        >
          &larr; Back to Charter membership
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Charter price-lock terms
        </h1>
        <p className="text-dim text-lg leading-relaxed">
          First 100 paid subscribers &mdash; $9/month locked for the life of your subscription.
        </p>
        <p className="text-sm text-dim mt-4">
          This page documents the Charter promise in writing so you know exactly what you&rsquo;re paying for
          before billing goes live. Plain English. No surprises.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">The charter promise</h2>
        <p className="text-text leading-relaxed mb-4">
          The first 100 people to start a paid GIGASCOPE charter subscription are &ldquo;Charter members.&rdquo;
          Charter members pay <strong>$9 USD per month</strong> (or the equivalent annual rate &mdash; see below),
          and that rate remains locked for the entire continuous life of the subscription.
        </p>
        <p className="text-text leading-relaxed mb-4">
          We will not raise the price on Charter members. Not when the standard rate goes up to $29. Not when it
          reaches the long-term target of $49&ndash;79. As long as your subscription stays active and in good
          standing, your rate stays at $9/month (or the locked annual equivalent).
        </p>
        <p className="text-text leading-relaxed mb-4">
          The 100-spot cap is firm. Once 100 paid subscriptions have started, Charter enrollment closes
          permanently and new subscribers pay the then-current standard rate.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Pricing schedule</h2>
        <p className="text-text leading-relaxed mb-4">
          We are disclosing the planned pricing path up front so you know what you are locking in against.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-custom">
            <thead className="text-left text-[11px] uppercase text-dim bg-surface">
              <tr>
                <th className="py-2.5 px-3 border-b border-border-custom">Tier</th>
                <th className="py-2.5 px-3 border-b border-border-custom">Monthly price (USD)</th>
                <th className="py-2.5 px-3 border-b border-border-custom">When</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Charter (first 100)</td>
                <td className="py-2.5 px-3">$9</td>
                <td className="py-2.5 px-3 text-dim">Locked for life of subscription</td>
              </tr>
              <tr className="border-b border-border-custom">
                <td className="py-2.5 px-3 font-medium">Standard</td>
                <td className="py-2.5 px-3">$29</td>
                <td className="py-2.5 px-3 text-dim">From June 2026 (when billing opens for non-charter signups)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Long-term target</td>
                <td className="py-2.5 px-3">$49&ndash;79</td>
                <td className="py-2.5 px-3 text-dim">As the product matures; not before notice</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 className="text-base font-bold mt-6 mb-2">Annual option</h3>
        <p className="text-text leading-relaxed mb-4">
          Charter members may also choose an annual plan at <strong>$90/year</strong> &mdash; a 17% discount on
          12&times;$9. The annual plan preserves Charter pricing on renewal: you renew at the same locked annual
          rate as long as the subscription stays continuously active.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">What forfeits charter status</h2>
        <p className="text-text leading-relaxed mb-4">
          Charter pricing is tied to your <strong>continuous subscription</strong>. If the subscription ends, the
          Charter rate ends with it. Specifically:
        </p>
        <ul className="list-disc pl-6 text-text leading-relaxed mb-4 space-y-2">
          <li>
            <strong>Voluntary cancellation</strong> forfeits Charter status. If you later re-subscribe, you pay
            the standard rate in effect at that time, not $9.
          </li>
          <li>
            <strong>Payment failure</strong> starts a 14-day grace period. During grace we will email you and
            keep the subscription alive at the Charter rate. If payment is not restored within 14 days, the
            subscription is cancelled and Charter status is forfeited.
          </li>
          <li>
            <strong>Chargebacks or fraud</strong> result in immediate forfeiture of Charter status and
            termination of the subscription.
          </li>
        </ul>
        <p className="text-text leading-relaxed mb-4">
          You can cancel at any time. There is no minimum term and no cancellation fee &mdash; but understand that
          cancelling means giving up the $9 lock permanently.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Service definition</h2>
        <p className="text-text leading-relaxed mb-4">
          A GIGASCOPE charter subscription gives you access to the features described on the
          <Link href="/pro" className="underline hover:text-dim"> /pro</Link> page at the time you
          subscribe. As of the &ldquo;last updated&rdquo; date below, that includes: the curated daily digest,
          satellite-drop and milestone email alerts, interactive component breakdowns, CSV/JSON data exports,
          comparison tools, and an ad-free experience.
        </p>
        <p className="text-text leading-relaxed mb-4">
          We reserve the right to <strong>add or improve</strong> features over time without changing your price.
          We do <strong>not</strong> reserve the right to silently remove material features that Charter members
          subscribed for. If a meaningful feature must be removed (for example, a third-party data source goes
          dark), we will notify subscribers by email at least 30 days in advance and offer a pro-rata refund for
          the remainder of the current billing cycle if you choose to cancel.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Service is provided &ldquo;as is.&rdquo; Satellite imagery refresh cadence depends on Copernicus
          Sentinel-2, ESRI, and other upstream providers and is not guaranteed to a specific frequency.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Refund policy</h2>
        <p className="text-text leading-relaxed mb-4">
          If you cancel mid-cycle, you receive a <strong>pro-rata refund</strong> for the unused portion of the
          current billing cycle, calculated from the date your cancellation request is received. No refund is
          issued for prior completed billing cycles.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Annual subscribers cancelling mid-year receive a pro-rata refund of the unused months, calculated
          against the locked annual rate paid.
        </p>
        <p className="text-text leading-relaxed mb-4">
          Refunds are issued to the original payment method within 14 business days.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Not a security</h2>
        <p className="text-text leading-relaxed mb-4">
          A GIGASCOPE charter subscription is a <strong>software subscription</strong>. It is not equity in any
          company, not a token, not a stake in any business, and not a security under any jurisdiction&rsquo;s
          law. It confers no ownership, voting rights, profit share, or financial interest in GIGASCOPE or its
          operator. You are paying for access to a software service.
        </p>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is industrial intelligence built for people who follow Musk-orbit industrial build-out for
          investing-research purposes &mdash; the subscription does not create any investment relationship
          between you and GIGASCOPE.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Operator and governing law</h2>
        <p className="text-text leading-relaxed mb-4">
          GIGASCOPE is operated by Jaebin, based in Seoul, Republic of Korea. Charter membership sign-up is
          available now. Card billing activates once Korean business registration completes
          &mdash; in progress, expected within 1&ndash;2 weeks &mdash; and no charges occur before then. Signing
          up now locks in the $9/month charter rate for the life of your subscription. This page will be updated
          with the registered business name and number on the day billing opens.
        </p>
        <p className="text-text leading-relaxed mb-4">
          These terms are governed by the laws of the Republic of Korea. Any dispute arising out of or relating
          to a GIGASCOPE charter subscription will be brought in the courts of Seoul, Republic of Korea.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Changes to these terms</h2>
        <p className="text-text leading-relaxed mb-4">
          We may update these terms from time to time &mdash; for example, to clarify language, reflect the
          registered business name on the day billing opens, or address things we did not anticipate.
        </p>
        <p className="text-text leading-relaxed mb-4">
          <strong>The Charter price-lock cannot be changed adversely for existing Charter members.</strong> That
          is the core promise of this page and it is locked. Other terms (refund timelines, dispute procedure,
          service definition wording, etc.) may be revised; material changes will be communicated by email at
          least 30 days before they take effect, and Charter members may cancel before the new terms apply with
          a full pro-rata refund of the current cycle.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mt-12 mb-3">Contact</h2>
        <p className="text-text leading-relaxed mb-4">
          For questions about these terms, billing, cancellation, or refunds, email{" "}
          <a
            href="mailto:sincetwentytwo@gmail.com"
            className="underline hover:text-dim"
          >
            sincetwentytwo@gmail.com
          </a>
          . A dedicated support@gigascope.xyz address comes online the day billing opens; the founder address
          above remains an official contact channel.
        </p>
      </section>

      <footer className="mt-16 pt-6 border-t border-border-custom">
        <p className="text-sm text-dim">Last updated: 2026-05-24</p>
      </footer>
    </div>
  );
}
