"use client";

import { useState } from "react";
import Image from "next/image";
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
  const selected = product.parts.find((p) => p.id === selectedId) ?? null;
  const partsWithHotspots = product.parts.filter((p) => p.hotspot);

  // 4680 has only an SVG diagram available; everything else is a JPG photo.
  const ext = product.slug === "4680" ? "svg" : "jpg";
  const src = `/products/photos/${product.slug}.${ext}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] border border-[#343538] bg-[#0a0a0c]">
      {/* Photo */}
      <div className="relative bg-[#f4f4f0] min-h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
          {ext === "svg" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`${product.name} reference diagram`}
              className="block w-full h-auto max-h-[80vh] object-contain"
            />
          ) : (
            <Image
              src={src}
              alt={`${product.name} reference photo`}
              width={1600}
              height={1600}
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="block w-full h-auto max-h-[80vh] object-contain"
            />
          )}

          {/* Clickable polygons over the photo. Coordinates are 0..1 of the
              image; preserveAspectRatio="none" stretches the SVG to fit the
              same box as the image (which is sized by object-contain). */}
          {partsWithHotspots.length > 0 && (
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
                    className={`pointer-events-auto cursor-pointer transition-all ${
                      active
                        ? "fill-[#ffb073]/30 stroke-[#ffb073]"
                        : hovered
                        ? "fill-white/15 stroke-white/80"
                        : "fill-transparent stroke-white/0 hover:stroke-white/60"
                    }`}
                    strokeWidth="0.003"
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
          {partsWithHotspots.length > 0
            ? `Click parts on the photo  ·  ${partsWithHotspots.length}/${product.parts.length} mapped`
            : "Components listed on the right"}
        </div>

        {/* Photo credit — required by CC licenses */}
        {product.photoCredit && (
          <div className="absolute bottom-2 right-2 bg-[#121316]/85 backdrop-blur-md px-2 py-1 font-mono text-[9px] text-[#8292aa]">
            Photo:{" "}
            <a
              href={product.photoCredit.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#b7c8e1] hover:underline"
            >
              {product.photoCredit.author} · {product.photoCredit.license}
            </a>
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
