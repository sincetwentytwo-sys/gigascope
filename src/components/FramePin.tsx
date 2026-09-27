// Ring marking the site pin on a square satellite frame that is displayed
// with object-cover (timelapse video) or was centre-cropped to 16:9
// (before/after JPGs). The overlay is a full-width square centred vertically
// in the container, which reproduces exactly that crop, so percentage
// coordinates from framePinPosition() land on the right pixel either way.
// Parent must be `relative overflow-hidden`.
export default function FramePin({
  x,
  y,
  label,
  color,
}: {
  x: number;
  y: number;
  label?: string;
  color: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-1/2 w-full aspect-square -translate-y-1/2"
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      >
        <div
          className="w-7 h-7 rounded-full border-2 shadow-[0_0_0_2px_rgba(0,0,0,0.45)]"
          style={{ borderColor: color }}
        />
        {label && (
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
