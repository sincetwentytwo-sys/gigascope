"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Entry = {
  kind: "company" | "ticker" | "sector" | "site" | "product" | "page";
  title: string;
  subtitle?: string;
  href: string;
  /** lowercase search index */
  blob: string;
};

function score(entry: Entry, q: string): number {
  const ql = q.toLowerCase();
  if (!ql) return 0;
  let s = 0;
  if (entry.title.toLowerCase().startsWith(ql)) s += 100;
  if (entry.title.toLowerCase().includes(ql)) s += 50;
  if (entry.blob.startsWith(ql)) s += 30;
  if (entry.blob.includes(ql)) s += 10;
  // boost short titles
  s -= entry.title.length * 0.05;
  return s;
}

const KIND_LABEL: Record<Entry["kind"], string> = {
  company: "Company",
  ticker: "Ticker",
  sector: "Sector",
  site: "Site",
  product: "Product",
  page: "Page",
};

const KIND_COLOR: Record<Entry["kind"], string> = {
  company: "#0066cc",
  ticker: "#00875a",
  sector: "#7b2dbd",
  site: "#bf5600",
  product: "#0077b6",
  page: "#86868b",
};

export default function GlobalSearch({ entries }: { entries: Entry[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
      // "/" to open when not typing in another field
      if (e.key === "/" && !open) {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || (t as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) {
      return entries.slice(0, 8);
    }
    return entries
      .map((e) => ({ e, s: score(e, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 30)
      .map((x) => x.e);
  }, [entries, q]);

  if (!open) return null;

  const go = (e: Entry) => {
    setOpen(false);
    window.location.href = e.href;
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-bg border border-border-custom rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          aria-label="Search GIGASCOPE"
          value={q}
          onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
            if (e.key === "Enter" && results[idx]) { e.preventDefault(); go(results[idx]); }
          }}
          placeholder="Search companies, tickers, sites, products…"
          className="w-full px-4 py-3 text-base bg-bg border-b border-border-custom focus:outline-none"
        />
        <ul className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-6 text-sm text-dim text-center">No results.</li>
          )}
          {results.map((r, i) => (
            <li
              key={r.href}
              onMouseEnter={() => setIdx(i)}
              onClick={() => go(r)}
              className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 ${i === idx ? "bg-surface" : ""}`}
            >
              <span
                className="text-[10px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded"
                style={{ background: `${KIND_COLOR[r.kind]}22`, color: KIND_COLOR[r.kind] }}
              >
                {KIND_LABEL[r.kind]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.title}</div>
                {r.subtitle && <div className="text-[11px] text-dim truncate">{r.subtitle}</div>}
              </div>
              <span className="text-[10px] text-dim font-mono truncate max-w-[180px]">{r.href}</span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 text-[11px] text-dim border-t border-border-custom flex items-center gap-3">
          <span><kbd className="px-1 border border-border-custom rounded">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 border border-border-custom rounded">↵</kbd> open</span>
          <span><kbd className="px-1 border border-border-custom rounded">esc</kbd> close</span>
          <span className="ml-auto"><kbd className="px-1 border border-border-custom rounded">⌘K</kbd></span>
        </div>
      </div>
    </div>
  );
}
