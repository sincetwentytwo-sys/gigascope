import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const revalidate = 300;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

type SpaceXData = {
  latestLaunch: string;
  launchDate: string;
  starlinkCount: number;
  launchesThisYear: number;
  totalLaunches: number;
};

const SPACEX_LSP_ID = 121;
const LL_BASE = "https://ll.thespacedevs.com/2.2.0/launch";

type LLResponse = {
  count: number;
  results: Array<{
    name: string;
    net: string;
    status: { id: number; name: string };
  }>;
};

async function fetchLL(qs: string, revalSeconds: number): Promise<LLResponse | null> {
  try {
    const res = await fetch(`${LL_BASE}/?${qs}`, {
      next: { revalidate: revalSeconds },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as LLResponse;
  } catch {
    return null;
  }
}

async function fetchLatestLaunch(): Promise<{ name: string; date: string } | null> {
  const data = await fetchLL(`lsp__id=${SPACEX_LSP_ID}&status=3&ordering=-net&limit=1&mode=list`, 300);
  const r = data?.results?.[0];
  if (!r) return null;
  return {
    name: r.name,
    date: new Date(r.net).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };
}

async function fetchTotalLaunches(): Promise<number | null> {
  const data = await fetchLL(`lsp__id=${SPACEX_LSP_ID}&status=3&limit=1&mode=list`, 3600);
  return data?.count ?? null;
}

async function fetchLaunchesThisYear(): Promise<number | null> {
  const year = new Date().getFullYear();
  const qs = `lsp__id=${SPACEX_LSP_ID}&status=3&net__gte=${year}-01-01T00:00:00Z&net__lte=${year}-12-31T23:59:59Z&limit=1&mode=list`;
  const data = await fetchLL(qs, 1800);
  return data?.count ?? null;
}

// Starlink count is written to Upstash by /api/spacex/refresh-starlink (cron).
// The hot path never calls Celestrak — it would 403 due to rate-limits on Lambda
// cold starts. Tiered reads: in-process memo → Upstash → null.
let starlinkMemoCache: { count: number; ts: number } | null = null;
const MEMO_TTL_MS = 300_000; // 5 min — in-process refresh window

async function fetchStarlinkCount(): Promise<number | null> {
  // Tier 1: in-process memo (5 min)
  if (starlinkMemoCache && Date.now() - starlinkMemoCache.ts < MEMO_TTL_MS) {
    return starlinkMemoCache.count;
  }
  // Tier 2: Upstash (written by /api/spacex/refresh-starlink cron)
  const r = getRedis();
  if (r) {
    try {
      const cached = await r.get<number | string>("starlink:count");
      if (cached !== null && cached !== undefined) {
        const n = typeof cached === "number" ? cached : Number(cached);
        if (Number.isFinite(n) && n > 0) {
          starlinkMemoCache = { count: n, ts: Date.now() };
          return n;
        }
      }
    } catch {
      // Upstash error — fall through to memo or null
    }
  }
  // Tier 3: stale memo if any, else null
  return starlinkMemoCache?.count ?? null;
}

export async function GET() {
  const [latest, starlink, thisYear, total] = await Promise.all([
    fetchLatestLaunch(),
    fetchStarlinkCount(),
    fetchLaunchesThisYear(),
    fetchTotalLaunches(),
  ]);

  const data: SpaceXData = {
    latestLaunch: latest?.name ?? "N/A",
    launchDate: latest?.date ?? "N/A",
    starlinkCount: starlink ?? 0,
    launchesThisYear: thisYear ?? 0,
    totalLaunches: total ?? 0,
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
