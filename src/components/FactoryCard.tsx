import type { Factory } from "@/data/types";

export default function FactoryCard({ factory }: { factory: Factory }) {
  return (
    <a
      href={`/factory/${factory.slug}`}
      className={`glass-card p-5 block group relative overflow-hidden ${
        factory.featured
          ? "border-accent-pink/30 bg-gradient-to-br from-accent-pink/5 to-accent-purple/3"
          : ""
      }`}
    >
      {factory.featured && (
        <span className="absolute top-3 right-3 text-[0.55rem] font-bold px-2 py-0.5 rounded bg-accent-pink text-white tracking-wider animate-pulse">
          NEW
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold group-hover:text-white transition-colors">
            {factory.flag} {factory.name}
          </h3>
          <p className="text-[0.65rem] text-dim mt-0.5">{factory.location}</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        <span className={`badge badge-${factory.status}`}>
          {factory.status}
        </span>
        {factory.products
          .split(",")
          .slice(0, 2)
          .map((p) => (
            <span
              key={p}
              className="badge"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "var(--dim)",
              }}
            >
              {p.trim()}
            </span>
          ))}
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${factory.progress}%`,
            background: factory.color,
          }}
        />
      </div>

      <div className="flex justify-between mt-2.5 font-mono text-[0.6rem] text-dim">
        <span>
          Progress{" "}
          <strong className="text-text font-medium">
            {factory.progress}%
          </strong>
        </span>
        <span>
          Area{" "}
          <strong className="text-text font-medium">{factory.area}</strong>
        </span>
        <span>
          Cap{" "}
          <strong className="text-text font-medium">{factory.capacity}</strong>
        </span>
      </div>
    </a>
  );
}
