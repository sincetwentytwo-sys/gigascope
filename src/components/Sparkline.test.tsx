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

  it("uses preserveAspectRatio='none' so it stretches with the container", () => {
    const html = render({ values: [0, 5, 10] });
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
