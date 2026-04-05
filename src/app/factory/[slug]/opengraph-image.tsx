import { ImageResponse } from "next/og";
import { getFactory, factories } from "@/data/factories";

export const runtime = "edge";
export const alt = "Factory — GIGASCOPE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return factories.map((f) => ({ slug: f.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const factory = getFactory(slug);

  if (!factory) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#0c0d12",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: 32,
          }}
        >
          Factory not found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0d12",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          GIGASCOPE
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#f0f2f8", marginTop: 12 }}>
          {factory.flag} {factory.name}
        </div>
        <div style={{ fontSize: 22, color: "#6b7280", marginTop: 8 }}>
          {factory.aka} — {factory.location}
        </div>

        <div style={{ display: "flex", gap: 48, marginTop: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: factory.color }}>
              {factory.progress}%
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Progress
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#f0f2f8" }}>
              {factory.investment}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Investment
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#f0f2f8" }}>
              {factory.capacity}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Capacity
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 40, width: "100%", height: 8, background: "#252a38", display: "flex" }}>
          <div
            style={{
              width: `${factory.progress}%`,
              height: "100%",
              background: factory.color,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
