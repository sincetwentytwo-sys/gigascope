import { ImageResponse } from "next/og";
import { getFactory } from "@/data/factories";

export const alt = "Factory — GIGASCOPE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
            background: "#ffffff",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#86868b",
            fontSize: 32,
          }}
        >
          Factory not found — GIGASCOPE
        </div>
      ),
      { ...size }
    );
  }

  const infoCards = [
    { label: "Area", value: factory.area },
    { label: "Capacity", value: factory.capacity },
    { label: "Investment", value: factory.investment },
    { label: "Employees", value: factory.employees },
  ];

  const completedMs = factory.milestones.filter((m) => m.done).length;
  const totalMs = factory.milestones.length;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "48px 64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            GIGASCOPE
          </div>
          <div style={{
            fontSize: 12,
            color: "#86868b",
            padding: "4px 12px",
            border: "1px solid #e5e5e7",
            borderRadius: 20,
          }}>
            {factory.status}
          </div>
        </div>

        {/* Factory name + progress */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
              {factory.flag} {factory.name}
            </div>
            <div style={{ fontSize: 20, color: "#86868b", marginTop: 4 }}>
              {factory.aka} — {factory.location}
            </div>
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: "#1d1d1f" }}>
            {factory.progress}%
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: "100%", height: 12, background: "#f5f5f7", borderRadius: 6, marginTop: 24, display: "flex", overflow: "hidden" }}>
          <div style={{ width: `${factory.progress}%`, height: "100%", background: "#1d1d1f", borderRadius: 6 }} />
        </div>

        {/* Info cards */}
        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          {infoCards.map((c) => (
            <div key={c.label} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#f5f5f7",
              borderRadius: 12,
              padding: "16px 20px",
            }}>
              <div style={{ fontSize: 11, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {c.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginTop: 4 }}>
                {c.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 24 }}>
          <div style={{ fontSize: 14, color: "#86868b" }}>
            {factory.products}
          </div>
          <div style={{ fontSize: 14, color: "#86868b" }}>
            {completedMs}/{totalMs} milestones — gigascope.xyz
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
