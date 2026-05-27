"use client";

import { useEffect, useState } from "react";

type VoteState = "idle" | "loading" | "ok" | "voted" | "rate_limited" | "error";

const LS_KEY = "gigascope:roadmap:voted";

function readVotedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return new Set(parsed.filter((v) => typeof v === "string"));
    return new Set();
  } catch {
    return new Set();
  }
}

function writeVotedSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage quota / disabled — non-fatal, the server still
    // dedupes by IP so the only cost is a possible double-click during
    // this session, which the disabled button below also blocks.
  }
}

export default function RoadmapVote({
  id,
  initialCount,
}: {
  id: string;
  initialCount: number;
}) {
  const [state, setState] = useState<VoteState>("idle");
  const [count, setCount] = useState<number>(initialCount);
  const [toast, setToast] = useState<string>("");

  // Hydrate the "voted" state from localStorage after mount. SSR-safe:
  // we never read window during render, only inside this effect.
  useEffect(() => {
    const voted = readVotedSet();
    if (voted.has(id)) setState("voted");
  }, [id]);

  const submit = async () => {
    if (state === "loading" || state === "voted") return;
    setState("loading");
    setToast("");
    try {
      const res = await fetch("/api/roadmap/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        count?: number;
        error?: string;
      };
      if (res.ok && json.ok) {
        setCount(typeof json.count === "number" ? json.count : count + 1);
        setState("voted");
        const voted = readVotedSet();
        voted.add(id);
        writeVotedSet(voted);
        return;
      }
      // 409 = already voted (server-side dedupe). Persist client-side
      // too so the button stays disabled across page loads.
      if (res.status === 409) {
        if (typeof json.count === "number") setCount(json.count);
        setState("voted");
        const voted = readVotedSet();
        voted.add(id);
        writeVotedSet(voted);
        return;
      }
      if (res.status === 429) {
        setState("rate_limited");
        setToast("Too many votes — try again in an hour.");
        return;
      }
      if (res.status === 503) {
        setState("error");
        setToast("Voting temporarily unavailable. Try again later.");
        return;
      }
      setState("error");
      setToast(json.error ? `Couldn't record vote (${json.error}).` : "Couldn't record vote.");
    } catch {
      setState("error");
      setToast("Network error. Try again.");
    }
  };

  const isVoted = state === "voted";
  const isLoading = state === "loading";
  const label = isVoted
    ? `Voted · ${count}`
    : isLoading
      ? "..."
      : `Vote · ${count}`;

  return (
    <div className="flex flex-col items-end gap-1 min-w-[110px]">
      <button
        type="button"
        onClick={submit}
        disabled={isVoted || isLoading}
        aria-label={isVoted ? `You voted for this feature, ${count} total votes` : `Vote for this feature, ${count} current votes`}
        className={`px-4 py-2 rounded text-sm font-bold whitespace-nowrap transition-colors ${
          isVoted
            ? "bg-surface text-dim border border-border-custom cursor-default"
            : "bg-text text-bg hover:opacity-80 disabled:opacity-50"
        }`}
      >
        {label}
      </button>
      {toast && (
        <span
          role={state === "rate_limited" || state === "error" ? "alert" : undefined}
          className="text-[11px] text-red-500 max-w-[180px] text-right leading-snug"
        >
          {toast}
        </span>
      )}
    </div>
  );
}
