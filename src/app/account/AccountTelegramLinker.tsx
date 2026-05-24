"use client";

import { useState } from "react";

type LinkResult = { url: string } | { error: string };

/**
 * Client island for /account. POSTs the email to `/api/telegram/link`,
 * which validates membership + signs a token, then renders the t.me URL.
 * Deliberately minimal — no cookie reading, no localStorage; the user
 * types each time. That keeps this safe to share/screenshot without
 * leaking other people's emails.
 */
export default function AccountTelegramLinker() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<LinkResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (res.ok && json.ok && typeof json.url === "string") {
        setStatus("ok");
        setResult({ url: json.url });
        return;
      }
      // Map server error codes to user-readable strings without leaking
      // whether an email is subscribed (server already returns the same 404
      // for missing-and-not-subscribed cases).
      const error =
        json.error === "telegram_not_configured"
          ? "Telegram alerts aren't live yet. Check back soon."
          : json.error === "redis_not_configured"
          ? "Service temporarily unavailable. Try again later."
          : json.error === "invalid_email"
          ? "That email doesn't look right."
          : json.error === "not_found"
          ? "We couldn't find that email on GIGASCOPE. Subscribe first, then come back."
          : "Couldn't generate a link. Try again.";
      setStatus("error");
      setResult({ error });
    } catch {
      setStatus("error");
      setResult({ error: "Network error. Try again." });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          aria-label="Your GIGASCOPE email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="flex-1 px-3 py-2 rounded border border-border-custom bg-bg text-sm focus:outline-none focus:border-text"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
        >
          {status === "loading" ? "Generating…" : "Generate link"}
        </button>
      </form>

      {result && "url" in result && (
        <div className="p-4 rounded border border-border-custom bg-surface flex flex-col gap-3">
          <p className="text-sm text-text">Link ready — tap to open Telegram and bind this chat:</p>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80 self-start"
          >
            Open in Telegram →
          </a>
          <p className="text-[11px] text-dim break-all">{result.url}</p>
          <p className="text-[11px] text-dim">
            Link is single-use against the bot but stays valid until you cancel — share-safe
            only with yourself. If you used the wrong email, generate a new one above.
          </p>
        </div>
      )}

      {result && "error" in result && (
        <div className="text-xs text-amber-700">{result.error}</div>
      )}
    </div>
  );
}
