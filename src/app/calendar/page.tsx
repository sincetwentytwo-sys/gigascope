import type { Metadata } from "next";
import { factories } from "@/data/factories";
import CalendarClient, { type CalendarEntry } from "./CalendarClient";

export const metadata: Metadata = {
  title: "Calendar — Milestones — GIGASCOPE",
  description:
    "Upcoming construction milestones, launches, regulatory decisions, and ramp targets across Tesla, SpaceX, xAI, Neuralink, and The Boring Company — chronologically. Filter by company or time window. Recent past included for context.",
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

// Revalidate at most every 6 hours — milestone dates change rarely and the
// "T-N days" math is refined client-side anyway.
export const revalidate = 21600;

export default function CalendarPage() {
  const now = Date.now();
  // Window: include milestones from the last 30 days through forever in the
  // future. Past-30-day cutoff gives recent context (just-completed milestones
  // appear so subscribers can verify what changed) without unbounded scrollback.
  const PAST_WINDOW_MS = 30 * 86400_000;

  const entries: CalendarEntry[] = [];

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
        sourceUrl: m.sourceUrl,
      });
    }
  }

  entries.sort((a, b) => a.sortKey - b.sortKey);

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

      <CalendarClient entries={entries} nowMs={now} />

      {/* Catalyst-alert CTA — the calendar shows WHAT is coming; /pro turns
          those into email/Telegram pings on T-7 and T-1. Aligns with the
          paid value prop (catalyst alerts). */}
      <aside className="mt-10 border border-border-custom rounded p-5 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold mb-1">Get pinged before each milestone</div>
            <div className="text-xs text-dim">
              T-7 and T-1 email + Telegram alerts for upcoming launches, completions, and ramp targets.
            </div>
          </div>
          <a
            href="/pro"
            className="text-xs px-3 py-2 rounded border border-text bg-text text-bg font-semibold hover:opacity-90 whitespace-nowrap text-center"
          >
            Subscribe to alerts →
          </a>
        </div>
      </aside>
    </div>
  );
}
