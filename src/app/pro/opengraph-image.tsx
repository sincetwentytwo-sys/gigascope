// Dynamic OG image for /pro. Renders the charter pricing card as a
// 1200×630 PNG so shared /pro links surface the $9/mo lock visually
// in the social-card preview instead of the homepage fallback.

import { ImageResponse } from "next/og";

export const alt = "GIGASCOPE Charter — $9/mo locked for life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (next/og) requires explicit display on every div with multiple
// children, hence the seemingly redundant display:flex everywhere.

export default function ProOG() {
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
              display: "flex",
              padding: "6px 14px",
              borderRadius: 999,
              background: "#1d1d1f",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            Founding 100 · first 100 lock $9/mo for life
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 900,
            color: "#1d1d1f",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}
        >
          $9 for the empire,
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 900,
            color: "#1d1d1f",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            marginBottom: 28,
          }}
        >
          locked for life.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "#86868b",
            lineHeight: 1.4,
            maxWidth: 920,
            marginBottom: 36,
          }}
        >
          Daily digest. Satellite-drop alerts. Weekly recap. Bulk data exports. Public rate is $29 when billing opens — charter pricing is grandfathered as long as your subscription stays active.
        </div>

        {/* Two pricing cards side by side */}
        <div style={{ display: "flex", gap: 16, marginTop: "auto", marginBottom: 24 }}>
          {/* Charter card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: "#ffffff",
              border: "2px solid #1d1d1f",
              borderRadius: 14,
              padding: "20px 24px",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#1d1d1f",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Charter · first 100
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
                $9
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#86868b" }}>/ month</div>
            </div>
            <div style={{ display: "flex", fontSize: 14, color: "#86868b" }}>or $90 / year · 17% off · locked for life</div>
          </div>

          {/* Free card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              background: "#ffffff",
              border: "1px solid #e5e5e7",
              borderRadius: 14,
              padding: "20px 24px",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#86868b",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontFamily: "ui-monospace, monospace",
              }}
            >
              Free
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ display: "flex", fontSize: 56, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
                $0
              </div>
              <div style={{ display: "flex", fontSize: 18, color: "#86868b" }}>/ forever</div>
            </div>
            <div style={{ display: "flex", fontSize: 14, color: "#86868b" }}>daily digest + 16-site dashboard, no card</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#86868b" }}>
          <div style={{ display: "flex" }}>Paid software subscription · not equity, not a token, not a security</div>
          <div style={{ display: "flex" }}>gigascope.xyz/pro</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
