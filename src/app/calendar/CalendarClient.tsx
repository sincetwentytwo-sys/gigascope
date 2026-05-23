"use client";

import { useMemo, useState } from "react";
import type { Company } from "@/data/types";

export type CalendarEntry = {
  date: string;
  sortKey: number;
  siteSlug: string;
  siteName: string;
  company: Company;
  text: string;
  confidence?: string;
  past: boolean;
  sourceUrl?: string;
};

const COMPANY_LABEL: Record<Company, string> = {
  tesla: "Tesla",
  spacex: "SpaceX",
  xai: "xAI",
  neuralink: "Neuralink",
  boring: "Boring",
  joint: "Joint",
};

const COMPANY_TINT: Record<Company, { bg: string; fg: string }> = {
  tesla:     { bg: "rgba(204,0,0,0.10)",    fg: "#cc0000" },
  spacex:    { bg: "rgba(0,90,158,0.10)",   fg: "#005a9e" },
  xai:       { bg: "rgba(30,30,30,0.08)",   fg: "#1d1d1f" },
  neuralink: { bg: "rgba(123,45,189,0.10)", fg: "#7b2dbd" },
  boring:    { bg: "rgba(191,86,0,0.10)",   fg: "#bf5600" },
  joint:     { bg: "rgba(0,135,90,0.10)",   fg: "#00875a" },
};

const COMPANY_OPTIONS: Array<Company | "all"> = ["all", "tesla", "spacex", "xai", "neuralink", "boring", "joint"];

type WindowKey = "past30" | "next30" | "next90" | "upcoming" | "all";

const WINDOWS: { key: WindowKey; label: string }[] = [
  { key: "past30",   label: "Past 30d" },
  { key: "next30",   label: "Next 30d" },
  { key: "next90",   label: "Next 90d" },
  { key: "upcoming", label: "All upcoming" },
  { key: "all",      label: "Past 30d + upcoming" },
];

/** Format a T-minus/T-plus offset relative to "now". Server-side rendered with
 * the build-time "now" so this is approximate — the client effect refines it. */
function tBadge(days: number, past: boolean): { label: string; color: string } {
  if (past) {
    return { label: `T+${Math.abs(days)}d`, color: "#888" };
  }
  if (days === 0) return { label: "T-0", color: "#cc0000" };
  if (days <= 7)  return { label: `T-${days}d`, color: "#cc0000" };
  if (days <= 30) return { label: `T-${days}d`, color: "#bf5600" };
  if (days <= 90) return { label: `T-${days}d`, color: "#0066cc" };
  return { label: `T-${days}d`, color: "#666" };
}

