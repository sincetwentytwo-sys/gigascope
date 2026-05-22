"use client";

import { useMemo, useState } from "react";
import { TIMELINE_YEARS } from "@/data/factories";
import { COMPANIES, getCompanyMeta } from "@/data/companies";
import type { Company, Factory } from "@/data/types";

const COMPANY_ORDER: Company[] = ["joint", "tesla", "spacex", "xai", "neuralink", "boring"];

type MilestoneItem = {
  factory: Factory;
  date: string;
  text: string;
  done: boolean;
};

export default function TimelineContent({
  factories,
  milestones,
}: {
  factories: Factory[];
  milestones: MilestoneItem[];
}) {
  const [active, setActive] = useState<Company | "all">("all");

  const visibleFactories = useMemo(
    () => (active === "all" ? factories : factories.filter((f) => f.company === active)),
    [active, factories]
  );

  const visibleMilestones = useMemo(
    () => (active === "all" ? milestones : milestones.filter((m) => m.factory.company === active)),
    [active, milestones]
  );

  const overviewFactories = useMemo(() => {
    if (active !== "all") return visibleFactories;
    const featured = factories.find((f) => f.featured);
    const others = factories
      .filter((f) => !f.featured)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 7);
    return featured ? [featured, ...others] : others;
  }, [active, factories, visibleFactories]);

  const activeMeta = active === "all" ? null : getCompanyMeta(active);

  return (
    <>
      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setActive("all")}
          className="px-3 py-1.5 text-xs rounded-full transition-colors border"
          style={
            active === "all"
              ? { background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }
              : { borderColor: "var(--border)", color: "var(--dim)" }
          }
        >
          All ({factories.length})
        </button>
        {COMPANY_ORDER.map((id) => {
          const meta = COMPANIES.find((c) => c.id === id);
          if (!meta) return null;
          const count = factories.filter((f) => f.company === id).length;
          if (count === 0) return null;
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="px-3 py-1.5 text-xs rounded-full transition-colors border"
              style={
                isActive
                  ? { background: meta.color, color: "#fff", borderColor: meta.color }
                  : { borderColor: "var(--border)", color: "var(--dim)" }
              }
            >
              {meta.icon} {meta.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Progress overview */}
      <div className="glass-card p-6 mb-12">
        <h3 className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase mb-4">
          {activeMeta ? `${activeMeta.name.toUpperCase()} PROGRESS BY YEAR` : "CONSTRUCTION PROGRESS BY YEAR"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewFactories.map((f) => (
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
            <span className="font-mono text-[10px] text-accent-cyan tracking-widest">NOW — MAY 2026</span>
          </div>
        </div>

        {/* Milestone items */}
        {visibleMilestones.map((m, i) => {
          const isPast = m.done;
          const isFuture = !m.done;

          return (
            <div key={`${m.factory.id}-${i}`} className="relative flex items-start gap-4 mb-4 group">
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

              <div className={`flex-1 glass-card p-4 transition-all group-hover:border-text/15 ${isFuture ? "opacity-50" : ""}`}>
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

        {visibleMilestones.length === 0 && (
          <div className="text-center text-dim text-sm py-12">
            No milestones for this filter.
          </div>
        )}
      </div>
    </>
  );
}
