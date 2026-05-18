import { NextResponse } from "next/server";

export const revalidate = 300;

type SpaceXData = {
  latestLaunch: string;
  launchDate: string;
  starlinkCount: number;
  launchesThisYear: number;
};

async function fetchLatestLaunch(): Promise<{ name: string; date: string } | null> {
  try {
    const res = await fetch("https://api.spacexdata.com/v5/launches/latest", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      name: json.name ?? "Unknown",
      date: json.date_utc ? new Date(json.date_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown",
    };
  } catch {
    return null;
  }
}

async function fetchStarlinkCount(): Promise<number | null> {
  try {
    const res = await fetch("https://api.spacexdata.com/v4/starlink/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: {}, options: { pagination: false, select: "id" } }),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.totalDocs ?? json.docs?.length ?? null;
  } catch {
    return null;
  }
}

async function fetchLaunchesThisYear(): Promise<number | null> {
  try {
    const year = new Date().getFullYear();
    const res = await fetch("https://api.spacexdata.com/v5/launches/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: {
          date_utc: {
            $gte: `${year}-01-01T00:00:00.000Z`,
            $lte: `${year}-12-31T23:59:59.999Z`,
          },
          upcoming: false,
        },
        options: { pagination: false, select: "id" },
      }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.totalDocs ?? json.docs?.length ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [latest, starlink, launches] = await Promise.all([
    fetchLatestLaunch(),
    fetchStarlinkCount(),
    fetchLaunchesThisYear(),
  ]);

  const data: SpaceXData = {
    latestLaunch: latest?.name ?? "N/A",
    launchDate: latest?.date ?? "N/A",
    starlinkCount: starlink ?? 0,
    launchesThisYear: launches ?? 0,
  };

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
