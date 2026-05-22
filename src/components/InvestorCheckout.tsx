"use client";

import { useState } from "react";

export default function InvestorCheckout() {
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="inline-flex p-1 rounded-full border border-border-custom bg-surface text-sm">
        <button
          onClick={() => setPlan("annual")}
          className={`px-4 py-1.5 rounded-full transition-colors ${plan === "annual" ? "bg-text text-bg font-bold" : "text-dim"}`}
        >
          Annual <span className="text-[10px] ml-1">$99/yr · save 8%</span>
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
        {status === "loading" ? "Opening checkout…" : `Subscribe — ${plan === "annual" ? "$99 / year" : "$9 / month"}`}
      </button>

      {msg && (
        <div className={`text-xs ${status === "error" ? "text-amber-700" : "text-dim"} max-w-md text-center`}>
          {msg}
        </div>
      )}
      <div className="text-[11px] text-dim">Powered by Stripe · early-bird price grandfathered for life · cancel anytime</div>
    </div>
  );
}
