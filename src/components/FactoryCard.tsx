import type { Factory } from "@/data/types";

export default function FactoryCard({ factory }: { factory: Factory }) {
  return (
    <a
      href={`/factory/${factory.slug}`}
      className="group block bg-surface rounded-xl p-5 hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[11px] font-medium text-dim bg-surface px-2.5 py-1 rounded-full border border-border-custom">
          {factory.status}
        </span>
        <span className="text-2xl font-bold text-text">
          {factory.progress}%
        </span>
      </div>

      <div className="h-1 bg-border-custom rounded-full mb-4">
        <div className="h-full rounded-full bg-text" style={{ width: `${factory.progress}%` }} />
      </div>

      <div className="flex gap-2 items-center mb-3">
        <span className="text-lg">{factory.flag}</span>
        <div>
          <h3 className="text-[15px] font-semibold">{factory.name}</h3>
          <p className="text-xs text-dim">{factory.location}</p>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-dim">
        <span>{factory.area}</span>
        <span>{factory.capacity}</span>
      </div>
    </a>
  );
}
