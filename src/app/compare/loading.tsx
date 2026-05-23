// Loading skeleton for /compare. CompareSlider hydrates two Leaflet tile
// layers — fallback the header strip plus a slider-shaped block.
export default function Loading() {
  return (
    <div className="bg-bg text-text -mb-8">
      <div className="border-b border-border-custom bg-bg">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-3">
          <div className="h-4 w-40 bg-surface border border-border-custom animate-pulse" />
          <div className="hidden sm:block h-3 w-64 bg-surface border border-border-custom animate-pulse" />
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full aspect-video bg-surface border border-border-custom animate-pulse" />
      </div>
    </div>
  );
}
