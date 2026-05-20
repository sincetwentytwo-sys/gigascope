import type { Factory } from "@/data/types";

const SEGMENTS = 8;

export default function FactoryCard({
  factory,
  variant = "default",
}: {
  factory: Factory;
  variant?: "default" | "announced";
}) {
  const color = factory.color;

  // Announced 프로젝트는 별도 취급
  const isAnnounced = variant === "announced";
  const isAlert = !isAnnounced && (factory.status === "paused" || factory.status === "planned");

  // Announced일 때는 골드(#c4a000) 계열을 우선 사용
  const accent = isAnnounced ? "#c4a000" : isAlert ? "#ff716c" : color;

  const filled = Math.max(1, Math.round((factory.progress / 100) * SEGMENTS));

  return (
    <a
      href={`/site/${factory.slug}`}
      className="group relative flex flex-col gap-4 sm:gap-5 overflow-hidden border p-4 sm:p-5 transition-all duration-500 hover:shadow-[0_0_15px_rgba(109,221,255,0.15)]"
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

      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className="flex h-6 w-10 items-center justify-center overflow-hidden border text-base"
            style={{
              background: "#1e293b",
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <span className="opacity-80">{factory.flag}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold tracking-wider text-sm sm:text-[15px] text-[#e5e4ed] uppercase truncate">
              {factory.name}
            </h3>
            <p className="font-mono text-[10px] uppercase text-[#aaaab3] truncate">
              {factory.location}
            </p>
          </div>
        </div>
        <div
          className={`border px-2 py-1 flex-shrink-0 ${isAlert ? "animate-pulse" : ""}`}
          style={{
            background: `${accent}1a`,
            borderColor: `${accent}4d`,
          }}
        >
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            {isAnnounced ? "Announced" : factory.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#aaaab3]">
            {isAnnounced ? "Status" : "Progress"}
          </span>
          <span className="font-mono text-xs" style={{ color: accent }}>
            {isAnnounced ? "Announced" : `${factory.progress}%`}
          </span>
        </div>

        {isAnnounced ? (
          // Announced 전용: 얇은 점선 스타일의 placeholder
          <div className="h-1.5 w-full rounded-full border border-[#c4a000]/40 bg-[#c4a000]/10" />
        ) : (
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
        )}
      </div>

      <div
        className="grid grid-cols-3 gap-2 sm:gap-4 border-t pt-3 sm:pt-4"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Area</div>
          <div
            className="font-mono text-xs sm:text-sm truncate"
            style={{ color: isAnnounced ? "#a1a1aa" : "#e5e4ed" }}
          >
            {factory.area}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Capacity</div>
          <div
            className="font-mono text-xs sm:text-sm truncate"
            style={{ color: isAnnounced ? "#a1a1aa" : "#e5e4ed" }}
          >
            {factory.capacity}
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase text-[#64748b]">Invest</div>
          <div
            className="font-mono text-xs sm:text-sm truncate"
            style={{ color: isAnnounced ? "#a1a1aa" : isAlert ? accent : "#e5e4ed" }}
          >
            {factory.investment}
          </div>
        </div>
      </div>
    </a>
  );
}
