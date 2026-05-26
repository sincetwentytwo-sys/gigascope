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

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
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
