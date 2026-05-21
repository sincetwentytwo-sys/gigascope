import { ImageResponse } from "next/og";
import { TICKERS, tickerSlugToSymbol, getTicker, getSector } from "@/data/tickers";

export const alt = "GIGASCOPE company page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return TICKERS.map((t) => ({ slug: t.symbol.toLowerCase().replace(/\./g, "-") }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonical = tickerSlugToSymbol(slug);
  const t = getTicker(canonical);
  const primary = t?.accent ?? "#0066cc";
  const sectorBadge = t ? (getSector(t.sectors[0])?.name ?? "") : "";
  const thesis = (t?.thesis ?? "").slice(0, 180) + (t && t.thesis.length > 180 ? "…" : "");
  const mktCap = t?.marketCapB != null
    ? `~$${t.marketCapB >= 1000 ? `${(t.marketCapB / 1000).toFixed(1)}T` : `${t.marketCapB}B`} mkt cap`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          color: "#fff",
          padding: "64px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 8, height: 630, background: primary }} />

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#86868b", marginBottom: 32 }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>GIGASCOPE</span>
          <span>·</span>
          <span>Atlas company page</span>
        </div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: primary, marginBottom: 12 }}>
            {t?.symbol ?? slug.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.05, marginBottom: 20 }}>
            {t?.name ?? "Company"}
          </div>
          {t?.koreanName && (
            <div style={{ display: "flex", fontSize: 28, color: "#86868b", marginBottom: 16 }}>{t.koreanName}</div>
          )}
          <div style={{ display: "flex", fontSize: 24, color: "#d4d4d4", lineHeight: 1.35, maxWidth: 1000 }}>
            {thesis}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 18, color: "#86868b" }}>
          <span style={{ padding: "6px 14px", background: primary, color: "#0a0a0a", borderRadius: 6, fontWeight: 700 }}>
            {sectorBadge || "Atlas"}
          </span>
          {t?.exchange && <span>{t.exchange}</span>}
          {t?.hq && <span>· {t.hq}</span>}
          {mktCap && <span>· {mktCap}</span>}
          <span style={{ marginLeft: "auto" }}>gigascope.xyz</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
