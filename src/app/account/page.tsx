import type { Metadata } from "next";
import AccountTelegramLinker from "./AccountTelegramLinker";

export const metadata: Metadata = {
  title: "Account — Telegram link — GIGASCOPE",
  description:
    "Generate a fresh Telegram deep-link to connect your GIGASCOPE alerts to your Telegram chat.",
  alternates: { canonical: "https://gigascope.xyz/account" },
  robots: { index: false, follow: false },
};

/**
 * Account / Telegram-link page. Bot replies in `api/telegram/webhook` point
 * users here to (re)generate the t.me deep-link that ties their email to
 * their Telegram chat. Server component is just metadata + a client island
 * that POSTs to `api/telegram/link` and renders the resulting URL.
 *
 * No real "account" exists (auth isn't wired) — the page is single-purpose:
 * email → verified deep-link. We intentionally don't show the email in any
 * URL or pre-fill from cookies; users type it each time.
 */
export default function AccountPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Connect Telegram
        </h1>
        <p className="text-dim text-sm leading-relaxed max-w-prose">
          Generate a one-time deep-link to bind your GIGASCOPE email to a Telegram chat.
          You'll get catalyst alerts in Telegram in addition to email. Enter the same email
          you used to subscribe.
        </p>
      </header>

      <AccountTelegramLinker />

      <section className="mt-10 p-5 rounded border border-border-custom bg-surface text-xs text-dim leading-relaxed">
        <p className="mb-2">
          <strong className="text-text">How it works.</strong> We generate a signed token
          tied to your email, embed it in a <code>https://t.me/gigascopebot?start=…</code>
          link, and Telegram passes the token to our bot when you tap. The bot verifies it
          and links the chat. Tokens are server-signed (HMAC) so nobody can bind a chat
          to someone else's email.
        </p>
        <p>
          Don't have a subscription yet?{" "}
          <a href="/pro" className="underline">Sign up first</a>, then come back here.
        </p>
      </section>
    </div>
  );
}
