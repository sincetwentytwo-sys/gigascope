import type { TileSource } from "@/data/types";

// Tile-provider attribution. Required by:
// - Esri World Imagery Terms of Use (cite Esri + the underlying data partners).
// - Copernicus / EOX cloudless mosaic license (CC BY-NC-SA for the EOX
//   derivative; "Maps powered by EOX IT Services GmbH" + Copernicus credit).
// - CartoDB / OpenStreetMap (CC-BY for CARTO basemaps; ODbL for OSM data).
//
// Leaflet renders the `attribution` string in the bottom-right of the map
// when `attributionControl: true`. SatelliteMap + CompareSlider both
// enable it and pass these strings through.
export const tileSources: TileSource[] = [
  {
    name: "DARK MAP",
    label: "Switch to Satellite",
    source: "CartoDB Dark Basemap",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    maxZoom: 19,
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors · © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
  },
  {
    name: "ESRI SATELLITE",
    label: "Switch to Sentinel-2",
    source: "ESRI World Imagery (updated ~3-6 months)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    attribution:
      'Imagery © <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community',
  },
  {
    name: "SENTINEL-2",
    label: "Switch to Dark Map",
    // EOX_SENTINEL2_YEAR: bump this string + the methodology page (refresh row)
    // once a year when EOX publishes the next cloudless mosaic.
    source: "Sentinel-2 Cloudless Mosaic by EOX (annual, currently 2024)",
    url: "https://tiles.maps.eox.at/wmts?layer=s2cloudless-2024_3857&style=default&tilematrixset=GoogleMapsCompatible&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/jpeg&TileMatrix={z}&TileCol={x}&TileRow={y}",
    maxZoom: 15,
    attribution:
      'Sentinel-2 cloudless 2024 by <a href="https://s2maps.eu" target="_blank" rel="noopener">EOX IT Services GmbH</a> · Contains modified <a href="https://sentinel.esa.int" target="_blank" rel="noopener">Copernicus Sentinel data</a> 2024 · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>',
  },
];
