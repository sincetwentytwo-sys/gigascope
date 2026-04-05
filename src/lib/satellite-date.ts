/**
 * Query ESRI World Imagery MapServer to get the approximate capture date
 * for satellite imagery at a given coordinate.
 *
 * Uses the "identify" endpoint which returns metadata including acquisition date.
 * Returns null if the query fails or no date is available.
 */
export async function getESRIImageryDate(
  lat: number,
  lng: number
): Promise<string | null> {
  const url = new URL(
    "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/identify"
  );
  url.searchParams.set("geometry", `${lng},${lat}`);
  url.searchParams.set("geometryType", "esriGeometryPoint");
  url.searchParams.set("sr", "4326");
  url.searchParams.set("layers", "all");
  url.searchParams.set("tolerance", "1");
  url.searchParams.set("mapExtent", `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`);
  url.searchParams.set("imageDisplay", "400,300,96");
  url.searchParams.set("returnGeometry", "false");
  url.searchParams.set("f", "json");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const json = await res.json();
    const results = json.results;
    if (!results || results.length === 0) return null;

    // Look for SRC_DATE or similar date fields in attributes
    for (const result of results) {
      const attrs = result.attributes;
      if (!attrs) continue;

      // ESRI uses SRC_DATE2 (most recent), SRC_DATE, or AcquisitionDate
      const dateStr =
        attrs.SRC_DATE2 || attrs.SRC_DATE || attrs.AcquisitionDate;
      if (dateStr) {
        // Format: typically "20240315" or epoch ms
        if (typeof dateStr === "number") {
          return new Date(dateStr).toISOString().split("T")[0];
        }
        if (/^\d{8}$/.test(dateStr)) {
          return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        }
        return dateStr;
      }
    }

    return null;
  } catch {
    return null;
  }
}
