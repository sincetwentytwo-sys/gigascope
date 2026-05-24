"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductSpec } from "@/data/products";

/**
 * Photo-first product viewer.
 *
 * Layout: reference photo on the left, scrollable component list on the right.
 *
 * Parts that have a `hotspot: {x, y}` get a numbered dot rendered on the photo
 * via an SVG overlay. Clicking either a dot OR a list row surfaces that part's
 * spec blurb in the bottom panel.
 *
 * Two interactions added 2026-05-24:
 *   1. Auto-scroll: when the user clicks a dot, the right-side list scrolls
 *      the matching <li> into view so they don't have to hunt for it.
 *   2. Pinch / wheel / drag zoom: the photo + SVG dots share a CSS transform
 *      wrapper, so zooming the wrapper visually scales BOTH the image AND
 *      the dots in lockstep. Dots stay pinned to the correct part regardless
 *      of zoom level. Resetting (double-click, dedicated button, or product
 *      change) returns to 100% / pan=0.
 */
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

type ViewMode = "exterior" | "cutaway";

export default function Product2DViewer({ product }: { product: ProductSpec }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // EXTERIOR shows the real-world reference photo + `hotspot` dots; CUTAWAY
  // swaps in the cross-section diagram + `cutawayHotspot` dots so users can
  // see internal anatomy (jellyroll, mandrel, etc.) that the surface photo
  // hides. Products without `cutawayImage` skip the tab UI entirely.
  const hasCutaway = !!product.cutawayImage;
  const [mode, setMode] = useState<ViewMode>("exterior");
  // Natural dimensions of the photo — used to size the SVG viewBox AND the
  // wrapper aspect-ratio so dots and image are pixel-aligned. Reset on mode
  // switch because exterior and cutaway images can have different aspects.
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 1000,
    h: 1000,
  });

  // Zoom / pan state. `pan` is a CSS-pixel offset applied to the inner
  // transformed wrapper. The wrapper itself transforms both <img> and
  // the SVG hotspot overlay together.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<
    { x: number; y: number; panX: number; panY: number } | null
  >(null);
  // Pinch (2-touch) state — separate from 1-touch pan
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const touchPanStart = useRef<
    { x: number; y: number; panX: number; panY: number } | null
  >(null);

  const imgRef = useRef<HTMLImageElement>(null);
  // The viewport receives wheel/touch events; the inner wrapper gets the
  // transform. Splitting these so the viewport box is always the wheel
  // target even when the inner content panned offscreen.
  const viewportRef = useRef<HTMLDivElement>(null);
  // <li> refs for auto-scroll
  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  // When the image is already cached, React mounts the <img> *after* the
  // browser fires `load`, so the onLoad handler never runs and aspect-ratio
  // stays at the 1:1 default. Read it eagerly on mount too.
  useEffect(() => {
    const i = imgRef.current;
    if (i && i.complete && i.naturalWidth > 0) {
      setNaturalSize({ w: i.naturalWidth, h: i.naturalHeight });
    }
  }, [product.slug]);

  // Reset zoom / pan / selection when product changes (e.g., user navigates
  // /products/raptor → /products/starship). Also reset mode so each product
  // opens to its exterior shot rather than inheriting the previous tab.
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedId(null);
    setMode("exterior");
  }, [product.slug]);

  // Mode toggle also resets the transform — exterior and cutaway can have
  // different aspect ratios, so any pan from the previous view would be
  // off-target on the new image.
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [mode]);

  // When zoom returns to 100%, auto-reset pan. Otherwise the user has to
  // click the reset button to recenter — painful UX. At 100% the image
  // fills the viewport so pan offset has no meaning anyway.
  useEffect(() => {
    if (zoom <= MIN_ZOOM) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  const selected = product.parts.find((p) => p.id === selectedId) ?? null;
  // In CUTAWAY mode we read `cutawayHotspot` so internal parts get dots; in
  // EXTERIOR mode we read `hotspot` so only externally-visible parts show.
  const partsWithHotspots = product.parts.filter((p) => {
    const h = mode === "cutaway" ? p.cutawayHotspot : p.hotspot;
    return h && typeof h.x === "number";
  });
  // Map part id -> its dot number (1, 2, ...). List rows show this badge too
  // so the eye can jump between photo and list without hunting.
  const dotNumber = new Map<string, number>();
  partsWithHotspots.forEach((p, i) => dotNumber.set(p.id, i + 1));

  // Auto-scroll the selected list item into view. `nearest` avoids scrolling
  // if the item is already visible (less jarring than always centering).
  useEffect(() => {
    if (!selectedId) return;
    const li = liRefs.current.get(selectedId);
    if (li) {
      li.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  // Wheel zoom. React's onWheel is passive:true by default so preventDefault
  // gets ignored — we attach the native listener with passive:false to keep
  // page scroll from competing with viewer zoom.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
      setZoom((z) => clamp(z + delta, MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Mouse drag pan — only meaningful when zoomed in
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [zoom, pan],
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      setPan({
        x: dragStart.current.panX + (e.clientX - dragStart.current.x),
        y: dragStart.current.panY + (e.clientY - dragStart.current.y),
      });
    };
    const onUp = () => {
      setIsDragging(false);
      dragStart.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // Touch: 2-finger pinch zoom, 1-finger pan (when zoomed in)
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const a = e.touches[0];
        const b = e.touches[1];
        pinchStart.current = {
          dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
          zoom,
        };
      } else if (e.touches.length === 1 && zoom > 1) {
        touchPanStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: pan.x,
          panY: pan.y,
        };
      }
    },
    [zoom, pan],
  );

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      e.preventDefault();
      const a = e.touches[0];
      const b = e.touches[1];
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      const ratio = dist / pinchStart.current.dist;
      setZoom(clamp(pinchStart.current.zoom * ratio, MIN_ZOOM, MAX_ZOOM));
    } else if (e.touches.length === 1 && touchPanStart.current) {
      e.preventDefault();
      setPan({
        x:
          touchPanStart.current.panX +
          (e.touches[0].clientX - touchPanStart.current.x),
        y:
          touchPanStart.current.panY +
          (e.touches[0].clientY - touchPanStart.current.y),
      });
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    pinchStart.current = null;
    touchPanStart.current = null;
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Products marked imageType: "svg" (or the legacy 4680) use a schematic
  // diagram; everything else points to a JPG reference photo.
  const ext = product.imageType === "svg" || product.slug === "4680" ? "svg" : "jpg";
  const exteriorSrc = `/products/photos/${product.slug}/main.${ext}`;
  // In cutaway mode swap in the cross-section image; fall back to exterior
  // if `cutawayImage` isn't set (mode toggle is hidden in that case anyway).
  const src =
    mode === "cutaway" && product.cutawayImage
      ? product.cutawayImage.src
      : exteriorSrc;
  const credit = product.photoCredit;
  const hasPanOrZoom = zoom > 1 || pan.x !== 0 || pan.y !== 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] border border-border-custom bg-bg">
      {/* Photo */}
      <div className="relative bg-surface min-h-[55vh] overflow-hidden p-4 text-center">
        <div
          ref={viewportRef}
          // `inline-block + max-w-full` used to size to the SVG's natural
          // width — so a 700x400 cutaway only ever got 700px wide even on
          // a 1200px column, looking cramped. `block + w-full + max-h-78vh`
          // lets each image grow to the column width; modern browsers honor
          // aspect-ratio + max-height together and shrink width when the
          // height clamp fires, so tall portrait images don't overflow.
          className="relative block w-full max-w-full mx-auto align-top"
          style={{
            aspectRatio: `${naturalSize.w} / ${naturalSize.h}`,
            maxHeight: "78vh",
            cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
            touchAction: zoom > 1 ? "none" : "pinch-zoom",
          }}
          onMouseDown={onMouseDown}
          onDoubleClick={resetZoom}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          {/* Inner wrapper gets the transform — both <img> and the SVG
              overlay scale + pan together so dots stay pinned to parts. */}
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
              willChange: "transform",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt={`${product.name} reference ${ext === "svg" ? "diagram" : "photo"}`}
              className="block w-full h-full object-contain select-none pointer-events-none"
              decoding="sync"
              loading="eager"
              fetchPriority="high"
              draggable={false}
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
                  // Pick the correct hotspot for the active mode — filter
                  // above already guarantees the chosen field exists.
                  const h = (mode === "cutaway" ? p.cutawayHotspot : p.hotspot)!;
                  const cx = h.x * naturalSize.w;
                  const cy = h.y * naturalSize.h;
                  const baseR = Math.max(
                    14,
                    Math.min(naturalSize.w, naturalSize.h) * 0.018,
                  );
                  const r = active || hovered ? baseR * 1.35 : baseR;
                  const n = dotNumber.get(p.id);
                  return (
                    <g
                      key={p.id}
                      onClick={(e) => {
                        // stopPropagation so dot click doesn't kick off a pan-drag.
                        e.stopPropagation();
                        setSelectedId(p.id);
                      }}
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
        </div>

        {/* Zoom controls — outside the transformed wrapper so they don't
            scale with the photo. Positioned in the viewport's top-right. */}
        <div className="absolute top-3 right-3 flex items-center gap-0 bg-bg/90 border border-border-custom font-mono text-[12px] select-none">
          <button
            type="button"
            onClick={() =>
              setZoom((z) => clamp(z - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
            }
            disabled={zoom <= MIN_ZOOM}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed text-text"
            aria-label="Zoom out"
            title="Zoom out (wheel)"
          >
            −
          </button>
          <span className="px-2 text-dim tabular-nums w-12 text-center text-[11px]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoom((z) => clamp(z + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM))
            }
            disabled={zoom >= MAX_ZOOM}
            className="w-8 h-8 flex items-center justify-center hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed text-text"
            aria-label="Zoom in"
            title="Zoom in (wheel)"
          >
            +
          </button>
          {hasPanOrZoom && (
            <button
              type="button"
              onClick={resetZoom}
              className="px-2 h-8 text-dim hover:bg-surface uppercase tracking-wider text-[9px] border-l border-border-custom"
              aria-label="Reset zoom and pan"
              title="Reset (double-click photo)"
            >
              reset
            </button>
          )}
        </div>

        {/* EXTERIOR / CUTAWAY tab toggle — only shown for products that
            ship a cross-section image. Anchored top-left above the dot
            count so the two read as a header. */}
        {hasCutaway && (
          <div className="absolute top-3 left-3 flex bg-bg/95 border border-border-custom font-mono text-[10px] uppercase tracking-widest select-none">
            <button
              type="button"
              onClick={() => setMode("exterior")}
              className={`px-3 h-7 transition-colors ${
                mode === "exterior"
                  ? "bg-text text-bg"
                  : "text-dim hover:text-text"
              }`}
              aria-pressed={mode === "exterior"}
            >
              Exterior
            </button>
            <button
              type="button"
              onClick={() => setMode("cutaway")}
              className={`px-3 h-7 border-l border-border-custom transition-colors ${
                mode === "cutaway"
                  ? "bg-text text-bg"
                  : "text-dim hover:text-text"
              }`}
              aria-pressed={mode === "cutaway"}
            >
              Cutaway
            </button>
          </div>
        )}

        <div
          className={`absolute left-3 bg-bg/90 px-3 py-1.5 border border-border-custom font-mono text-[10px] text-dim uppercase tracking-widest ${
            hasCutaway ? "top-12" : "top-3"
          }`}
        >
          {partsWithHotspots.length > 0
            ? `${partsWithHotspots.length} of ${product.parts.length} parts pinned${mode === "cutaway" ? " on cutaway" : " on the photo"}  ·  click any dot`
            : `${product.parts.length} components on the right`}
        </div>

        {/* In cutaway mode show the cutaway-image credit instead of the
            exterior photo credit. Both are tiny and live in the same slot. */}
        {mode === "cutaway" && product.cutawayImage && (
          <div className="absolute bottom-2 right-2 bg-bg/85  px-2 py-1 font-mono text-[9px] text-dim">
            Cutaway:{" "}
            <a
              href={product.cutawayImage.credit.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-dim hover:underline"
            >
              {product.cutawayImage.credit.source}
            </a>{" "}
            · {product.cutawayImage.credit.license}
          </div>
        )}
        {mode === "exterior" && credit && (
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
        {mode === "exterior" && !credit && product.mainCredit && (
          <div className="absolute bottom-2 right-2 bg-bg/85  px-2 py-1 font-mono text-[9px] text-dim">
            Image:{" "}
            <a
              href={product.mainCredit.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-dim hover:underline"
            >
              {product.mainCredit.source}
            </a>{" "}
            · {product.mainCredit.license}
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
                <li
                  key={p.id}
                  ref={(el) => {
                    // Map<id, element> for the auto-scroll-into-view effect
                    if (el) liRefs.current.set(p.id, el);
                    else liRefs.current.delete(p.id);
                  }}
                >
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

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
