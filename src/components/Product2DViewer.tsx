"use client";

import { useState } from "react";
import type { ProductSpec } from "@/data/products";

/**
 * Photo-first product viewer. Shows a real reference photo of the product
 * alongside a scrollable component list; click/hover a component to read its
 * specs in the bottom panel. Components with `hotspot` coordinates also get
 * a clickable SVG polygon overlaid on the photo.
 */
export default function Product2DViewer({ product }: { product: ProductSpec }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState<number>(0); // 0 = main photo
  const selected = product.parts.find((p) => p.id === selectedId) ?? null;
  const partsWithHotspots = product.parts.filter((p) => p.hotspot);

  // 4680 has only an SVG diagram available; everything else is a JPG photo.
  const mainExt = product.slug === "4680" ? "svg" : "jpg";
  const mainSrc = `/products/photos/${product.slug}/main.${mainExt}`;
  const mainCredit = product.photoCredit;

  const gallery = product.galleryPhotos ?? [];
  const isMain = galleryIdx === 0;
  const currentSrc = isMain ? mainSrc : gallery[galleryIdx - 1].src;
  const currentExt = isMain ? mainExt : "jpg";
  const currentCredit = isMain ? mainCredit : gallery[galleryIdx - 1].credit;
  // Hotspots only overlay the main photo — gallery views are bare.
  const overlayHotspots = isMain && partsWithHotspots.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] border border-[#343538] bg-[#0a0a0c]">
      {/* Photo */}
      <div className="relative bg-[#f4f4f0] min-h-[55vh] flex flex-col overflow-hidden">
        <div className="relative flex-1 flex items-center justify-center min-h-[50vh]">
          {/* Plain <img> rather than next/image — the optimizer pipeline was
              showing a blank placeholder for ~1 second on every page load,
              which felt broken. JPEGs are already <400KB so the perf cost
              of skipping the optimizer is negligible. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentSrc}
            src={currentSrc}
            alt={`${product.name} reference ${currentExt === "svg" ? "diagram" : "photo"}`}
            className="block w-full h-auto max-h-[72vh] object-contain"
            decoding="sync"
            loading="eager"
            fetchPriority="high"
          />

          {/* Clickable polygons over the MAIN photo only. Outlines are
              visible by default (subtle white at ~25% opacity) so users see
              that the photo is interactive without having to hover-hunt. */}
          {overlayHotspots && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              {partsWithHotspots.map((p) => {
                const active = selectedId === p.id;
                const hovered = hoveredId === p.id;
                return (
                  <polygon
                    key={p.id}
                    points={p.hotspot!.points}
                    onClick={() => setSelectedId(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      fill: active
                        ? "rgba(255, 176, 115, 0.32)"
                        : hovered
                        ? "rgba(255, 255, 255, 0.16)"
                        : "transparent",
                      stroke: active
                        ? "#ffb073"
                        : hovered
                        ? "#ffffff"
                        : "rgba(255, 255, 255, 0.65)",
                      strokeWidth: 2,
                      cursor: "pointer",
                      transition: "fill 0.15s, stroke 0.15s",
                      pointerEvents: "auto",
                    }}
                    vectorEffect="non-scaling-stroke"
                  >
                    <title>{p.name}</title>
                  </polygon>
                );
              })}
            </svg>
          )}
        </div>

        <div className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-3 py-1.5 border border-[#343538] font-mono text-[10px] text-[#b7c8e1] uppercase tracking-widest">
          {overlayHotspots
            ? `Click parts on the photo  ·  ${partsWithHotspots.length}/${product.parts.length} mapped`
            : isMain
            ? "Components listed on the right"
            : (gallery[galleryIdx - 1]?.label ?? "View")}
        </div>

        {/* Photo credit — required by CC licenses */}
        {currentCredit && (
          <div className="absolute bottom-2 right-2 bg-[#121316]/85 backdrop-blur-md px-2 py-1 font-mono text-[9px] text-[#8292aa]">
            Photo:{" "}
            <a
              href={currentCredit.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#b7c8e1] hover:underline"
            >
              {currentCredit.author} · {currentCredit.license}
            </a>
          </div>
        )}

        {/* Gallery thumbnail strip */}
        {gallery.length > 0 && (
          <div className="flex gap-2 p-2 bg-[#0a0a0c] border-t border-[#343538] overflow-x-auto">
            {[{ src: mainSrc, label: "Main" }, ...gallery].map((g, i) => {
              const active = galleryIdx === i;
              return (
                <button
                  key={g.src}
                  type="button"
                  onClick={() => setGalleryIdx(i)}
                  className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 overflow-hidden border-2 transition-colors ${
                    active ? "border-[#ffb073]" : "border-[#343538] hover:border-[#6a7a8a]"
                  }`}
                  title={g.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.src}
                    alt={g.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] font-mono uppercase tracking-wider px-1 py-0.5 text-center">
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Component list + detail */}
      <aside className="border-t lg:border-t-0 lg:border-l border-[#343538] bg-[#121316] flex flex-col min-h-[55vh]">
        <div className="overflow-y-auto p-4 border-b border-[#343538] flex-1 lg:flex-none lg:max-h-[45vh]">
          <h3 className="font-mono text-[10px] text-[#8292aa] uppercase tracking-widest mb-3">
            Components · {product.parts.length}
          </h3>
          <ul className="space-y-0.5">
            {product.parts.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  onMouseEnter={() => setSelectedId(p.id)}
                  className={`w-full text-left text-[13px] px-2 py-1.5 transition-colors font-medium ${
                    selectedId === p.id
                      ? "bg-[#1f1f23] text-white"
                      : "text-[#b7c8e1] hover:bg-[#1a1d22] hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 overflow-y-auto flex-1 min-h-[200px]">
          {selected ? (
            <>
              <h4 className="text-white font-semibold mb-2 text-[15px]">
                {selected.name}
              </h4>
              <p className="text-[13px] text-[#b7c8e1] leading-relaxed whitespace-pre-wrap">
                {selected.description}
              </p>
              {selected.href && (
                <a
                  href={selected.href}
                  className="mt-3 inline-block text-[11px] font-mono text-[#7aa6ff] uppercase tracking-widest hover:underline"
                >
                  Open detail →
                </a>
              )}
            </>
          ) : (
            <p className="text-[13px] text-[#5a6e8f] italic">
              Select a component to read its specs.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
