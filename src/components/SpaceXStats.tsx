"use client";

import { useEffect, useState } from "react";

type SpaceXData = {
  latestLaunch: string;
  launchDate: string;
  starlinkCount: number;
  launchesThisYear: number;
  totalLaunches: number;
};

export default function SpaceXStats() {
  const [data, setData] = useState<SpaceXData | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/spacex", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as SpaceXData;
        if (!cancelled) {
          setData(json);
          setFetchedAt(new Date());
        }
      } catch {
        // ignore
      }
    };

    load();
    const id = setInterval(load, 300_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-dim">
        <span className="font-bold">SpaceX</span>
        <span className="opacity-60">—</span>
      </div>
    );
  }

  const year = new Date().getFullYear();

  return (
    <div className="inline-flex items-center gap-3 text-sm flex-wrap justify-center">
      <span className="font-bold" style={{ color: "#005288" }}>SpaceX</span>
      {data.starlinkCount > 0 && (
        <span>
          <span className="text-dim">Starlink:</span>{" "}
          <span className="font-semibold">{data.starlinkCount.toLocaleString()}</span>
        </span>
      )}
      {data.totalLaunches > 0 && (
        <span>
          <span className="text-dim">Launches:</span>{" "}
          <span className="font-semibold">{data.totalLaunches}</span>
          {data.launchesThisYear > 0 && (
            <span className="text-dim"> ({data.launchesThisYear} in {year})</span>
          )}
        </span>
      )}
      {data.latestLaunch !== "N/A" && (
        <span className="text-dim text-xs">
          Last: {data.latestLaunch} ({data.launchDate})
        </span>
      )}
      {/* Cadence label — the underlying SpaceX feed is an Upstash-cached daily
          cron, not a live socket, so don't dress it up with a green pulse +
          "live". Show the actual fetch timestamp when we have one. */}
      <span
        className="text-[11px] text-dim"
        title="SpaceX feed is Upstash-cached and refreshes every 5 minutes from a daily cron — no live socket."
      >
        {fetchedAt
          ? `updated ${fetchedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })} UTC`
          : "auto-refresh every 5 min"}
      </span>
    </div>
  );
}
