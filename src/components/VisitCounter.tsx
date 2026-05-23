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

  // Intentional threshold gate: small visitor counts on a paid-product page read
  // as "hobby blog" and actively destroy credibility. Only show the counter once
  // the numbers function as social proof rather than embarrassment. Tune as the
  // site grows.
  const HIDE_BELOW_TODAY = 100;
  const HIDE_BELOW_TOTAL = 1000;

  if (!data || !data.enabled || data.today === 0) return null;
  if (data.today < HIDE_BELOW_TODAY || data.total < HIDE_BELOW_TOTAL) return null;

  return (
    <span className="font-mono tabular-nums" title={`Total visits: ${data.total.toLocaleString()}`}>
      {data.today.toLocaleString()} visitors today
      {data.total > 0 && <> &middot; {data.total.toLocaleString()} total</>}
    </span>
  );
}
