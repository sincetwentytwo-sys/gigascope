"use client";

import { useEffect, useState } from "react";

interface VisitData {
  today: number;
  total: number;
  enabled: boolean;
}

export default function VisitCounter() {
  const [data, setData] = useState<VisitData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/visits", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: VisitData) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        /* silently ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data || !data.enabled || data.today === 0) return null;

  return (
    <span className="font-mono tabular-nums" title={`Total visits: ${data.total.toLocaleString()}`}>
      {data.today.toLocaleString()} visitors today
      {data.total > 0 && <> &middot; {data.total.toLocaleString()} total</>}
    </span>
  );
}
