"use client";

import { useRef, useState } from "react";

/**
 * Charter checkout widget. When Stripe is live (`stripeLive=true`) it runs
 * the original Stripe Checkout flow. When billing is still gated, the button
 * morphs into a "Join charter waitlist" CTA that focuses the email input
 * below (passed by parent via `emailInputId`, or auto-discovered) — that way
 * users don't click Subscribe, get a 503, then have to hunt for the email
 * field.
 */
export default function InvestorCheckout({
  stripeLive = false,
  emailInputId,
}: {
  stripeLive?: boolean;
  emailInputId?: string;
}) {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");
  const focusFallbackRef = useRef<HTMLDivElement | null>(null);

  const go = async () => {
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.ok && json.url) {
        window.location.href = json.url;
      } else {
        setStatus("error");
        setMsg(
          json.error === "stripe_not_configured"
            ? "Billing isn't live yet — leave your email below and you'll get charter pricing the day it opens."
            : json.message ?? "Checkout failed. Try again in a minute.",
        );
      }
    } catch {
      setStatus("error");
      setMsg("Network error.");
    }
  };

  const focusEmailInput = () => {
    // Best-effort focus the parent email field. We accept either an id
    // (preferred — explicit contract) or fall back to the first input[type=email]
    // *after* this widget in the DOM order, so the page doesn't need to wire
    // anything to get a sensible scroll-into-view + focus.
    if (typeof document === "undefined") return;
    let el: HTMLInputElement | null = null;
    if (emailInputId) {
      el = document.getElementById(emailInputId) as HTMLInputElement | null;
    }
    if (!el && focusFallbackRef.current) {
      const widget = focusFallbackRef.current;
      const inputs = Array.from(
        document.querySelectorAll<HTMLInputElement>('input[type="email"]'),
      );
      el =
        inputs.find(
          (i) =>
            (widget.compareDocumentPosition(i) &
              Node.DOCUMENT_POSITION_FOLLOWING) !==
            0,
        ) ?? null;
    }
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Slight delay so smooth-scroll completes before focus snaps cursor.
      const target = el;
      setTimeout(() => target.focus({ preventScroll: true }), 250);
    }
  };

  // ── Waitlist mode (Stripe not live) ────────────────────────────────────
  // Hide price + "Subscribe"; route the click to the existing email input
  // below so the user gets ONE forward action that actually works.
  if (!stripeLive) {
    return (
      <div ref={focusFallbackRef} className="flex flex-col items-center gap-4">
        <div className="inline-flex p-1 rounded-full border border-border-custom bg-surface text-sm">
          <button
            onClick={() => setPlan("annual")}
            className={`px-4 py-1.5 rounded-full transition-colors ${plan === "annual" ? "bg-text text-bg font-bold" : "text-dim"}`}
          >
            Annual <span className="text-[10px] ml-1">$90/yr · save 17%</span>
          </button>
          <button
            onClick={() => setPlan("monthly")}
            className={`px-4 py-1.5 rounded-full transition-colors ${plan === "monthly" ? "bg-text text-bg font-bold" : "text-dim"}`}
          >
            Monthly $9
          </button>
        </div>

        <button
          type="button"
          onClick={focusEmailInput}
          className="px-8 py-3 rounded-full bg-text text-bg text-base font-bold hover:opacity-80"
        >
          Join charter waitlist
        </button>
        <div className="text-xs text-dim max-w-md text-center">
          Billing opens once charter spots fill — you'll be notified.
        </div>
      </div>
    );
  }

  // ── Live mode (future state) ───────────────────────────────────────────
  return (
    <div ref={focusFallbackRef} className="flex flex-col items-center gap-4">
      <div className="inline-flex p-1 rounded-full border border-border-custom bg-surface text-sm">
        <button
          onClick={() => setPlan("annual")}
          className={`px-4 py-1.5 rounded-full transition-colors ${plan === "annual" ? "bg-text text-bg font-bold" : "text-dim"}`}
        >
          Annual <span className="text-[10px] ml-1">$90/yr · save 17%</span>
        </button>
        <button
          onClick={() => setPlan("monthly")}
          className={`px-4 py-1.5 rounded-full transition-colors ${plan === "monthly" ? "bg-text text-bg font-bold" : "text-dim"}`}
        >
          Monthly $9
        </button>
      </div>

      <button
        onClick={go}
        disabled={status === "loading"}
        className="px-8 py-3 rounded-full bg-text text-bg text-base font-bold hover:opacity-80 disabled:opacity-50"
      >
        {status === "loading" ? "Opening checkout…" : `Subscribe — ${plan === "annual" ? "$90 / year" : "$9 / month"}`}
      </button>

      {msg && (
        <div className={`text-xs ${status === "error" ? "text-amber-700" : "text-dim"} max-w-md text-center`}>
          {msg}
        </div>
      )}
      <div className="text-[11px] text-dim">Powered by Stripe · charter price grandfathered for life · cancel anytime</div>
    </div>
  );
}
