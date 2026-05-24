"use client";

import { useState } from "react";

export default function EmailSignup({
  tier = "free",
  source = "footer",
  variant = "inline",
}: {
  tier?: "free" | "pro" | "terminal";
  source?: string;
  variant?: "inline" | "card";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, source }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus("ok");
        if (json.emailed) {
          setMsg("Subscribed. Check your inbox for the welcome email.");
        } else if (json.stored) {
          setMsg("Subscribed. You'll get the daily digest.");
        } else {
          setMsg("Got it. Storage not yet wired — saved locally.");
        }
        setEmail("");
      } else {
        setStatus("error");
        setMsg(json.error === "invalid_email" ? "That email doesn't look right." : "Couldn't sign you up. Try again later.");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Try again.");
    }
  };

  if (variant === "card") {
    return (
      <div className="p-6 rounded-lg border border-border-custom bg-surface">
        <h3 className="text-xl font-bold mb-1">Daily digest</h3>
        <p className="text-sm text-dim mb-4">
          One email a day. Catalysts that moved, satellite captures that dropped, milestones logged.
          Unsubscribe any time.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="flex-1 px-3 py-2 rounded border border-border-custom bg-bg text-sm focus:outline-none focus:border-text"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80 disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Get the daily digest"}
          </button>
        </form>
        {msg && (
          <div className={`text-xs mt-2 ${status === "ok" ? "text-green-600" : "text-red-500"}`}>{msg}</div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 items-stretch">
      <input
        type="email"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="email for the daily digest"
        className="flex-1 px-3 py-2 rounded border border-border-custom bg-bg text-sm focus:outline-none focus:border-text"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-4 py-2 rounded bg-text text-bg text-sm font-bold hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
      >
        {status === "loading" ? "..." : "Get the daily digest"}
      </button>
      {msg && (
        <span className={`text-xs self-center ${status === "ok" ? "text-green-600" : "text-red-500"}`}>{msg}</span>
      )}
    </form>
  );
}
