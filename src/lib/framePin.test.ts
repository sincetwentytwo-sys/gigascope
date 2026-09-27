import { describe, expect, it } from "vitest";
import { framePinPosition, shouldShowFramePin } from "./framePin";

describe("framePinPosition", () => {
  it("puts an un-offset pin at the frame centre", () => {
    const p = framePinPosition({ lat: 30.6165, lng: -96.0233, halfKm: 4 })!;
    expect(p.x).toBeCloseTo(0.5, 9);
    expect(p.y).toBeCloseTo(0.5, 9);
  });

  it("places an off-centre pin NE of the capture centre (Terafab Austin)", () => {
    const p = framePinPosition({
      lat: 30.2372,
      lng: -97.5966,
      halfKm: 3,
      captureCenter: { lat: 30.228, lng: -97.612 },
    })!;
    expect(p.x).toBeCloseTo(0.746, 2); // east of centre
    expect(p.y).toBeCloseTo(0.330, 2); // north of centre (smaller y)
  });

  it("returns null when the pin falls outside the capture box", () => {
    expect(
      framePinPosition({ lat: 31, lng: -97.6, halfKm: 3, captureCenter: { lat: 30.228, lng: -97.612 } }),
    ).toBeNull();
  });

  it("only marks off-centre or earthworks-stage sites", () => {
    expect(shouldShowFramePin({ status: "operational" })).toBe(false);
    expect(shouldShowFramePin({ status: "construction" })).toBe(true);
    expect(shouldShowFramePin({ status: "expanding", captureCenter: { lat: 0, lng: 0 } })).toBe(true);
  });
});
