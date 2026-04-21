import { ImageResponse } from "next/og";
import { factories, getTotalInvestment } from "@/data/factories";

export const alt = "GIGASCOPE — Tesla Factory Construction Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const sorted = [...factories].sort((a, b) => b.progress - a.progress);

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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
              GIGASCOPE
            </div>
            <div style={{ fontSize: 18, color: "#86868b", marginTop: 4 }}>
              Tesla Factory Construction Tracker
            </div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { value: String(factories.length), label: "Factories" },
              { value: getTotalInvestment(), label: "Invested" },
              { value: "4", label: "Countries" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 1, background: "#e5e5e7", marginTop: 24, marginBottom: 20 }} />

        {/* Factory rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          {sorted.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 22, width: 36 }}>{f.flag}</div>
              <div style={{ width: 220, fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>
                {f.name}
              </div>
              {/* Progress bar container */}
              <div style={{ flex: 1, height: 20, background: "#f5f5f7", borderRadius: 4, display: "flex", overflow: "hidden" }}>
                <div style={{ width: `${f.progress}%`, height: "100%", background: "#1d1d1f", borderRadius: 4 }} />
              </div>
              <div style={{ width: 56, textAlign: "right", fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>
                {`${f.progress}%`}
              </div>
              <div style={{ width: 100, fontSize: 11, color: "#86868b", textAlign: "right" }}>
                {f.status}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <div style={{ fontSize: 13, color: "#86868b" }}>
            gigascope.xyz — Satellite imagery + milestones + community
          </div>
          <div style={{ fontSize: 13, color: "#86868b" }}>
            Open source · Not affiliated with Tesla
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
