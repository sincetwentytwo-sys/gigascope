// /pulse loading state — skeleton that mirrors the real page's vertical
// rhythm so the layout doesn't snap when the data resolves.

export default function PulseLoading() {
  return (
    <div className="bg-bg text-text animate-pulse">
      {/* Header */}
      <div className="border-b border-border-custom">
        <div className="max-w-[1300px] mx-auto px-6 py-14">
          <div className="h-3 w-32 bg-surface rounded mb-4" />
          <div className="h-12 w-2/3 bg-surface rounded mb-3" />
          <div className="h-12 w-1/2 bg-surface rounded mb-4" />
          <div className="h-4 w-3/4 bg-surface rounded" />
        </div>
      </div>
      {/* Scoreboard */}
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-border-custom rounded-md overflow-hidden border border-border-custom">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-bg p-5 h-[110px]">
              <div className="h-2 w-20 bg-surface rounded mb-3" />
              <div className="h-7 w-16 bg-surface rounded mb-2" />
              <div className="h-2 w-24 bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Capture grid */}
      <div className="max-w-[1300px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border-custom overflow-hidden">
              <div className="aspect-video bg-surface" />
              <div className="p-3">
                <div className="h-3 w-2/3 bg-surface rounded mb-2" />
                <div className="h-2 w-1/2 bg-surface rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
