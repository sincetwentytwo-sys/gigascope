// Smoke tests for the pure-SVG Sparkline component.
//
// Sparkline ships zero client-side JS so we test the rendered SVG markup
// directly (no DOM env, no React Testing Library overhead). We're checking
// that the polyline + endpoint render and that degenerate inputs (empty,
// single-value, all-zero) don't blow up.

import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Sparkline from "./Sparkline";

function render(props: Parameters<typeof Sparkline>[0]) {
  return renderToStaticMarkup(<Sparkline {...props} />);
}

describe("Sparkline", () => {
  it("happy: renders polyline + endpoint dot for a normal series", () => {
    const html = render({ values: [0, 10, 30, 50, 78], width: 80, height: 24 });
    expect(html).toContain("<svg");
    expect(html).toContain("<polyline");
    expect(html).toContain("<circle");
  });

  it("edge: single value renders a flat baseline line", () => {
    const html = render({ values: [42], width: 80, height: 24 });
    expect(html).toContain("<line");
    expect(html).not.toContain("<polyline");
  });

  it("edge: empty array renders a flat baseline line (no crash)", () => {
    const html = render({ values: [], width: 80, height: 24 });
    expect(html).toContain("<line");
    expect(html).not.toContain("<polyline");
  });

  it("edge: showLatest=false omits the endpoint circle", () => {
    const html = render({ values: [10, 20, 30], showLatest: false });
    expect(html).toContain("<polyline");
    expect(html).not.toContain("<circle");
  });

  it("default preserveAspectRatio is 'xMidYMid meet' so curves keep their shape", () => {
    // Before 2026-05-27 the default was 'none', which let CSS-stretched
    // sparklines visually deform — a curve that climbed gently looked like
    // a vertical wall on a narrow column. Default now preserves aspect.
    const html = render({ values: [0, 5, 10] });
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it("preserveAspectRatio='none' can still be opted into explicitly", () => {
    // For deliberately stretching to fill a wide responsive container
    // (e.g. the /pulse aggregate chart) callers can opt back into the
    // old behavior — but it's an explicit choice, not the default.
    const html = render({ values: [0, 5, 10], preserveAspectRatio: "none" });
    expect(html).toContain('preserveAspectRatio="none"');
  });

  it("emits an area polygon when fill is not transparent", () => {
    const html = render({ values: [0, 5, 10], fill: "#ff0000" });
    expect(html).toContain("<polygon");
  });

  it("does NOT emit an area polygon when fill is transparent (default)", () => {
    const html = render({ values: [0, 5, 10] });
    expect(html).not.toContain("<polygon");
  });
});
