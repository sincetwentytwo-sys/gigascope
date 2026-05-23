// Loading skeleton for /products/[slug]. Mirrors the page shell so users
// don't see a layout flash when the photo viewer hydrates.
export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <div className="h-3 w-28 bg-surface border border-border-custom" />
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <div className="h-9 sm:h-12 w-60 bg-surface border border-border-custom" />
          <div className="h-4 w-24 bg-surface border border-border-custom" />
          <div className="h-4 w-20 bg-surface border border-border-custom" />
        </div>
      </div>

      {/* Photo viewer placeholder — aspect roughly matches Product2DViewer */}
      <div className="w-full aspect-[4/3] sm:aspect-video bg-surface border border-border-custom" />

      {/* Overview + sidebar placeholder */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-4 w-32 bg-surface border border-border-custom" />
          <div className="h-3 w-full bg-surface border border-border-custom" />
          <div className="h-3 w-full bg-surface border border-border-custom" />
          <div className="h-3 w-5/6 bg-surface border border-border-custom" />
          <div className="h-3 w-2/3 bg-surface border border-border-custom" />
        </div>
        <aside className="flex flex-col gap-4">
          <div className="border border-border-custom bg-surface p-4 h-[140px]" />
          <div className="border border-border-custom bg-surface p-4 h-[140px]" />
        </aside>
      </div>
    </div>
  );
}
