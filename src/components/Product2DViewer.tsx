"use client";

import { useState } from "react";
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
  // Natural dimensions of the photo — used to size the SVG viewBox so the
  // dots land on the photo (not the surrounding container).
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 1000,
    h: 1000,
  });
  const selected = product.parts.find((p) => p.id === selectedId) ?? null;
  const partsWithHotspots = product.parts.filter(
    (p) => p.hotspot && typeof p.hotspot.x === "number",
  );
  // Map part id -> its dot number (1, 2, ...). List rows show this badge too
  // so the eye can jump between photo and list without hunting.
  const dotNumber = new Map<string, number>();
  partsWithHotspots.forEach((p, i) => dotNumber.set(p.id, i + 1));

  // 4680 has only an SVG diagram available; everything else is a JPG photo.
  const ext = product.slug === "4680" ? "svg" : "jpg";
  const src = `/products/photos/${product.slug}/main.${ext}`;
  const credit = product.photoCredit;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] border border-[#343538] bg-[#0a0a0c]">
      {/* Photo */}
      <div className="relative bg-[#f4f4f0] min-h-[55vh] flex items-center justify-center overflow-hidden p-4">
        {/* Wrapper has the photo's exact aspect ratio, capped by max-h:78vh
            and max-w:100%. img + SVG both fill the wrapper at 100%/100%, so
            they are pixel-aligned. Dot coords (0..1) map straight to the
            SVG's viewBox (naturalW x naturalH) without aspect padding. */}
        <div
          className="relative max-w-full"
          style={{
            aspectRatio: `${naturalSize.w} / ${naturalSize.h}`,
            maxHeight: "78vh",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
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

        <div className="absolute top-3 left-3 bg-[#121316]/90 backdrop-blur-md px-3 py-1.5 border border-[#343538] font-mono text-[10px] text-[#b7c8e1] uppercase tracking-widest">
          {partsWithHotspots.length > 0
            ? `${partsWithHotspots.length} of ${product.parts.length} parts pinned on the photo  ·  click any dot`
            : `${product.parts.length} components on the right`}
        </div>

        {credit && (
          <div className="absolute bottom-2 right-2 bg-[#121316]/85 backdrop-blur-md px-2 py-1 font-mono text-[9px] text-[#8292aa]">
            Photo:{" "}
            <a
              href={credit.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[#b7c8e1] hover:underline"
            >
              {credit.author} · {credit.license}
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
                        ? "bg-[#1f1f23] text-white"
                        : "text-[#b7c8e1] hover:bg-[#1a1d22] hover:text-white"
                    }`}
                  >
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full font-mono text-[10px] font-bold ${
                        n
                          ? isActive
                            ? "bg-[#ffb073] text-black"
                            : "bg-white/90 text-black"
                          : "bg-transparent border border-[#343538] text-[#5a6e8f]"
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
              Click a numbered dot on the photo, or any component on the list.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
