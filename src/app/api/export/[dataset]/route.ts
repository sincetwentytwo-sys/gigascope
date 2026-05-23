import { NextResponse } from "next/server";
import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";

export const revalidate = 3600;

type Dataset = "factories" | "milestones" | "products";

const DATASETS: Dataset[] = ["factories", "milestones", "products"];

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (v: unknown): string => {
    if (v == null) return "";
    if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  return `${header}\n${body}\n`;
}

function buildPayload(name: Dataset): Array<Record<string, unknown>> {
  switch (name) {
    case "factories":
      return factories.map((f) => ({
        id: f.id,
        slug: f.slug,
        name: f.name,
        aka: f.aka,
        company: f.company,
        location: f.location,
        flag: f.flag,
        lat: f.lat,
        lng: f.lng,
        status: f.status,
        progress: f.progress,
        area: f.area,
        capacity: f.capacity,
        investment: f.investment,
        employees: f.employees,
        lastUpdated: f.lastUpdated,
      }));
    case "milestones":
      return factories.flatMap((f) =>
        (f.milestones ?? []).map((m) => ({
          siteSlug: f.slug,
          siteName: f.name,
          company: f.company,
          date: m.date,
          text: m.text,
          done: m.done,
          confidence: m.confidence,
          lastVerified: m.lastVerified,
        })),
      );
    case "products":
      return listProducts().map((p) => ({
        slug: p.slug,
        name: p.name,
        aka: p.aka,
        category: p.category,
        partCount: p.parts.length,
      }));
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ dataset: string }> }) {
  const { dataset } = await ctx.params;
  const name = dataset.toLowerCase() as Dataset;
  if (!DATASETS.includes(name)) {
    return NextResponse.json({ error: "unknown_dataset", available: DATASETS }, { status: 404 });
  }
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "json").toLowerCase();
  const payload = buildPayload(name);

  if (format === "csv") {
    return new Response(toCsv(payload), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gigascope-${name}.csv"`,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return NextResponse.json(
    { dataset: name, count: payload.length, data: payload },
    {
      headers: {
        "Content-Disposition": `attachment; filename="gigascope-${name}.json"`,
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
