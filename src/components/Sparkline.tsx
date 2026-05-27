// Tiny pure SVG sparkline. No client JS — renders inline as an SVG with
// the polyline coordinates pre-computed at server-render time. The point
// is to surface the progress-timeline shape on every card without paying
// for a charting library.
//
// Empty / all-zero series renders a flat dim baseline so the row doesn't
// collapse to zero height.

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
  /** Render a small dot at the most recent point. */
  showLatest?: boolean;
  /**
   * Default `xMidYMid meet` preserves the curve's aspect ratio when the
   * SVG is responsive-stretched via CSS `width: 100%`. Set to `"none"`
   * only when you intentionally want the curve to deform to fill the box
   * (rare — and it makes the curve lie about its shape).
   */
  preserveAspectRatio?: "none" | "xMidYMid meet" | "xMidYMid slice";
  /**
   * Optional uncertainty band. When present, renders a translucent polygon
   * between `band.low` and `band.high` BEHIND the main polyline.
   * Lengths must match `values.length`; mismatched lengths skip the band
   * (no throw — degenerates gracefully so a bad input doesn't crash a
   * server-rendered page).
   */
  band?: { low: number[]; high: number[] };
}

export default function Sparkline({
  values,
  width = 80,
  height = 22,
  stroke = "currentColor",
  fill = "transparent",
  strokeWidth = 1.5,
  className,
  showLatest = true,
  preserveAspectRatio = "xMidYMid meet",
  band,
}: SparklineProps) {
  if (!values || values.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden="true">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={stroke}
          strokeWidth={1}
          opacity={0.25}
        />
      </svg>
    );
  }

  const padY = 2;
  const innerH = height - padY * 2;
  const max = Math.max(...values, 1);
  // Pin the y=0 baseline so a flat 0-series sits at the bottom rather than
  // dancing around mid-axis.
  const stepX = values.length === 1 ? 0 : width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = padY + innerH - (v / max) * innerH;
    return [x, y] as const;
  });

  const polyline = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // Area fill polygon — closes back to baseline so subtle fill works.
  const area = `${points[0][0]},${height - 1} ${polyline} ${points[points.length - 1][0]},${height - 1}`;

  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];

  // Optional uncertainty band — closed polygon traced low (L→R) then high
  // (R→L). Values get clamped to [0, max] so the band can't escape the
  // chart even with absurd inputs. Skipped silently if shapes don't agree
  // with `values` — better to drop the band than throw at render time.
  const bandPoints: string | null = (() => {
    if (!band) return null;
    if (band.low.length !== values.length || band.high.length !== values.length) return null;
    const clamp = (v: number) => Math.min(Math.max(v, 0), max);
    const lowPts = band.low.map((v, i) => {
      const x = i * stepX;
      const y = padY + innerH - (clamp(v) / max) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const highPtsReverse = band.high
      .map((v, i) => {
        const x = i * stepX;
        const y = padY + innerH - (clamp(v) / max) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .reverse();
    return [...lowPts, ...highPtsReverse].join(" ");
  })();

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio={preserveAspectRatio}
    >
      {bandPoints && (
        <polygon points={bandPoints} fill={stroke} opacity={0.15} />
      )}
      {fill !== "transparent" && (
        <polygon points={area} fill={fill} opacity={0.18} />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showLatest && (
        <circle cx={lastX} cy={lastY} r={strokeWidth + 0.6} fill={stroke} />
      )}
    </svg>
  );
}
