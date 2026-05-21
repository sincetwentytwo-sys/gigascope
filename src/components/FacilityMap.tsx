"use client";

import { useEffect, useRef } from "react";

type Facility = {
  name: string;
  city: string;
  country: string;
  flag?: string;
  lat: number;
  lng: number;
  status: string;
  siteSlug?: string;
};

const STATUS_COLOR: Record<string, string> = {
  operational: "#00875a",
  expanding: "#0066cc",
  construction: "#bf5600",
  announced: "#c4a000",
  planned: "#7b2dbd",
};

export default function FacilityMap({
  facilities,
  height = 320,
}: {
  facilities: Facility[];
  height?: number;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!mapEl.current || mapInstance.current) return;
    if (facilities.length === 0) return;

    import("leaflet").then((LMod) => {
      const L = LMod.default ?? LMod;
      if (!mapEl.current) return;

      // ESRI World Imagery
      const tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

      const map = L.map(mapEl.current, {
        zoomControl: true,
        attributionControl: false,
        worldCopyJump: true,
      });

      L.tileLayer(tileUrl, { maxZoom: 18 }).addTo(map);

      const markers: unknown[] = [];
      const bounds: [number, number][] = [];

      for (const f of facilities) {
        bounds.push([f.lat, f.lng]);
        const color = STATUS_COLOR[f.status] ?? "#86868b";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width: 14px; height: 14px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
            box-shadow: 0 0 0 1.5px ${color}, 0 1px 4px rgba(0,0,0,0.5);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const m = L.marker([f.lat, f.lng], { icon }).addTo(map);
        const linkPart = f.siteSlug
          ? `<a href="/site/${f.siteSlug}" style="color:#0066cc;text-decoration:underline">/site/${f.siteSlug}</a>`
          : "";
        m.bindPopup(
          `<div style="font-family: system-ui; font-size: 12px; min-width: 180px">
            <div style="font-weight:bold">${f.flag ?? ""} ${f.name}</div>
            <div style="color:#86868b">${f.city}, ${f.country}</div>
            <div style="margin-top:4px">
              <span style="
                display:inline-block;
                font-size:10px;
                text-transform:uppercase;
                padding:1px 6px;
                border-radius:3px;
                background:${color}22;
                color:${color};
              ">${f.status}</span>
            </div>
            ${linkPart ? `<div style="margin-top:4px;font-size:11px">${linkPart}</div>` : ""}
          </div>`,
        );
        markers.push(m);
      }

      if (bounds.length === 1) {
        map.setView(bounds[0], 9);
      } else {
        map.fitBounds(bounds as never, { padding: [40, 40] });
      }

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        try {
          (mapInstance.current as { remove: () => void }).remove();
        } catch {}
        mapInstance.current = null;
      }
    };
  }, [facilities]);

  if (facilities.length === 0) return null;

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div className="rounded-lg overflow-hidden border border-border-custom">
        <div ref={mapEl} style={{ width: "100%", height }} />
      </div>
    </>
  );
}
