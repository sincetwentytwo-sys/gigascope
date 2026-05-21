"use client";

import { useEffect, useState } from "react";

export default function SearchOpener() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /mac/i.test(navigator.platform));
  }, []);
  const open = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  return (
    <button
      onClick={open}
      className="hidden sm:inline-flex items-center gap-2 text-[12px] text-dim px-2.5 py-1 rounded border border-border-custom hover:border-text"
      aria-label="Open search"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      Search
      <kbd className="px-1 text-[10px] border border-border-custom rounded">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}
