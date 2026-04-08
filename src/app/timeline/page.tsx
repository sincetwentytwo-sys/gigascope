import type { Metadata } from "next";
import { factories, TIMELINE_YEARS } from "@/data/factories";

export const metadata: Metadata = {
  title: "Timeline — GIGASCOPE",
  description: "Global construction timeline across all Tesla factories and Terafab",
};

// Merge all milestones from all factories, sorted by date
function getAllMilestones() {
  const all: { factory: (typeof factories)[number]; date: string; text: string; done: boolean }[] = [];
  for (const f of factories) {
    for (const m of f.milestones) {
      all.push({ factory: f, ...m });
    }
  }
  return all.sort((a, b) => {
    const da = a.date.replace(/Q\d|H\d/g, "").trim();
    const db = b.date.replace(/Q\d|H\d/g, "").trim();
    return db.localeCompare(da); // newest first
  });
}

export default function TimelinePage() {
  const milestones = getAllMilestones();
  const now = "2026-04";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Global Timeline</h1>
        <p className="text-dim text-sm">
          All milestones across {factories.length} factories — past and projected.
        </p>
      </div>

      {/* Progress overview */}
      <div className="glass-card p-6 mb-12">
        <h3 className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase mb-4">CONSTRUCTION PROGRESS BY YEAR</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {factories.slice(0, 4).map((f) => (
            <div key={f.id} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">{f.flag} {f.name}</span>
                <span className="font-mono text-xs" style={{ color: f.color }}>{f.progress}%</span>
              </div>
              <div className="flex gap-0.5 h-6">
                {f.timeline.map((val, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      background: f.color,
                      opacity: i === f.timeline.length - 1 ? 1 : 0.15 + i * 0.1,
                      height: `${Math.max(4, val)}%`,
                      alignSelf: "flex-end",
                    }}
                    title={`${TIMELINE_YEARS[i]}: ${val}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[7px] text-dim">{TIMELINE_YEARS[0]}</span>
                <span className="font-mono text-[7px] text-dim">{TIMELINE_YEARS[TIMELINE_YEARS.length - 1]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[18px] sm:left-[22px] top-0 bottom-0 w-px bg-border-custom" />

        {/* NOW indicator */}
        <div className="relative flex items-center gap-4 mb-8">
          <div className="w-9 sm:w-11 flex justify-center relative z-10">
            <div className="w-4 h-4 rounded-full bg-accent-cyan shadow-[0_0_12px_rgba(0,212,255,0.5)] animate-pulse" />
          </div>
          <div className="glass-card px-4 py-2 border-accent-cyan/30">
            <span className="font-mono text-[10px] text-accent-cyan tracking-widest">NOW — APRIL 2026</span>
          </div>
        </div>

        {/* Milestone items */}
        {milestones.map((m, i) => {
          const isPast = m.done;
          const isFuture = !m.done;

          return (
            <div key={`${m.factory.id}-${i}`} className="relative flex items-start gap-4 mb-4 group">
              {/* Dot */}
              <div className="w-9 sm:w-11 flex justify-center pt-1.5 relative z-10">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-transform group-hover:scale-150"
                  style={{
                    background: isPast ? m.factory.color : "transparent",
                    border: isFuture ? `2px solid var(--dim)` : "none",
                    boxShadow: isPast ? `0 0 8px ${m.factory.color}40` : "none",
                  }}
                />
              </div>

              {/* Content */}
              <div className={`flex-1 glass-card p-4 transition-all group-hover:border-white/15 ${isFuture ? "opacity-50" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px]" style={{ color: m.factory.color }}>
                      {m.factory.flag} {m.factory.name}
                    </span>
                    <span className={`badge badge-${m.factory.status}`} style={{ fontSize: "7px" }}>
                      {m.factory.status}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-dim">{m.date}</span>
                </div>
                <p className={`text-sm ${isPast ? "text-text" : "text-dim"}`}>{m.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
