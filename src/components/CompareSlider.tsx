"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { factories } from "@/data/factories";
import { tileSources } from "@/lib/tiles";
import type { Factory } from "@/data/types";

const ESRI_URL = tileSources[1].url;
const SENTINEL_URL = tileSources[2].url;

export default function CompareSlider() {
  const mapRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const leftLayer = useRef<L.TileLayer | null>(null);
  const selectedRef = useRef<Factory>(factories[0]);
  const dragging = useRef(false);
  const [selectedId, setSelectedId] = useState(factories[0].id);

  const updateSlider = useCallback((clientX: number) => {
    if (!mapRef.current || !sliderRef.current || !lineRef.current || !leftLayer.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    sliderRef.current.style.left = `${pct}%`;
    lineRef.current.style.left = `${pct}%`;
    const container = leftLayer.current.getContainer();
    if (container) container.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateSlider(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current) return;
      updateSlider(e.touches[0].clientX);
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateSlider]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      const map = L.map(mapRef.current, {
        center: [selectedRef.current.lat, selectedRef.current.lng],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer(ESRI_URL, { maxZoom: 19 }).addTo(map);
      const left = L.tileLayer(SENTINEL_URL, { maxZoom: 15 }).addTo(map);
      setTimeout(() => {
        const c = left.getContainer();
        if (c) c.style.clipPath = "inset(0 50% 0 0)";
      }, 500);
      leafletMap.current = map;
      leftLayer.current = left;
    });
  }, []);

  const selectFactory = (f: Factory) => {
    selectedRef.current = f;
    setSelectedId(f.id);
    if (leafletMap.current) leafletMap.current.flyTo([f.lat, f.lng], 16, { duration: 1 });
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="Factory selector" className="flex gap-2 flex-wrap">
        {factories.map((f) => (
          <button
            key={f.id}
            onClick={() => selectFactory(f)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              selectedId === f.id
                ? "bg-text text-bg"
                : "border border-border-custom text-dim hover:text-text"
            }`}
          >
            {f.flag} {f.name}
          </button>
        ))}
      </div>

      <div
        className="relative overflow-hidden rounded-xl border border-border-custom select-none"
        style={{ height: "clamp(400px, calc(100vh - 250px), 700px)" }}
      >
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div ref={mapRef} className="w-full h-full" />

        <div ref={lineRef} className="absolute top-0 bottom-0 z-[1000] w-0.5 bg-white pointer-events-none" style={{ left: "50%", boxShadow: "0 0 8px rgba(0,0,0,0.4)" }} />

        <div
          ref={sliderRef}
          className="absolute top-0 bottom-0 z-[1001] cursor-col-resize"
          style={{ left: "50%", transform: "translateX(-50%)", width: "44px" }}
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-border-custom flex items-center justify-center shadow-lg">
            <span className="text-dim text-sm">&harr;</span>
          </div>
        </div>

        <div className="absolute top-3 left-3 z-[1000] bg-black/70 rounded-lg px-3 py-1.5">
          <span className="text-xs text-white font-medium">Sentinel-2 &middot; 2023</span>
        </div>
        <div className="absolute top-3 right-3 z-[1000] bg-black/70 rounded-lg px-3 py-1.5">
          <span className="text-xs text-white font-medium">ESRI &middot; Latest</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white/90 border-t border-border-custom px-4 py-2 flex justify-between items-center text-xs text-dim">
          <span>{selectedRef.current.flag} {selectedRef.current.name} &middot; {selectedRef.current.location}</span>
          <span className="hidden sm:inline">{selectedRef.current.lat.toFixed(4)}°N, {selectedRef.current.lng.toFixed(4)}°W</span>
        </div>
      </div>

      <div className="text-sm text-dim">
        <p><strong>Left:</strong> Sentinel-2 — annual composite from 2023 (natural colors, slightly soft)</p>
        <p><strong>Right:</strong> ESRI — latest high-res imagery (sharper, updated every ~3-6 months)</p>
        <p className="mt-1 text-xs">Drag the slider to compare. Zoom in to see construction changes.</p>
      </div>
    </div>
  );
}
