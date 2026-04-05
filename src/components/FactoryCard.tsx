import type { Factory } from "@/data/types";

export default function FactoryCard({ factory }: { factory: Factory }) {
  return (
    <a
      href={`/factory/${factory.slug}`}
      className="group block bg-surface rounded-xl p-5 hover:shadow-lg transition-shadow"
    >
      {/* Progress — big, top */}
      <div className="flex justify-between items-start mb-3">
        <span className={`badge badge-${factory.status}`}>{factory.status}</span>
        <span className="text-2xl font-bold" style={{ color: factory.color }}>
          {factory.progress}%
        </span>
      </div>

      <div className="h-1.5 bg-border-custom rounded-full mb-4">
        <div className="h-full rounded-full" style={{ width: `${factory.progress}%`, background: factory.color }} />
      </div>

      {/* Name */}
      <div className="flex gap-2 items-center mb-3">
        <span className="text-lg">{factory.flag}</span>
        <div>
          <h3 className="text-[15px] font-semibold group-hover:text-accent-blue transition-colors">{factory.name}</h3>
          <p className="text-xs text-dim">{factory.location}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-dim">
        <span>Area <strong className="text-text">{factory.area}</strong></span>
        <span>Cap <strong className="text-text">{factory.capacity}</strong></span>
      </div>
    </a>
  );
}
