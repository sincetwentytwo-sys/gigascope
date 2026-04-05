"use client";

import { useEffect, useRef, useState } from "react";
import { factories } from "@/data/factories";
import type { Factory } from "@/data/types";

const ESRI_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SENTINEL_URL = "https://tiles.maps.eox.at/wmts?layer=s2cloudless-2023_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}";

export default function CompareSlider() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Factory>(factories[0]);
  const [sliderPos, setSliderPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const leafletMap = useRef<L.Map | null>(null);
  const leftLayer = useRef<L.TileLayer | null>(null);
  const rightLayer = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [selected.lat, selected.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });

      const right = L.tileLayer(ESRI_URL, { maxZoom: 19 }).addTo(map);
      const left = L.tileLayer(SENTINEL_URL, { maxZoom: 15 }).addTo(map);

      leafletMap.current = map;
      leftLayer.current = left;
      rightLayer.current = right;
    });
  }, []);

  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([selected.lat, selected.lng], 14, { duration: 1 });
    }
  }, [selected]);

  useEffect(() => {
    if (!leftLayer.current) return;
    const container = leftLayer.current.getContainer();
    if (container) {
      container.style.clipPath = `inset(0 ${100 - sliderPos}% 0 0)`;
    }
  }, [sliderPos]);

  const handleMove = (clientX: number) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(2, Math.min(98, x)));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Factory Selector */}
      <div role="group" aria-label="Factory selector" className="flex gap-2 flex-wrap">
        {factories.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelected(f)}
            className={`px-3 py-1.5 text-xs font-mono transition-colors ${
              selected.id === f.id
                ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                : "border border-white/8 text-dim hover:text-text hover:border-white/15"
            }`}
          >
            {f.flag} {f.name.replace("\u26a1 ", "")}
          </button>
        ))}
      </div>

      {/* Compare Map */}
      <div
        className="relative overflow-hidden border border-white/10"
        style={{ height: "clamp(350px, calc(100vh - 280px), 700px)" }}
      >
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />

        <div
          ref={mapRef}
          className="w-full h-full"
          onMouseMove={(e) => dragging && handleMove(e.clientX)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchMove={(e) => dragging && handleMove(e.touches[0].clientX)}
          onTouchEnd={() => setDragging(false)}
        />

        {/* Slider divider */}
        <div
          className="absolute top-0 bottom-0 z-[1000] cursor-col-resize"
          style={{
            left: `${sliderPos}%`,
            transform: "translateX(-50%)",
            width: "40px",
          }}
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setSliderPos((p) => Math.max(2, p - 2));
            if (e.key === "ArrowRight") setSliderPos((p) => Math.min(98, p + 2));
          }}
          role="slider"
          aria-label="Compare slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sliderPos)}
          tabIndex={0}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/60" />
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-8 h-8 border border-white/40 flex items-center justify-center bg-bg/90 cursor-ew-resize">
            <span className="text-white/60 text-xs font-mono">&harr;</span>
          </div>
        </div>

        {/* Source Labels */}
        <div className="absolute top-3 left-3 z-[1000] bg-black/80 px-2.5 py-1.5">
          <span className="font-mono text-[10px] sm:text-xs text-white/80 font-medium">
            Sentinel-2 &middot; 2023
          </span>
        </div>
        <div className="absolute top-3 right-3 z-[1000] bg-black/80 px-2.5 py-1.5">
          <span className="font-mono text-[10px] sm:text-xs text-white/80 font-medium">
            ESRI &middot; Latest
          </span>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-bg/90 border-t border-white/10 px-3 py-1.5 flex justify-between items-center font-mono text-[10px] text-dim">
          <span>
            {selected.flag} {selected.name.replace("\u26a1 ", "")} &middot; {selected.location}
          </span>
          <span className="hidden sm:inline">
            {selected.lat.toFixed(4)}&deg;N, {selected.lng.toFixed(4)}&deg;W
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="font-mono text-[9px] text-dim">
        Imagery is not real-time. Sentinel-2: annual cloudless composite (2023). ESRI: updated ~3-6 months.
      </p>
    </div>
  );
}
