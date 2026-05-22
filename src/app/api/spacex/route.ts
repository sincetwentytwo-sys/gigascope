import { NextResponse } from "next/server";

export const revalidate = 300;

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

// Celestrak returns ~5.8MB of TLE data — too big for Next.js fetch cache (>2MB
// limit throws), so we cache the resolved count in module memory instead.
let starlinkCache: { count: number; ts: number } | null = null;
const STARLINK_TTL_MS = 3_600_000;

async function fetchStarlinkCount(): Promise<number | null> {
  if (starlinkCache && Date.now() - starlinkCache.ts < STARLINK_TTL_MS) {
    return starlinkCache.count;
  }
  try {
    const res = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=json",
      { cache: "no-store" }
    );
    if (!res.ok) return starlinkCache?.count ?? null;
    const json = (await res.json()) as unknown[];
    if (!Array.isArray(json)) return starlinkCache?.count ?? null;
    starlinkCache = { count: json.length, ts: Date.now() };
    return json.length;
  } catch {
    return starlinkCache?.count ?? null;
  }
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
