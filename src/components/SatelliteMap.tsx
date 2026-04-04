"use client";

import { useEffect, useRef, useState } from "react";
import { tileSources } from "@/lib/tiles";

interface SatelliteMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  factoryColor?: string;
}

export default function SatelliteMap({
  lat,
  lng,
  zoom = 15,
  factoryColor = "#3a86ff",
}: SatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [tileIdx, setTileIdx] = useState(1); // start with satellite

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      const tile = L.tileLayer(tileSources[1].url, {
        maxZoom: tileSources[1].maxZoom,
      }).addTo(map);

      // Factory marker
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;inset:0;background:${factoryColor};border-radius:50%;opacity:0.2;animation:pulse-ring 2s infinite;"></div>
            <div style="position:absolute;inset:6px;background:${factoryColor};border-radius:50%;opacity:0.5;"></div>
            <div style="position:absolute;inset:9px;background:${factoryColor};border-radius:50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([lat, lng], { icon }).addTo(map);

      leafletMap.current = map;
      tileLayerRef.current = tile;
    });
  }, [lat, lng, zoom, factoryColor]);

  const cycleTile = () => {
    const nextIdx = (tileIdx + 1) % tileSources.length;
    setTileIdx(nextIdx);

    if (leafletMap.current && tileLayerRef.current) {
      import("leaflet").then((L) => {
        leafletMap.current!.removeLayer(tileLayerRef.current!);
        const newTile = L.tileLayer(tileSources[nextIdx].url, {
          maxZoom: tileSources[nextIdx].maxZoom,
        }).addTo(leafletMap.current!);
        tileLayerRef.current = newTile;
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border-custom">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button
          onClick={cycleTile}
          className="glass-card px-3 py-1.5 text-[0.65rem] font-mono text-text hover:border-accent-red/50 cursor-pointer transition-colors"
        >
          {tileSources[tileIdx].label}
        </button>
        <div className="glass-card px-3 py-1.5 text-[0.55rem] font-mono text-dim">
          {tileSources[tileIdx].source}
        </div>
      </div>
    </div>
  );
}
