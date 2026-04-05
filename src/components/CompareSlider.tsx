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
        <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">
          SELECT TARGET
        </span>
        <div className="flex gap-2 flex-wrap">
          {factories.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className={`px-3 py-1.5 text-xs font-mono transition-all ${
                selected.id === f.id
                  ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40"
                  : "border border-white/5 bg-[#0f1117]/60 text-dim hover:text-text hover:border-white/20"
              }`}
            >
              {f.flag} {f.name.replace("⚡ ", "")}
            </button>
          ))}
        </div>
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

        {/* Grid dots overlay */}
        <div
          className="absolute inset-0 z-[999] pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
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

        {/* Slider divider line */}
        <div
          className="absolute top-0 bottom-0 z-[1000] cursor-col-resize"
          style={{
            left: `${sliderPos}%`,
            transform: "translateX(-50%)",
            width: "40px",
          }}
          onMouseDown={() => setDragging(true)}
          onTouchStart={() => setDragging(true)}
        >
          {/* Glowing line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-accent-cyan shadow-[0_0_15px_#00d4ff]" />
          {/* Drag handle */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 border border-accent-cyan flex items-center justify-center bg-bg/80 backdrop-blur-lg cursor-ew-resize">
            <span className="text-accent-cyan text-xs font-mono">&harr;</span>
          </div>
        </div>

        {/* Source Labels */}
        <div className="absolute top-3 left-3 z-[1000] bg-black/60 border-l-2 border-accent-cyan p-2 sm:p-2.5 backdrop-blur-md max-w-[45%]">
          <h3 className="font-mono text-[10px] sm:text-xs text-accent-cyan font-bold">
            SENTINEL-2 &mdash; 2023
          </h3>
          <p className="font-mono text-[8px] sm:text-[10px] text-white/40 mt-0.5 uppercase tracking-tighter hidden sm:block">
            SOURCE: ESA / COPERNICUS
          </p>
        </div>
        <div className="absolute top-3 right-3 z-[1000] bg-black/60 border-r-2 border-accent-cyan p-2 sm:p-2.5 backdrop-blur-md text-right max-w-[45%]">
          <h3 className="font-mono text-[10px] sm:text-xs text-accent-cyan font-bold">
            ESRI &mdash; Latest
          </h3>
          <p className="font-mono text-[8px] sm:text-[10px] text-white/40 mt-0.5 uppercase tracking-tighter hidden sm:block">
            WORLD IMAGERY SERVICE
          </p>
        </div>

        {/* Corner brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-accent-cyan/40 z-[999] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-accent-cyan/40 z-[999] pointer-events-none" />
        <div className="absolute bottom-14 left-2 w-4 h-4 border-b border-l border-accent-cyan/40 z-[999] pointer-events-none" />
        <div className="absolute bottom-14 right-2 w-4 h-4 border-b border-r border-accent-cyan/40 z-[999] pointer-events-none" />

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-bg/90 backdrop-blur-md border-t border-accent-cyan/20 px-3 sm:px-4 py-2 flex justify-between items-center font-mono text-[10px] uppercase">
          <div className="flex gap-3 sm:gap-6">
            <div className="flex flex-col">
              <span className="text-accent-cyan/50 text-[8px]">FACTORY</span>
              <span className="text-accent-cyan font-bold truncate max-w-[120px] sm:max-w-none">
                {selected.flag} {selected.name.replace("⚡ ", "")}
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-accent-cyan/50 text-[8px]">LOCATION</span>
              <span className="text-accent-cyan font-bold">
                {selected.location}
              </span>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6">
            <div className="flex flex-col items-end">
              <span className="text-accent-cyan/50 text-[8px]">LAT</span>
              <span className="text-accent-cyan font-bold">
                {selected.lat.toFixed(4)}&deg;
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-accent-cyan/50 text-[8px]">LON</span>
              <span className="text-accent-cyan font-bold">
                {selected.lng.toFixed(4)}&deg;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="border border-accent-amber/20 bg-accent-amber/5 px-4 py-3 flex items-center gap-3">
        <span className="text-accent-amber text-sm">&#9888;</span>
        <span className="font-mono text-[9px] text-dim">
          Imagery is NOT real-time. Sentinel-2: annual cloudless composite
          (2023). ESRI: updated every ~3-6 months. For live data, a Copernicus
          account is required.
        </span>
      </div>
    </div>
  );
}
