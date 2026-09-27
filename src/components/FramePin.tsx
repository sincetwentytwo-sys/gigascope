// Marks the site on a square satellite frame that is displayed with
// object-cover (timelapse video) or was centre-cropped to 16:9 (before/after
// JPGs). The overlay is a full-width square centred vertically in the
// container, which reproduces exactly that crop, so frame fractions from
// framePinPosition() land on the right pixel either way.
//   outline → the construction footprint polygon
//   radius  → a dashed zone (footprint not resolvable)
//   neither → a ring on the pin
// Parent must be `relative overflow-hidden`.
export default function FramePin({
  x,
  y,
  radius,
  outline,
  label,
  color,
}: {
  x: number;
  y: number;
  radius?: number;
  outline?: { x: number; y: number }[];
  label?: string;
  color: string;
}) {
  const labelTop = outline ? Math.max(...outline.map((p) => p.y)) : radius ? y + radius : y;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-1/2 w-full aspect-square -translate-y-1/2"
    >
      {outline ? (
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <polygon
            points={outline.map((p) => `${p.x},${p.y}`).join(" ")}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      ) : radius ? (
        <div
          className="absolute rounded-full border-2 border-dashed -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            width: `${radius * 200}%`,
            height: `${radius * 200}%`,
            borderColor: color,
          }}
        />
      ) : null}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x * 100}%`, top: `${labelTop * 100}%` }}
      >
        {!radius && !outline && (
          <div
            className="w-7 h-7 rounded-full border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.45)]"
            style={{ borderColor: color }}
          />
        )}
        {label && (
          <span
            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono uppercase tracking-wider ${radius || outline ? "top-1.5" : "top-full mt-1"}`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
