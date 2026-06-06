// Inline mock of what a GIGASCOPE daily digest email looks like once
// rendered in a recipient's inbox. We use real recent milestone data so
// the preview reflects what subscribers would actually receive today —
// not a lorem-ipsum mock that goes stale.
//
// Visual style mirrors the React Email template (welcome.tsx + drip-*.tsx)
// but is lightly translated to work inside a normal flex page (different
// typography scale, no email-client-safe markup quirks).

import { getRecentMilestones } from "@/lib/pulse";

export default function DailyDigestPreview() {
  const items = getRecentMilestones(5);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-md overflow-hidden border border-border-custom bg-bg shadow-sm">
      {/* Mock email client chrome */}
      <div className="bg-surface border-b border-border-custom px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="text-[11px] font-mono text-dim flex-1 truncate">
          GIGASCOPE Daily Digest · {today}
        </div>
      </div>

      {/* Email header */}
      <div className="px-5 py-3 border-b border-border-custom flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-text flex items-center justify-center text-bg font-bold text-xs">
          G
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold leading-tight truncate">GIGASCOPE</div>
          <div className="text-[11px] text-dim leading-tight">digest@gigascope.xyz</div>
        </div>
        <div className="text-[10px] text-dim font-mono shrink-0">07:00</div>
      </div>

      {/* Email body */}
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-2">
          Daily digest
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight mb-3">
          {items.length > 0
            ? `${items.length} verified milestones across the empire yesterday.`
            : "Empire scoreboard — refreshed."}
        </h3>
        <p className="text-sm text-dim leading-relaxed mb-6">
          Here is what moved in the last 30 days, ranked by recency. Each line links to the
          primary source we verified it from.
        </p>

        {/* Milestone list */}
        <ol className="flex flex-col mb-6">
          {items.map((m, i) => (
            <li
              key={i}
              className="grid grid-cols-[64px_1fr] gap-3 py-2.5 border-b border-border-custom last:border-0"
            >
              <div className="font-mono text-[10px] text-dim pt-0.5">{m.date}</div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-dim mb-0.5">
                  {m.site}
                </div>
                <p className="text-sm leading-snug">{m.text}</p>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-sm text-dim py-2">
              No verified milestones in the window. Tracker resumes when filings publish.
            </li>
          )}
        </ol>

        <div className="bg-surface rounded p-4 border border-border-custom">
          <div className="text-[10px] uppercase tracking-widest font-mono text-dim mb-1.5">
            On the runway · next 30 days
          </div>
          <p className="text-sm leading-snug">
            FAA static-fire window for Starbase Booster 14. Travis County permit filings on the
            Giga Texas south expansion. Q2 earnings windows for TSLA.
          </p>
        </div>

        <p className="text-[11px] text-dim mt-6 leading-relaxed">
          Sent every morning, around 7 AM ET. Unsubscribe with one click in any email.
        </p>
      </div>
    </div>
  );
}
