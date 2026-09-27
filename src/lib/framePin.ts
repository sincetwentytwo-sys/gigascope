import type { Factory } from "@/data/types";

// Must match scripts/timelapse/capture.mjs (DEFAULT_HALF_KM + bboxAround).
const DEFAULT_HALF_KM = 2.0;

/**
 * Where the site pin (lat/lng) falls inside its square Sentinel-2 capture
 * frame, as fractions 0..1 from the top-left. Null when the pin is outside
 * the frame. With no `captureCenter` the pin is the frame centre (0.5, 0.5).
 */
export function framePinPosition(
  f: Pick<Factory, "lat" | "lng" | "halfKm" | "captureCenter">,
): { x: number; y: number } | null {
  const c = f.captureCenter ?? { lat: f.lat, lng: f.lng };
  const halfKm = f.halfKm ?? DEFAULT_HALF_KM;
  const dLat = halfKm / 111;
  const dLng = halfKm / (111 * Math.cos((c.lat * Math.PI) / 180));
  const x = (f.lng - (c.lng - dLng)) / (2 * dLng);
  const y = (c.lat + dLat - f.lat) / (2 * dLat);
  if (x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { x, y };
}

/**
 * Only mark sites whose footprint is hard to pick out of a multi-km frame:
 * off-centre pins, and projects still at the earthworks stage.
 */
export function shouldShowFramePin(f: Pick<Factory, "status" | "captureCenter">): boolean {
  return Boolean(f.captureCenter) || f.status === "construction";
}
