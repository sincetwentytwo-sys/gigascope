// Dynamic OG image for /pulse. Renders the empire scoreboard as a 1200×630
// PNG so shared /pulse links surface the live stats in the social-card
// preview instead of the homepage fallback.

import { ImageResponse } from "next/og";
import { getEmpireStats, formatKm2, formatCount } from "@/lib/pulse";

export const alt = "GIGASCOPE Pulse — Musk-orbit construction scoreboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PulseOG() {
  const stats = getEmpireStats();

  const cells = [
    { label: "Sites", value: String(stats.sites), sub: `${stats.operationalSites} ops · ${stats.expandingSites} expanding` },
    { label: "Capital", value: stats.totalInvestment, sub: "declared investment" },
    { label: "Footprint", value: formatKm2(stats.totalFootprintKm2), sub: "industrial area" },
    { label: "Captures", value: formatCount(stats.satelliteFrames), sub: `${stats.timelapseSites} timelapses` },
    { label: "Milestones", value: String(stats.milestonesTracked), sub: `${stats.milestonesDone} verified` },
    { label: "Sources", value: String(stats.sourcesCited), sub: "primary links" },
  ];

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              background: "#00875a",
            }}
          />
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
            GIGASCOPE · Pulse · Empire scoreboard
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 900,
            color: "#1d1d1f",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 14,
            maxWidth: 1000,
          }}
        >
          What the Musk empire is building, right now.
        </div>
        <div style={{ display: "flex", fontSize: 22, color: "#86868b", marginBottom: 36 }}>
          {`${stats.sites} sites · ${stats.countries} countries · five companies · refreshed as new captures land`}
        </div>

        {/* Scoreboard cells — Satori (next/og) doesn't support display:grid,
            so we hand-build a flex row that wraps. Each cell is calc'd to ~1/6
            of the container minus a 1px hairline. */}
        <div
          style={{
            display: "flex",
            border: "1px solid #e5e5e7",
            borderRadius: 12,
            overflow: "hidden",
            background: "#e5e5e7",
            marginTop: "auto",
            marginBottom: 20,
          }}
        >
          {cells.map((c, i) => (
            <div
              key={c.label}
              style={{
                background: "#ffffff",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
                marginLeft: i === 0 ? 0 : 1,
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
                {c.label}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#1d1d1f",
                  letterSpacing: "-0.01em",
                }}
              >
                {c.value}
              </div>
              <div style={{ display: "flex", fontSize: 12, color: "#86868b", lineHeight: 1.3 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#86868b" }}>
          <div style={{ display: "flex" }}>
            Tesla · SpaceX · xAI · Neuralink · The Boring Company
          </div>
          <div style={{ display: "flex" }}>gigascope.xyz/pulse</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
