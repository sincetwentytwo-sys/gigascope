import type { TileSource } from "@/data/types";

export const tileSources: TileSource[] = [
  {
    name: "DARK MAP",
    label: "Switch to Satellite",
    source: "CartoDB Dark Basemap",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
  },
  {
    name: "ESRI SATELLITE",
    label: "Switch to Sentinel-2",
    source: "ESRI World Imagery (updated ~3-6 months)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
  },
  {
    name: "SENTINEL-2",
    label: "Switch to Dark Map",
    source: "Sentinel-2 Cloudless Mosaic by EOX (annual)",
    url: "https://tiles.maps.eox.at/wmts?layer=s2cloudless-2023_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}",
    maxZoom: 15,
    attribution: "Sentinel-2 cloudless by EOX",
  },
];
