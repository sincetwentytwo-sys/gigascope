import type { Metadata } from "next";
import { TICKERS } from "@/data/tickers";
import { factories } from "@/data/factories";

export const metadata: Metadata = {
  title: "Calendar — Catalysts & milestones — GIGASCOPE",
  description:
    "Earnings calls, fab ramps, launches, regulatory decisions, and construction milestones tracked across Tesla, SpaceX, xAI, Neuralink, and Boring — chronologically.",
  alternates: { canonical: "https://gigascope.xyz/calendar" },
  openGraph: {
    title: "Calendar — Catalysts & milestones — GIGASCOPE",
    description:
      "Earnings calls, fab ramps, launches, regulatory decisions, and construction milestones tracked across Tesla, SpaceX, xAI, Neuralink, and Boring — chronologically.",
    url: "https://gigascope.xyz/calendar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calendar — Catalysts & milestones — GIGASCOPE",
    description:
      "Earnings calls, fab ramps, launches, regulatory decisions, and construction milestones tracked across Tesla, SpaceX, xAI, Neuralink, and Boring — chronologically.",
  },
};

type Entry = {
  date: string;
  sortKey: number;
  kind: "catalyst" | "milestone";
  symbol?: string;
  siteSlug?: string;
  label: string;
  confidence?: string;
  blurb?: string;
};

function dateSort(s: string): number {
  // accept "2026-05-22", "2026-Q3", "2026-2H", "2026", "2027"
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

export default function CalendarPage() {
  const now = Date.now();
  const entries: Entry[] = [];

  for (const t of TICKERS) {
    for (const c of t.catalysts ?? []) {
      const k = dateSort(c.date);
      if (k < now - 30 * 86400_000) continue;
      entries.push({
        date: c.date,
        sortKey: k,
        kind: "catalyst",
        symbol: t.symbol,
        label: c.label,
        confidence: c.confidence,
        blurb: c.blurb,
      });
    }
  }

  for (const f of factories) {
    for (const m of f.milestones ?? []) {
      if (m.done) continue;
      const k = dateSort(m.date);
      if (k < now - 30 * 86400_000) continue;
      entries.push({
        date: m.date,
        sortKey: k,
        kind: "milestone",
        siteSlug: f.slug,
        label: `${f.name}: ${m.text}`,
        confidence: m.confidence,
      });
    }
  }

  entries.sort((a, b) => a.sortKey - b.sortKey);

  // group by month label
  const groups: Map<string, Entry[]> = new Map();
  for (const e of entries) {
    const d = new Date(e.sortKey);
    const key = isNaN(d.getTime()) ? e.date : d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">Calendar</h1>
        <p className="text-dim">
          All upcoming catalysts and milestones across the GIGASCOPE universe — fab ramps, launches, regulatory decisions,
          construction milestones. Confidence-tagged. Dates approximate where stated.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="text-dim text-sm">No upcoming entries.</div>
      ) : (
        <div className="flex flex-col gap-8">
          {Array.from(groups.entries()).map(([month, items]) => (
            <section key={month}>
              <h2 className="text-xs uppercase tracking-wider text-dim mb-3 sticky top-12 bg-bg/90 backdrop-blur py-1">{month}</h2>
              <ul className="flex flex-col gap-2">
                {items.map((e, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded border border-border-custom">
                    <div className="w-20 flex-shrink-0">
                      <div className="text-xs font-mono">{e.date}</div>
                      <div className="text-[10px] uppercase text-dim">{e.kind}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">{e.label}</div>
                      {e.blurb && <div className="text-xs text-dim mt-0.5">{e.blurb}</div>}
                      <div className="flex items-center gap-2 mt-1">
                        {e.symbol && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-custom">
                            {e.symbol}
                          </span>
                        )}
                        {e.siteSlug && (
                          <a href={`/site/${e.siteSlug}`} className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border-custom hover:border-text">
                            site
                          </a>
                        )}
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
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
