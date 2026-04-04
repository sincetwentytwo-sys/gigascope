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

  // Initialize map
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

      // Right layer (ESRI - full)
      const right = L.tileLayer(ESRI_URL, { maxZoom: 19 }).addTo(map);
      // Left layer (Sentinel - full, will be clipped by CSS)
      const left = L.tileLayer(SENTINEL_URL, { maxZoom: 15 }).addTo(map);

      leafletMap.current = map;
      leftLayer.current = left;
      rightLayer.current = right;
    });
  }, []);

  // Update map center when factory changes
  useEffect(() => {
    if (leafletMap.current) {
      leafletMap.current.flyTo([selected.lat, selected.lng], 14, { duration: 1 });
    }
  }, [selected]);

  // Clip left layer based on slider position
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
    <div className="flex flex-col gap-6">
      {/* Factory Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">SELECT TARGET</span>
        <div className="flex gap-2 flex-wrap">
          {factories.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
                selected.id === f.id
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                  : "glass-card text-dim hover:text-text"
              }`}
            >
              {f.flag} {f.name.replace("⚡ ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Compare Map */}
      <div className="relative rounded-xl overflow-hidden border border-border-custom" style={{ height: "500px" }}>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <div
          ref={mapRef}
          className="w-full h-full"
          onMouseMove={(e) => dragging && handleMove(e.clientX)}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchMove={(e) => dragging && handleMove(e.touches[0].clientX)}
          onTouchEnd={() => setDragging(false)}
        />

        {/* Slider divider line */}
        <div
          className="absolute top-0 bottom-0 z-[1000] cursor-col-resize"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)", width: "40px" }}
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)}
        >
          {/* Glowing line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-accent-cyan shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          {/* Drag handle */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface/90 border-2 border-accent-cyan flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] backdrop-blur-sm">
            <span className="text-accent-cyan text-xs font-mono">⟨ ⟩</span>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-[1000] glass-card px-3 py-1.5">
          <span className="font-mono text-[9px] text-accent-amber tracking-wider">SENTINEL-2 · 2023</span>
        </div>
        <div className="absolute top-3 right-3 z-[1000] glass-card px-3 py-1.5">
          <span className="font-mono text-[9px] text-accent-cyan tracking-wider">ESRI · LATEST</span>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-surface/80 backdrop-blur-md border-t border-border-custom px-4 py-2 flex justify-between items-center">
          <span className="font-mono text-[9px] text-dim">
            {selected.flag} {selected.name.replace("⚡ ", "")} · {selected.location}
          </span>
          <span className="font-mono text-[9px] text-accent-cyan">
            LAT {selected.lat.toFixed(4)}° · LON {selected.lng.toFixed(4)}°
          </span>
        </div>
      </div>

      {/* Warning */}
      <div className="glass-card px-4 py-3 flex items-center gap-3">
        <span className="text-accent-amber text-sm">⚠</span>
        <span className="font-mono text-[9px] text-dim">
          Imagery is NOT real-time. Sentinel-2: annual cloudless composite (2023). ESRI: updated every ~3-6 months.
          For live data, a Copernicus account is required.
        </span>
      </div>
    </div>
  );
}
