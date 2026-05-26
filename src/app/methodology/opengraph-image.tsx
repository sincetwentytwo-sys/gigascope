// Dynamic OG image for /methodology. Surfaces the trust signal (real
// imagery sources + the four-tier confidence framework) as a 1200×630
// PNG so shared methodology links show the receipts in the social card.

import { ImageResponse } from "next/og";
import { getEmpireStats, formatCount } from "@/lib/pulse";

export const alt = "GIGASCOPE Methodology — where the numbers come from";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SOURCES = [
  "FAA filings",
  "SEC EDGAR",
  "Travis County permits",
  "NASA mission pages",
  "USGS · KOSIS · DART",
  "IR press releases",
];

const TIERS = [
  { label: "high", color: "#00875a", note: "Primary source + cross-check" },
  { label: "medium", color: "#0066cc", note: "Multiple secondary sources" },
  { label: "low", color: "#bf5600", note: "Inferred from satellite delta" },
  { label: "speculative", color: "#c4a000", note: "Company-stated future plan" },
];

export default function MethodologyOG() {
  const stats = getEmpireStats();

  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#86868b",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            GIGASCOPE · Methodology · How we count
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 900,
            color: "#1d1d1f",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            marginBottom: 18,
          }}
        >
          Where the numbers come from.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#86868b",
            lineHeight: 1.4,
            maxWidth: 1000,
            marginBottom: 32,
          }}
        >
          Two free satellite sources. Polygon traces drawn by hand. A confidence framework that says "speculative" out loud when something is speculative.
        </div>

        {/* Mini stats row */}
        <div
          style={{
            display: "flex",
            border: "1px solid #e5e5e7",
            borderRadius: 10,
            overflow: "hidden",
            background: "#e5e5e7",
            marginBottom: 22,
          }}
        >
          {[
            { label: "Sites", value: String(stats.sites) },
            { label: "Frames", value: formatCount(stats.satelliteFrames) },
            { label: "Milestones", value: String(stats.milestonesTracked) },
            { label: "Sources", value: String(stats.sourcesCited) },
          ].map((m, i) => (
            <div
              key={m.label}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#ffffff",
                padding: "14px 20px",
                flex: 1,
                marginLeft: i === 0 ? 0 : 1,
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 11,
                  color: "#86868b",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                {m.label}
              </div>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: "#1d1d1f" }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Confidence framework */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 12,
              color: "#86868b",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontFamily: "ui-monospace, monospace",
              marginBottom: 10,
            }}
          >
            Confidence framework
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {TIERS.map((t) => (
              <div
                key={t.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderLeft: `3px solid ${t.color}`,
                  background: "#ffffff",
                  padding: "10px 14px",
                  border: "1px solid #e5e5e7",
                  borderLeftWidth: 3,
                  borderLeftColor: t.color,
                  borderRadius: 8,
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 12,
                    color: t.color,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    fontFamily: "ui-monospace, monospace",
                    fontWeight: 800,
                  }}
                >
                  {t.label}
                </div>
                <div style={{ display: "flex", fontSize: 13, color: "#1d1d1f", lineHeight: 1.3 }}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#86868b" }}>
          <div style={{ display: "flex" }}>{`Verified against ${SOURCES.join(" · ")}`}</div>
          <div style={{ display: "flex" }}>gigascope.xyz/methodology</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
