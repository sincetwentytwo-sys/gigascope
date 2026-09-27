import { ImageResponse } from "next/og";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getFactory, getTimelapseSlug } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import { TIMELAPSE_INDEX } from "@/lib/timelapseIndex";
import { framePinPosition, shouldShowFramePin } from "@/lib/framePin";

export const alt = "Site — GIGASCOPE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Before/after thumbnails are the first/last timelapse frame, centre-cropped
// from the square capture to 16:9 (scripts/generate-site-thumbnails.mjs).
const IMG_W = 544;
const IMG_H = 306;
const CROP_TOP = (1 - 9 / 16) / 2; // fraction of the square cut from the top

function jpgDataUri(file: string): string | null {
  const p = resolve(process.cwd(), "public", "timelapses", file);
  return existsSync(p) ? `data:image/jpeg;base64,${readFileSync(p).toString("base64")}` : null;
}

/** SVG overlay (same geometry as the site page's FramePin) as a data URI. */
function markerSvg(pin: ReturnType<typeof framePinPosition>, color: string): string | null {
  if (!pin) return null;
  const X = (fx: number) => fx * IMG_W;
  const Y = (fy: number) => ((fy - CROP_TOP) / (9 / 16)) * IMG_H;
  let shape: string;
  if (pin.outline) {
    const pts = pin.outline.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
    shape = `<polygon points="${pts}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>`;
  } else if (pin.radius) {
    shape = `<circle cx="${X(pin.x)}" cy="${Y(pin.y)}" r="${pin.radius * IMG_W}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="10 7"/>`;
  } else {
    shape = `<circle cx="${X(pin.x)}" cy="${Y(pin.y)}" r="14" fill="none" stroke="${color}" stroke-width="3"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${IMG_W}" height="${IMG_H}">${shape}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
          Site not found — GIGASCOPE
        </div>
      ),
      { ...size }
    );
  }

  const company = getCompanyMeta(factory.company);
  const tlSlug = getTimelapseSlug(factory);
  const tl = tlSlug ? TIMELAPSE_INDEX[tlSlug] : undefined;
  const before = tlSlug ? jpgDataUri(`${tlSlug}-first.jpg`) : null;
  const now = tlSlug ? jpgDataUri(`${tlSlug}-last.jpg`) : null;
  const marker = shouldShowFramePin(factory)
    ? markerSvg(framePinPosition(factory), "#ffd21f")
    : null;

  const header = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, color: "#86868b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          GIGASCOPE
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#ffffff",
            padding: "3px 10px",
            borderRadius: 20,
            background: company.color,
            fontWeight: 600,
          }}
        >
          {company.name}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#86868b", padding: "4px 12px", border: "1px solid #e5e5e7", borderRadius: 20 }}>
        {factory.status}
      </div>
    </div>
  );

  // Satellite layout: the before/after pair is what makes the card worth a click.
  if (before && now) {
    const frame = (src: string, tag: string) => (
      <div style={{ display: "flex", position: "relative", width: IMG_W, height: IMG_H, borderRadius: 10, overflow: "hidden" }}>
        <img src={src} width={IMG_W} height={IMG_H} style={{ objectFit: "cover" }} />
        {marker && <img src={marker} width={IMG_W} height={IMG_H} style={{ position: "absolute", top: 0, left: 0 }} />}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            fontSize: 14,
            fontWeight: 700,
            color: "#ffffff",
            background: "rgba(0,0,0,0.65)",
            padding: "4px 10px",
            borderRadius: 6,
            letterSpacing: "0.06em",
          }}
        >
          {tag}
        </div>
      </div>
    );
    return new ImageResponse(
      (
        <div
          style={{
            background: "#ffffff",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "36px 48px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {header}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
            <div style={{ fontSize: 46, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              {`${factory.flag} ${factory.name}`}
            </div>
            <div style={{ fontSize: 19, color: "#6e6e73", marginTop: 6 }}>{factory.location}</div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
            {frame(before, tl?.first ? `BEFORE · ${tl.first}` : "BEFORE")}
            {frame(now, tl?.latest ? `NOW · ${tl.latest}` : "NOW")}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: company.color }}>{`${factory.progress}%`}</div>
              <div style={{ fontSize: 17, color: "#6e6e73" }}>{factory.investment}</div>
            </div>
            <div style={{ fontSize: 15, color: "#86868b" }}>Sentinel-2 · gigascope.xyz</div>
          </div>
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
        {header}

        {/* Site name + progress. The name column flexes and the % never
            shrinks — long names used to push the % off the right edge. */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32, gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
              {`${factory.flag} ${factory.name}`}
            </div>
            <div style={{ fontSize: 20, color: "#86868b", marginTop: 4 }}>{factory.location}</div>
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, color: company.color, flexShrink: 0 }}>
            {`${factory.progress}%`}
          </div>
        </div>

        <div style={{ width: "100%", height: 12, background: "#f5f5f7", borderRadius: 6, marginTop: 24, display: "flex", overflow: "hidden" }}>
          <div style={{ width: `${factory.progress}%`, height: "100%", background: company.color, borderRadius: 6 }} />
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
          {infoCards.map((c) => (
            <div
              key={c.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                background: "#f5f5f7",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 11, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {c.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginTop: 4 }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 24 }}>
          <div style={{ fontSize: 14, color: "#86868b" }}>{factory.products}</div>
          <div style={{ fontSize: 14, color: "#86868b" }}>{`${completedMs}/${totalMs} milestones — gigascope.xyz`}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
