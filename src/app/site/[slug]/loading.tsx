// Loading skeleton for /site/[slug]. Leaflet + tile fetch is the slow path;
// this gives users the page shell instantly so the layout shift is bounded.
export default function Loading() {
  return (
    <div className="bg-bg text-text min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
        {/* Top strip placeholder */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
          <div className="h-4 w-20 bg-surface border border-border-custom" />
          <div className="h-6 w-44 bg-surface border border-border-custom" />
          <div className="flex-1 min-w-full sm:min-w-[200px] max-w-md h-3 bg-surface border border-border-custom" />
          <div className="h-5 w-24 bg-surface border border-border-custom" />
        </div>

        {/* Title block placeholder */}
        <div className="mb-6 border-l-2 border-border-custom pl-4 space-y-2">
          <div className="h-9 w-2/3 bg-surface border border-border-custom" />
          <div className="h-3 w-1/2 bg-surface border border-border-custom" />
          <div className="h-3 w-1/3 bg-surface border border-border-custom" />
        </div>

        {/* Stat cards placeholder */}
        <div className="grid gap-3 sm:gap-4 mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-l-2 border-border-custom p-3 sm:p-4 h-[88px]"
            />
          ))}
        </div>

        {/* Map + right column placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="aspect-video w-full bg-surface border border-border-custom" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-surface border border-border-custom p-4 sm:p-5 h-[320px]" />
            <div className="bg-surface border border-border-custom p-4 sm:p-5 h-[240px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
