import type { Metadata } from "next";
import { factories } from "@/data/factories";
import type { Company } from "@/data/types";

export const metadata: Metadata = {
  title: "Calendar — Milestones — GIGASCOPE",
  description:
    "Upcoming construction milestones, launches, regulatory decisions, and ramp targets across Tesla, SpaceX, xAI, Neuralink, and The Boring Company — chronologically. Recent past included for context.",
  alternates: { canonical: "https://gigascope.xyz/calendar" },
  openGraph: {
    title: "Calendar — Milestones — GIGASCOPE",
    description:
      "Upcoming construction milestones, launches, regulatory decisions, and ramp targets across Tesla, SpaceX, xAI, Neuralink, and The Boring Company — chronologically.",
    url: "https://gigascope.xyz/calendar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendar — Milestones — GIGASCOPE",
    description:
      "Upcoming construction milestones across Tesla, SpaceX, xAI, Neuralink, and The Boring Company.",
  },
};

type Entry = {
  date: string;
  sortKey: number;
  siteSlug: string;
  siteName: string;
  company: Company;
  text: string;
  confidence?: string;
  past: boolean;
};

// Accept ISO ("2026-05-22"), quarterly ("2026-Q3"), half-year ("2026-2H"),
// month ("2026-05"), or year ("2026"). For lower-precision dates we pick a
// representative day inside the window so chronological sort is stable.
function dateSort(s: string): number {
  const m = s.match(/^(\d{4})(?:-(?:Q([1-4])|([1-2])H|(\d{1,2})(?:-(\d{1,2}))?))?/);
  if (!m) return 0;
  const year = parseInt(m[1], 10);
  let month = 1;
  if (m[2]) month = (parseInt(m[2], 10) - 1) * 3 + 2;
  else if (m[3]) month = parseInt(m[3], 10) === 1 ? 3 : 9;
  else if (m[4]) month = parseInt(m[4], 10);
  const day = m[5] ? parseInt(m[5], 10) : 15;
  return Date.UTC(year, month - 1, day);
}

const COMPANY_LABEL: Record<Company, string> = {
  tesla: "Tesla",
  spacex: "SpaceX",
  xai: "xAI",
  neuralink: "Neuralink",
  boring: "Boring",
  joint: "Joint",
};

const COMPANY_TINT: Record<Company, { bg: string; fg: string }> = {
  tesla:     { bg: "rgba(204,0,0,0.10)",   fg: "#cc0000" },
  spacex:    { bg: "rgba(0,90,158,0.10)",  fg: "#005a9e" },
  xai:       { bg: "rgba(30,30,30,0.08)",  fg: "#1d1d1f" },
  neuralink: { bg: "rgba(123,45,189,0.10)", fg: "#7b2dbd" },
  boring:    { bg: "rgba(191,86,0,0.10)",  fg: "#bf5600" },
  joint:     { bg: "rgba(0,135,90,0.10)",  fg: "#00875a" },
};

export default function CalendarPage() {
  const now = Date.now();
  // Window: include milestones from the last 30 days through forever in the
  // future. Past-30-day cutoff gives recent context (just-completed milestones
  // appear so subscribers can verify what changed) without unbounded scrollback.
  const PAST_WINDOW_MS = 30 * 86400_000;

  const entries: Entry[] = [];

  for (const f of factories) {
    for (const m of f.milestones ?? []) {
      const k = dateSort(m.date);
      if (k <= 0) continue;
      if (k < now - PAST_WINDOW_MS) continue;
      entries.push({
        date: m.date,
        sortKey: k,
        siteSlug: f.slug,
        siteName: f.name,
        company: f.company,
        text: m.text,
        confidence: m.confidence,
        past: k < now,
      });
    }
  }

  entries.sort((a, b) => a.sortKey - b.sortKey);

  // Group by month label so the timeline reads top-down chronologically.
  const groups: Map<string, Entry[]> = new Map();
  for (const e of entries) {
    const d = new Date(e.sortKey);
    const key = isNaN(d.getTime())
      ? e.date
      : d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Calendar</h1>
        <p className="text-dim">
          Upcoming and recently-passed milestones across the 16 GIGASCOPE sites — construction completions, launches,
          regulatory decisions, ramp targets. Confidence-tagged. Dates approximate where stated. Past 30 days included
          for context.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="text-dim text-sm">No milestones in the current window.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(groups.entries()).map(([month, items]) => (
            <section key={month}>
              <h2 className="text-xs uppercase tracking-wider text-dim mb-3 sticky top-12 bg-bg/90 backdrop-blur py-1">{month}</h2>
              <ul className="flex flex-col gap-2">
                {items.map((e, i) => {
                  const tint = COMPANY_TINT[e.company];
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded border border-border-custom"
                      style={e.past ? { opacity: 0.65 } : undefined}
                    >
                      <div className="w-20 flex-shrink-0">
                        <div className="text-xs font-mono">{e.date}</div>
                        <div className="text-[10px] uppercase text-dim">
                          {e.past ? "passed" : "milestone"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold">{e.siteName}</span>
                          <span className="text-dim"> — {e.text}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
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
                          {e.confidence && (
                            <span
                              className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded"
                              style={{
                                background:
                                  e.confidence === "high" ? "rgba(0,135,90,0.15)" :
                                  e.confidence === "medium" ? "rgba(0,102,204,0.15)" :
                                  e.confidence === "low" ? "rgba(191,86,0,0.15)" :
                                  "rgba(123,45,189,0.15)",
                                color:
                                  e.confidence === "high" ? "#00875a" :
                                  e.confidence === "medium" ? "#0066cc" :
                                  e.confidence === "low" ? "#bf5600" :
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
    </div>
  );
}
