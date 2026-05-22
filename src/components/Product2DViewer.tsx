"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductSpec } from "@/data/products";

/**
 * Photo-first product viewer. Shows a real reference photo of the product
 * alongside a scrollable component list. Parts with a `hotspot: {x, y}`
 * get a small numbered dot on the photo — clicking a dot or a list row
 * surfaces the part's spec blurb in the bottom panel.
 */
export default function Product2DViewer({ product }: { product: ProductSpec }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Natural dimensions of the photo — used to size the SVG viewBox AND the
  // wrapper aspect-ratio so dots and image are pixel-aligned.
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 1000,
    h: 1000,
  });
  const imgRef = useRef<HTMLImageElement>(null);

  // When the image is already cached, React mounts the <img> *after* the
  // browser fires `load`, so the onLoad handler never runs and aspect-ratio
  // stays at the 1:1 default. Read it eagerly on mount too.
  useEffect(() => {
    const i = imgRef.current;
    if (i && i.complete && i.naturalWidth > 0) {
      setNaturalSize({ w: i.naturalWidth, h: i.naturalHeight });
    }
  }, [product.slug]);
  const selected = product.parts.find((p) => p.id === selectedId) ?? null;
  const partsWithHotspots = product.parts.filter(
    (p) => p.hotspot && typeof p.hotspot.x === "number",
  );
  // Map part id -> its dot number (1, 2, ...). List rows show this badge too
  // so the eye can jump between photo and list without hunting.
  const dotNumber = new Map<string, number>();
  partsWithHotspots.forEach((p, i) => dotNumber.set(p.id, i + 1));

  // Products marked imageType: "svg" (or the legacy 4680) use a schematic
  // diagram; everything else points to a JPG reference photo.
  const ext = product.imageType === "svg" || product.slug === "4680" ? "svg" : "jpg";
  const src = `/products/photos/${product.slug}/main.${ext}`;
  const credit = product.photoCredit;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] border border-border-custom bg-bg">
      {/* Photo */}
      <div className="relative bg-surface min-h-[55vh] overflow-hidden p-4 text-center">
        {/* inline-block wrapper that pulls its size from the inline img
            (which respects max-h:78vh + max-w:100%). flex parents kept
            stretching this to 55vh and pushing the SVG below the photo —
            text-align center on a block parent + inline-block here avoids
            that and keeps the wrapper sized exactly to the image. */}
        <div
          className="relative inline-block align-top max-w-full"
          style={{
            aspectRatio: `${naturalSize.w} / ${naturalSize.h}`,
            maxHeight: "78vh",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={`${product.name} reference ${ext === "svg" ? "diagram" : "photo"}`}
            className="block w-full h-full object-contain"
            decoding="sync"
            loading="eager"
            fetchPriority="high"
            onLoad={(e) => {
              const i = e.currentTarget;
              if (i.naturalWidth > 0 && i.naturalHeight > 0) {
                setNaturalSize({ w: i.naturalWidth, h: i.naturalHeight });
              }
            }}
          />

          {/* Hotspot dots — SVG fills the wrapper; since the wrapper has the
              photo's aspect ratio, preserveAspectRatio="none" maps the
              natural-pixel viewBox 1:1 onto the visible image. */}
          {partsWithHotspots.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
              viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
              preserveAspectRatio="none"
            >
              {partsWithHotspots.map((p) => {
                const active = selectedId === p.id;
                const hovered = hoveredId === p.id;
                const cx = p.hotspot!.x * naturalSize.w;
                const cy = p.hotspot!.y * naturalSize.h;
                const baseR = Math.max(14, Math.min(naturalSize.w, naturalSize.h) * 0.018);
                const r = active || hovered ? baseR * 1.35 : baseR;
                const n = dotNumber.get(p.id);
                return (
                  <g
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                  >
                    {(active || hovered) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={r + baseR * 0.7}
                        fill={
                          active
                            ? "rgba(255, 176, 115, 0.18)"
                            : "rgba(255, 255, 255, 0.18)"
                        }
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={
                        active
                          ? "#ffb073"
                          : hovered
                          ? "#ffffff"
                          : "rgba(255, 255, 255, 0.92)"
                      }
                      stroke={active ? "#1a1a1a" : "rgba(10, 10, 12, 0.65)"}
                      strokeWidth={Math.max(1.5, baseR * 0.12)}
                    />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={baseR * 1.1}
                      fontWeight={700}
                      fontFamily="ui-monospace, Menlo, Consolas, monospace"
                      fill={active ? "#1a1a1a" : "#0a0a0c"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {n}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        <div className="absolute top-3 left-3 bg-bg/90  px-3 py-1.5 border border-border-custom font-mono text-[10px] text-dim uppercase tracking-widest">
          {partsWithHotspots.length > 0
            ? `${partsWithHotspots.length} of ${product.parts.length} parts pinned on the photo  ·  click any dot`
            : `${product.parts.length} components on the right`}
        </div>

        {credit && (
          <div className="absolute bottom-2 right-2 bg-bg/85  px-2 py-1 font-mono text-[9px] text-dim">
            Photo:{" "}
            <a
              href={credit.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-dim hover:underline"
            >
              {credit.author} · {credit.license}
            </a>
          </div>
        )}
      </div>

      {/* Component list + detail */}
      <aside className="border-t lg:border-t-0 lg:border-l border-border-custom bg-bg flex flex-col min-h-[55vh]">
        <div className="overflow-y-auto p-4 border-b border-border-custom flex-1 lg:flex-none lg:max-h-[45vh]">
          <h3 className="font-mono text-[10px] text-dim uppercase tracking-widest mb-3">
            Components · {product.parts.length}
          </h3>
          <ul className="space-y-0.5">
            {product.parts.map((p) => {
              const n = dotNumber.get(p.id);
              const isActive = selectedId === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full text-left text-[13px] px-2 py-1.5 transition-colors flex items-center gap-2 ${
                      isActive
                        ? "bg-surface text-text"
                        : "text-dim hover:bg-surface hover:text-text"
                    }`}
                  >
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-bold ${
                        n
                          ? isActive
                            ? "bg-accent-amber text-black"
                            : "bg-white/90 text-black"
                          : "bg-transparent border border-border-custom text-dim"
                      }`}
                    >
                      {n ?? "·"}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4 overflow-y-auto flex-1 min-h-[200px]">
          {selected ? (
            <>
              <h4 className="text-text font-semibold mb-2 text-[15px]">
                {selected.name}
              </h4>
              <p className="text-[13px] text-dim leading-relaxed whitespace-pre-wrap">
                {selected.description}
              </p>
              {selected.href && (
                <a
                  href={selected.href}
                  className="mt-3 inline-block text-[11px] font-mono text-accent-blue uppercase tracking-widest hover:underline"
                >
                  Open detail →
                </a>
              )}
            </>
          ) : (
            <p className="text-[13px] text-dim italic">
              Click a numbered dot on the photo, or any component on the list.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
