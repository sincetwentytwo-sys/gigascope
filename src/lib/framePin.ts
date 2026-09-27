import type { Factory } from "@/data/types";

// Must match scripts/timelapse/capture.mjs (DEFAULT_HALF_KM + bboxAround).
const DEFAULT_HALF_KM = 2.0;

type FrameSite = Pick<Factory, "lat" | "lng" | "halfKm" | "captureCenter" | "zoneRadiusKm" | "footprint">;

export interface FramePinPosition {
  /** Pin position, fractions 0..1 from the frame's top-left. */
  x: number;
  y: number;
  /** Zone radius as a fraction of the frame width (zoneRadiusKm). */
  radius?: number;
  /** Footprint outline vertices in frame fractions (footprint). */
  outline?: { x: number; y: number }[];
}

/**
 * Where the site pin (lat/lng) — and its footprint/zone, if any — falls inside
 * its square Sentinel-2 capture frame. Null when the pin is outside the frame.
 * With no `captureCenter` the pin is the frame centre (0.5, 0.5).
 */
export function framePinPosition(f: FrameSite): FramePinPosition | null {
  const c = f.captureCenter ?? { lat: f.lat, lng: f.lng };
  const halfKm = f.halfKm ?? DEFAULT_HALF_KM;
  const dLat = halfKm / 111;
  const dLng = halfKm / (111 * Math.cos((c.lat * Math.PI) / 180));
  const toFrame = (lat: number, lng: number) => ({
    x: (lng - (c.lng - dLng)) / (2 * dLng),
    y: (c.lat + dLat - lat) / (2 * dLat),
  });
  const { x, y } = toFrame(f.lat, f.lng);
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  if (f.footprint && f.footprint.length >= 3) {
    return { x, y, outline: f.footprint.map(([la, lo]) => toFrame(la, lo)) };
  }
  if (f.zoneRadiusKm) return { x, y, radius: f.zoneRadiusKm / (2 * halfKm) };
  return { x, y };
}

/**
 * Only mark sites whose footprint is hard to pick out of a multi-km frame:
 * off-centre pins, explicit zones/outlines, and earthworks-stage projects.
 */
export function shouldShowFramePin(
  f: Pick<Factory, "status" | "captureCenter" | "zoneRadiusKm" | "footprint">,
): boolean {
  return Boolean(f.captureCenter || f.zoneRadiusKm || f.footprint) || f.status === "construction";
}
