import { ImageResponse } from "next/og";
export const alt = "GIGASCOPE — Tesla Factory Construction Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0d12",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#f0f2f8",
            letterSpacing: "-0.03em",
          }}
        >
          GIGASCOPE
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6b7280",
            marginTop: 16,
          }}
        >
          Tesla Factory Construction Tracker
        </div>
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 40,
          }}
        >
          {[
            { value: "8", label: "Factories" },
            { value: "$56B+", label: "Invested" },
            { value: "4", label: "Countries" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 700, color: "#f0f2f8" }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          Satellite imagery + milestones — gigascope-ten.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