export default function CalendarClient({
  entries,
  nowMs,
}: {
  entries: CalendarEntry[];
  nowMs: number;
}) {
  const [windowKey, setWindowKey] = useState<WindowKey>("all");
  const [company, setCompany] = useState<Company | "all">("all");

  const filtered = useMemo(() => {
    const day = 86_400_000;
    return entries.filter((e) => {
      // Company filter
      if (company !== "all" && e.company !== company) return false;

      // Time-window filter
      const delta = e.sortKey - nowMs;
      switch (windowKey) {
        case "past30":   return delta < 0 && delta >= -30 * day;
        case "next30":   return delta >= 0 && delta <= 30 * day;
        case "next90":   return delta >= 0 && delta <= 90 * day;
        case "upcoming": return delta >= 0;
        case "all":      return true; // already constrained to past-30d..forever by server
      }
    });
  }, [entries, windowKey, company, nowMs]);

  // Group by month label for chronological reading
  const groups = useMemo(() => {
    const m = new Map<string, CalendarEntry[]>();
    for (const e of filtered) {
      const d = new Date(e.sortKey);
      const key = isNaN(d.getTime())
        ? e.date
        : d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return Array.from(m.entries());
  }, [filtered]);

  // Stats strip (always counted off the unfiltered entries set so the strip
  // shows the truthful overview regardless of the current filter)
  const stats = useMemo(() => {
    const day = 86_400_000;
    const upcoming = entries.filter((e) => e.sortKey >= nowMs);
    const next30 = upcoming.filter((e) => e.sortKey - nowMs <= 30 * day);
    const next90 = upcoming.filter((e) => e.sortKey - nowMs <= 90 * day);
    return {
      upcomingTotal: upcoming.length,
      next30: next30.length,
      next90: next90.length,
      past30: entries.length - upcoming.length,
    };
  }, [entries, nowMs]);

  return (
    <>
      {/* Stats strip — gives the page weight even when filters return little */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Upcoming (all)" value={stats.upcomingTotal} />
        <Stat label="Next 30 days"  value={stats.next30} />
        <Stat label="Next 90 days"  value={stats.next90} />
        <Stat label="Past 30 days"  value={stats.past30} />
      </div>

      {/* Filter row */}
      <div className="flex flex-col gap-3 mb-6 pb-4 border-b border-border-custom">
        <div className="flex flex-wrap gap-1.5">
          {WINDOWS.map((w) => (
            <button
              key={w.key}
              onClick={() => setWindowKey(w.key)}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                windowKey === w.key
                  ? "bg-text text-bg border-text font-semibold"
                  : "bg-surface border-border-custom hover:border-text"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-dim">Company</span>
          {COMPANY_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => setCompany(c)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                company === c
                  ? "bg-text text-bg border-text font-semibold"
                  : "bg-surface border-border-custom hover:border-text"
              }`}
            >
              {c === "all" ? "All" : COMPANY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border-custom rounded p-6 text-center">
          <div className="text-sm mb-2">No milestones match this filter.</div>
          <div className="text-dim text-xs mb-3">
            Try widening the time window or selecting a different company.
          </div>
          <a
            href="/timeline"
            className="inline-block text-xs px-3 py-1.5 rounded border border-border-custom bg-surface hover:border-text"
          >
            See full timeline →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(([month, items]) => (
            <section key={month}>
              <h2 className="text-xs uppercase tracking-wider text-dim mb-3 sticky top-12 bg-bg/90 backdrop-blur py-1">
                {month} <span className="text-dim/70">({items.length})</span>
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((e, i) => {
                  const tint = COMPANY_TINT[e.company];
                  const days = Math.round((e.sortKey - nowMs) / 86_400_000);
                  const t = tBadge(days, e.past);
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded border border-border-custom"
                      style={e.past ? { opacity: 0.7 } : undefined}
                    >
                      <div className="w-20 flex-shrink-0">
                        <div className="text-xs font-mono">{e.date}</div>
                        <div
                          className="text-[10px] uppercase tracking-wider font-semibold mt-0.5"
                          style={{ color: t.color }}
                        >
                          {t.label}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-semibold">{e.siteName}</span>
                          <span className="text-dim"> — {e.text}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span
                            className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: tint.bg, color: tint.fg }}
                          >
                            {COMPANY_LABEL[e.company]}
                          </span>
                          <a
                            href={`/site/${e.siteSlug}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-custom hover:border-text"
                          >
                            site
                          </a>
                          {e.sourceUrl && (
                            <a
                              href={e.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-custom hover:border-text"
                            >
                              source ↗
                            </a>
                          )}
                          {e.confidence && (
                            <span
                              className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded"
                              style={{
                                background:
                                  e.confidence === "high"        ? "rgba(0,135,90,0.15)" :
                                  e.confidence === "medium"      ? "rgba(0,102,204,0.15)" :
                                  e.confidence === "low"         ? "rgba(191,86,0,0.15)" :
                                                                   "rgba(123,45,189,0.15)",
                                color:
                                  e.confidence === "high"        ? "#00875a" :
                                  e.confidence === "medium"      ? "#0066cc" :
                                  e.confidence === "low"         ? "#bf5600" :
                                                                   "#7b2dbd",
                              }}
                            >
                              {e.confidence}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border-custom rounded p-3 bg-surface">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-dim mt-0.5">{label}</div>
    </div>
  );
}
