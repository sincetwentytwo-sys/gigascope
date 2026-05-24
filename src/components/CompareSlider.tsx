"use client";

import { useEffect, useRef, useState } from "react";
import { factories, getSitesByCompany } from "@/data/factories";
import { getCompanyMeta } from "@/data/companies";
import { tileSources } from "@/lib/tiles";
import type { Company, Factory } from "@/data/types";

const ESRI_URL = tileSources[1].url;
// Left feed locks to 2019 EOX cloudless mosaic so before/after is dramatic
// for the post-2019 buildouts (Giga Texas, Berlin, Starbase, Memphis, Boring LV).
// Don't read from tileSources — SatelliteMap cycles through that and wants latest.
const SENTINEL_URL =
  "https://tiles.maps.eox.at/wmts?layer=s2cloudless-2019_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}";

const COMPANY_ORDER: Company[] = ["joint", "tesla", "spacex", "xai", "neuralink", "boring"];

export default function CompareSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const leftMapRef = useRef<HTMLDivElement>(null);
  const rightMapRef = useRef<HTMLDivElement>(null);
  const leftMap = useRef<L.Map | null>(null);
  const rightMap = useRef<L.Map | null>(null);
  // Pulsing cyan markers anchored to the selected site's exact lat/lng.
  // Without these the user can't tell which building in the photo is the
  // actual Tesla/SpaceX site (esp. for greenfield sites like Giga Mexico
  // where the surrounding area looks identical to the building plot).
  const leftMarker = useRef<L.Marker | null>(null);
  const rightMarker = useRef<L.Marker | null>(null);
  const dragging = useRef(false);
  const syncing = useRef(false);
  const selectedRef = useRef<Factory>(factories[0]);
  const [selectedId, setSelectedId] = useState(factories[0].id);

  const updateSlider = (clientX: number) => {
    if (!containerRef.current || !sliderRef.current || !lineRef.current || !leftMapRef.current || !rightMapRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    sliderRef.current.style.left = `${pct}%`;
    lineRef.current.style.left = `${pct}%`;
    leftMapRef.current.style.width = `${pct}%`;
    rightMapRef.current.style.left = `${pct}%`;
    rightMapRef.current.style.width = `${100 - pct}%`;
    leftMap.current?.invalidateSize();
    rightMap.current?.invalidateSize();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updateSlider(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current) return;
      // preventDefault() blocks the page from scrolling while the user is
      // dragging the compare slider. Requires passive: false below.
      e.preventDefault();
      updateSlider(e.touches[0].clientX);
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    // passive: false so onTouch can call preventDefault() and stop page scroll
    // from competing with the slider drag gesture on mobile.
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  function syncMaps(source: L.Map, target: L.Map) {
    if (syncing.current) return;
    syncing.current = true;
    target.setView(source.getCenter(), source.getZoom(), { animate: false });
    syncing.current = false;
  }

  useEffect(() => {
    if (!leftMapRef.current || !rightMapRef.current || leftMap.current) return;

    import("leaflet").then((L) => {
      if (!leftMapRef.current || !rightMapRef.current) return;
      const center: [number, number] = [selectedRef.current.lat, selectedRef.current.lng];

      const lMap = L.map(leftMapRef.current, {
        center,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      // Sentinel-2 native tiles cap at zoom 15. Previously we capped maxZoom
      // at 15 too, which left the left feed BLANK whenever the user zoomed
      // past 15 to see ESRI detail. Now Leaflet up-scales the zoom-15 tile
      // for zoom 16-19 (gets pixelated, but at least the imagery is visible
      // and the before/after comparison stays meaningful).
      L.tileLayer(SENTINEL_URL, { maxZoom: 19, maxNativeZoom: 15 }).addTo(lMap);

      const rMap = L.map(rightMapRef.current, {
        center,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer(ESRI_URL, { maxZoom: 19 }).addTo(rMap);

      // Pulsing cyan marker at site's exact coordinates. Same icon on both
      // maps so the dot lines up across the slider divider — visually
      // confirms "the building under this ping is the site." Uses the
      // pulse-ring keyframe defined in globals.css.
      const pingIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:36px;height:36px;pointer-events:none;">
            <div style="position:absolute;inset:0;border:2px solid #00d4ff;border-radius:50%;animation:pulse-ring 2s infinite;"></div>
            <div style="position:absolute;inset:10px;background:#00d4ff;border-radius:50%;opacity:0.65;box-shadow:0 0 12px rgba(0,212,255,0.9);"></div>
            <div style="position:absolute;inset:15px;background:#ffffff;border:1.5px solid #00d4ff;border-radius:50%;box-shadow:0 0 8px rgba(0,212,255,1);"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      leftMarker.current = L.marker(center, { icon: pingIcon, interactive: false }).addTo(lMap);
      rightMarker.current = L.marker(center, { icon: pingIcon, interactive: false }).addTo(rMap);

      lMap.on("move", () => syncMaps(lMap, rMap));
      rMap.on("move", () => syncMaps(rMap, lMap));
      lMap.on("zoom", () => syncMaps(lMap, rMap));
      rMap.on("zoom", () => syncMaps(rMap, lMap));

      leftMap.current = lMap;
      rightMap.current = rMap;
    });
  }, []);

  const selectFactory = (f: Factory) => {
    selectedRef.current = f;
    setSelectedId(f.id);
    const center: [number, number] = [f.lat, f.lng];
    // Move the ping markers to the new site BEFORE flyTo so they're in
    // position when the user lands. setLatLng is instant (no animation).
    leftMarker.current?.setLatLng(center);
    rightMarker.current?.setLatLng(center);
    leftMap.current?.flyTo(center, 14, { duration: 1 });
    rightMap.current?.flyTo(center, 14, { duration: 1 });
  };

  const zoom = (delta: number) => {
    const z = (leftMap.current?.getZoom() ?? 14) + delta;
    leftMap.current?.setZoom(z);
    rightMap.current?.setZoom(z);
  };

  const recenter = () => {
    const center: [number, number] = [selectedRef.current.lat, selectedRef.current.lng];
    leftMap.current?.setView(center, 14);
    rightMap.current?.setView(center, 14);
  };

  const selected = selectedRef.current;
  const lngLabel = `${Math.abs(selected.lng).toFixed(4)}° ${selected.lng >= 0 ? "E" : "W"}`;
  const latLabel = `${Math.abs(selected.lat).toFixed(4)}° ${selected.lat >= 0 ? "N" : "S"}`;

  return (
    <div className="flex flex-col gap-5 ">
      {/* Factory selector grouped by company */}
      <div className="border border-border-custom bg-surface p-3 sm:p-4 relative">
        <span className="absolute -top-2 left-3 px-2 bg-bg text-[10px] font-mono uppercase tracking-[0.2em] text-dim">
          Target Selector
        </span>
        <div className="flex flex-col gap-3">
          {COMPANY_ORDER.map((companyId) => {
            const sites = getSitesByCompany(companyId);
            if (sites.length === 0) return null;
            const meta = getCompanyMeta(companyId);
            return (
              <div key={companyId} className="flex items-start gap-2 sm:gap-3 flex-wrap">
                <span
                  className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-2 py-1 border"
                  style={{ borderColor: meta.color, color: meta.color }}
                >
                  {meta.icon} {meta.name}
                </span>
                <div role="group" aria-label={`${meta.name} sites`} className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {sites.map((f) => {
                    const active = selectedId === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => selectFactory(f)}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider border transition-all duration-150 ${
                          active
                            ? "bg-text text-bg border-text "
                            : "bg-transparent text-dim border-border-custom hover:bg-surface hover:text-text"
                        }`}
                      >
                        {f.flag} {f.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Viewer canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden border border-border-custom bg-surface select-none "
        style={{ height: "clamp(420px, calc(100vh - 280px), 720px)" }}
      >
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

        {/* Scanline overlay */}
        <div
          className="absolute inset-x-0 top-0 z-[20] pointer-events-none h-24"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,212,255,0.05) 50%, transparent 100%)" }}
        />

        {/* Grid dots overlay */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(0,212,255,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        {/* Left map — Sentinel-2 */}
        <div ref={leftMapRef} className="absolute top-0 bottom-0 left-0 z-[1]" style={{ width: "50%" }} />

        {/* Right map — ESRI */}
        <div ref={rightMapRef} className="absolute top-0 bottom-0 z-[1]" style={{ left: "50%", width: "50%" }} />

        {/* Divider line */}
        <div
          ref={lineRef}
          className="absolute top-0 bottom-0 z-[1000] w-px bg-text pointer-events-none"
          style={{ left: "50%", boxShadow: "0 0 8px rgba(0,0,0,0.2)" }}
        />

        {/* Slider handle */}
        <div
          ref={sliderRef}
          className="absolute top-0 bottom-0 z-[1001] cursor-ew-resize"
          style={{ left: "50%", transform: "translateX(-50%)", width: "56px" }}
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-text bg-bg/80 backdrop-blur-lg flex items-center justify-center ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 3 12 9 6" transform="translate(12 0)" />
            </svg>
          </div>
        </div>

        {/* Left label */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000]">
          <div className="bg-surface border-l-2 border-text px-2 py-1 sm:px-3 sm:py-2 ">
            <h3 className="font-mono text-[9px] sm:text-[11px] text-text font-bold uppercase tracking-wider"><span className="sm:hidden">2019 BASELINE</span><span className="hidden sm:inline">SENTINEL-2 — 2019 BASELINE</span></h3>
            <p className="hidden sm:block font-mono text-[9px] text-text/40 mt-0.5 uppercase tracking-tighter">SOURCE: ESA / EOX CLOUDLESS MOSAIC</p>
          </div>
        </div>

        {/* Right label */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000] text-right">
          <div className="bg-surface border-r-2 border-text px-2 py-1 sm:px-3 sm:py-2 ">
            <h3 className="font-mono text-[9px] sm:text-[11px] text-text font-bold uppercase tracking-wider"><span className="sm:hidden">ESRI</span><span className="hidden sm:inline">ESRI — LATEST (~3-6 MO)</span></h3>
            <p className="hidden sm:block font-mono text-[9px] text-text/40 mt-0.5 uppercase tracking-tighter">REF: WORLD IMAGERY SERVICE</p>
          </div>
        </div>

        {/* HUD action buttons */}
        <div className="absolute bottom-20 right-2 sm:bottom-16 sm:right-4 z-[1002] flex flex-col gap-2">
          <button
            onClick={() => zoom(1)}
            aria-label="Zoom in"
            className="w-11 h-11 sm:w-9 sm:h-9 bg-bg/80 border border-border-custom text-text hover:bg-surface flex items-center justify-center  transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button
            onClick={() => zoom(-1)}
            aria-label="Zoom out"
            className="w-11 h-11 sm:w-9 sm:h-9 bg-bg/80 border border-border-custom text-text hover:bg-surface flex items-center justify-center  transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button
            onClick={recenter}
            aria-label="Recenter"
            className="w-11 h-11 sm:w-9 sm:h-9 bg-bg/80 border border-border-custom text-text hover:bg-surface flex items-center justify-center  transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>
          </button>
        </div>

        {/* Site progress card (top right) */}
        <div className="hidden md:flex absolute top-4 right-[14rem] z-[1000] w-48 h-20 border border-border-custom p-2 flex-col gap-1 bg-bg/80 backdrop-blur-sm">
          <div className="text-[10px] text-dim flex justify-between">
            <span>Site</span>
            <span className="text-text">{selected.slug}</span>
          </div>
          <div className="h-1 bg-surface w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-text" style={{ width: `${selected.progress}%` }} />
          </div>
          <div className="text-[10px] text-dim flex justify-between mt-auto">
            <span>Built</span>
            <span className="text-text">{selected.progress}%</span>
          </div>
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-bg/90 border-t border-border-custom  px-2 py-2 sm:px-4 flex justify-between items-center gap-2 font-mono text-[9px] sm:text-[10px] text-text uppercase tracking-wider">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="text-text font-bold truncate">{selected.flag} {selected.name}</span>
            <span className="hidden sm:inline text-dim">{selected.location}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-dim flex-shrink-0">
            <span className="hidden md:inline">LAT: <span className="text-text font-bold">{latLabel}</span></span>
            <span className="hidden md:inline">LON: <span className="text-text font-bold">{lngLabel}</span></span>
            <span>STATUS: <span className="text-text font-bold">{selected.status.toUpperCase()}</span></span>
          </div>
        </div>
      </div>

      {/* Footer info strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
        <div className="border border-border-custom bg-surface p-3">
          <div className="text-dim uppercase text-[9px] tracking-[0.2em] mb-1">LEFT FEED · BASELINE</div>
          <div className="text-text/80">SENTINEL-2 — 2019 cloudless mosaic (10m). Pre-buildout reference for Giga Texas, Berlin, Starbase, Memphis, Boring LV.</div>
        </div>
        <div className="border border-border-custom bg-surface p-3">
          <div className="text-dim uppercase text-[9px] tracking-[0.2em] mb-1">RIGHT FEED</div>
          <div className="text-text/80">ESRI — high-res imagery (sub-meter, updated ~3-6 months)</div>
        </div>
      </div>
    </div>
  );
}
