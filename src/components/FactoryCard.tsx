import type { Factory } from "@/data/types";

const SEGMENTS = 8;

export default function FactoryCard({ factory }: { factory: Factory }) {
  const color = factory.color;
  const isAlert = factory.status === "paused" || factory.status === "planned";
  const accent = isAlert ? "#ff716c" : color;
  const filled = Math.max(1, Math.round((factory.progress / 100) * SEGMENTS));

  return (
    <a
      href={`/site/${factory.slug}`}
      className="group relative flex flex-col gap-5 overflow-hidden border p-5 transition-all duration-500 hover:shadow-[0_0_15px_rgba(109,221,255,0.15)]"
      style={{
        background: "rgba(15, 17, 23, 0.92)",
        borderColor: `${accent}33`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-8 h-16 w-16 rotate-45 transition-all"
        style={{ background: `${accent}14` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-6 w-10 items-center justify-center overflow-hidden border text-base"
            style={{
              background: "#1e293b",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span className="opacity-80">{factory.flag}</span>
          </div>
          <div>
            <h3 className="font-bold tracking-wider text-[15px] text-[#e5e4ed] uppercase">
              {factory.name}
            </h3>
            <p className="font-mono text-[10px] uppercase text-[#aaaab3]">
              {factory.location}
            </p>
          </div>
        </div>
        <div
          className={`border px-2.5 py-1 ${isAlert ? "animate-pulse" : ""}`}
          style={{
            background: `${accent}1a`,
            borderColor: `${accent}4d`,
          }}
        >
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {factory.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#aaaab3]">
            Progress
          </span>
          <span className="font-mono text-xs" style={{ color: accent }}>
            {factory.progress}%
          </span>
        </div>
        <div className="flex h-1.5 w-full gap-1">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div
              key={i}
              className="h-full flex-grow transition-all"
              style={
                i < filled
                  ? {
                      background: accent,
                      boxShadow: `0 0 8px ${accent}66`,
                    }
                  : { background: `${accent}33` }
              }
            />
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-4 border-t pt-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div>
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Area</div>
          <div className="font-mono text-sm text-[#e5e4ed] truncate">{factory.area}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Capacity</div>
          <div className="font-mono text-sm text-[#e5e4ed] truncate">{factory.capacity}</div>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Invest</div>
          <div
            className="font-mono text-sm truncate"
            style={{ color: isAlert ? accent : "#e5e4ed" }}
          >
            {factory.investment}
          </div>
        </div>
      </div>
    </a>
  );
}
