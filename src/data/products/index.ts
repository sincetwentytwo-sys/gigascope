/**
 * Product breakdown contract.
 *
 * Each ProductSpec drives <Product2DViewer/> — a real reference photo with
 * numbered SVG hotspot dots overlaid at normalized image coords. Clicking a
 * dot (or the matching numbered legend entry) surfaces that part's
 * description and optional outbound link.
 *
 * The viewer renders the main photo at
 *   /public/products/photos/<slug>.jpg
 * Hotspots are drawn at part.hotspot = { x, y } with x,y ∈ [0,1] (top-left
 * origin). Parts without a hotspot appear in the legend only.
 *
 * Adding a new product:
 *   1. Create `src/data/products/<slug>.ts` exporting a `ProductSpec` whose
 *      `slug` matches the file name and the route `/products/<slug>`.
 *   2. Drop the reference photo at `/public/products/photos/<slug>.jpg`
 *      (or `.svg` and set `imageType: "svg"` for line-art schematics).
 *   3. Add CC-BY / press-kit attribution via `photoCredit` or `mainCredit`.
 *   4. Register the spec in `KNOWN_PRODUCTS` below.
 *   5. The /products hub and [slug] static params pick it up automatically.
 *
 * Conventions:
 *   - Each part needs `id`, `name`, `description` (150-300 chars,
 *     technical, "why this matters"), and `color` (legend dot tint).
 *   - `hotspot` is optional — only add for parts visible in the photo.
 *     Use normalized coords (0,0 = top-left, 1,1 = bottom-right).
 *   - `relatedSites` are factory slugs from `src/data/factories.ts`.
 *
 * Legacy 3D fields (`position`, `rotation`, `geometry`, `args`, `metalness`,
 * `roughness`, `emissive` on PartSpec; `cameraPosition`, `cameraTarget`,
 * `cameraMinDistance`, `cameraMaxDistance`, `cutawayAxis`, `background` on
 * ProductSpec) remain on the types for back-compat with existing product
 * data files but are NO LONGER READ by the active viewer. New products may
 * safely omit them.
 */

export type GeometryKind =
  | "cylinder"
  | "cone"
  | "box"
  | "sphere"
  | "torus"
  | "ring";

export type PartSpec = {
  id: string;
  name: string;
  description: string;
  /** @deprecated 3D viewer field, no longer used. Kept optional for back-compat
   *  with existing product data files; the active 2D viewer ignores it. */
  position?: [number, number, number];
  /** @deprecated 3D viewer field, no longer used. */
  rotation?: [number, number, number];
  /** @deprecated 3D viewer field, no longer used. */
  geometry?: GeometryKind;
  /** @deprecated 3D viewer field, no longer used. */
  args?: Array<number | boolean>;
  color: string;
  /** @deprecated 3D viewer field, no longer used. */
  emissive?: string;
  /** @deprecated 3D viewer field, no longer used. */
  metalness?: number;
  /** @deprecated 3D viewer field, no longer used. */
  roughness?: number;
  href?: string;
  /** Cutaway hint. If true, render as low-opacity wireframe so internals show through.
   *  If undefined, viewer auto-classifies by name keyword (body/shell/glass/panel/...). */
  shell?: boolean;
  /** Optional hotspot marker on the product reference photo. A single point
   *  in 0..1 normalized image coords (0,0 = top-left). Rendered as a small
   *  dot the user can click; omitted parts are list-only. We use a single
   *  point rather than a polygon because SAM-derived polygons are easy to
   *  trace wrong but a centroid is hard to misplace. */
  hotspot?: { x: number; y: number };
};

export type ProductCategory =
  | "rocket"
  | "engine"
  | "battery"
  | "chip"
  | "compute"
  | "memory"
  | "lithography"
  | "packaging"
  | "vehicle"
  | "spacecraft"
  | "robot"
  | "energy"
  | "charging"
  | "weapon"
  | "quantum"
  | "reactor";

export type ProductSpec = {
  slug: string;
  name: string;
  aka?: string;
  category: ProductCategory;
  description: string;
  /** @deprecated 3D viewer field, no longer used. */
  cameraPosition: [number, number, number];
  /** @deprecated 3D viewer field, no longer used. */
  cameraTarget?: [number, number, number];
  /** @deprecated 3D viewer field, no longer used. */
  cameraMinDistance?: number;
  /** @deprecated 3D viewer field, no longer used. */
  cameraMaxDistance?: number;
  /** @deprecated 3D viewer field, no longer used. */
  cutawayAxis?: "x" | "z";
  /** @deprecated 3D viewer field, no longer used. */
  background?: string;
  /** Reference image type — "jpg" by default (real photo), "svg" for stylised
   *  schematic diagrams (used when a CC photo isn't available). */
  imageType?: "jpg" | "svg";
  parts: PartSpec[];
  relatedSites?: string[];
  /** Attribution for the *main* reference photo (the one with hotspots).
   *  Required by CC-BY / CC-BY-SA terms. NASA/public-domain photos
   *  technically don't need credit but we still list for transparency. */
  photoCredit?: {
    author: string;
    license: string;
    sourceUrl: string;
  };
  /** Attribution for the main photo on the 2D viewer. Used for products
   *  whose photo was sourced from press kits or Wikimedia Commons during
   *  the SVG-placeholder → real-photo replacement pass. Rendered as a
   *  small caption below the image. Either `mainCredit` or `photoCredit`
   *  is acceptable; both are honored by Product2DViewer. */
  mainCredit?: {
    /** Display name of the source ("Wikimedia Commons", "Boston Dynamics press", etc). */
    source: string;
    /** Link to the source page (Commons file page or press release URL). */
    url: string;
    /** License identifier ("CC BY-SA 4.0", "Public domain", "Press kit (editorial use)", etc). */
    license: string;
  };
  /** Additional photos shown as a thumbnail strip — front/side/rear/3-4
   *  views, etc. The main photo (`/photos/<slug>.jpg`) is always shown
   *  first; this array holds the *extras*. Hotspots only apply to the
   *  main photo; the gallery views show the bare image. */
  galleryPhotos?: Array<{
    /** Path relative to /public, e.g. "/products/photos/cybertruck/side.jpg" */
    src: string;
    /** Short label shown on the thumbnail: "Side", "Rear", "Interior", etc. */
    label: string;
    credit: {
      author: string;
      license: string;
      sourceUrl: string;
    };
  }>;
};

import { raptor } from "./raptor";
import { falcon9 } from "./falcon9";
import { starship } from "./starship";
import { tesla4680 } from "./4680";
import { neuralinkN1 } from "./neuralink-n1";
import { model3 } from "./model-3";
import { modelY } from "./model-y";
import { cybertruck } from "./cybertruck";
import { optimus } from "./optimus";
import { cybercab } from "./cybercab";
import { megapack } from "./megapack";
import { powerwall } from "./powerwall";
import { superchargerV4 } from "./supercharger-v4";

// Musk-empire only per master plan v1. The previously-bundled supply-chain
// products (NVIDIA Blackwell, HBM3E, ASML EUV, TSMC CoWoS, Hyundai IONIQ 5,
// Boston Dynamics Atlas, LGES Ultium, BYD Blade, Hanwha K9, RKLB Neutron,
// IonQ Tempo, Oklo Aurora) were removed 2026-05-23 — the catalog stays
// narrow on Tesla / SpaceX / Neuralink hardware. Their data files and
// photo dirs were deleted in the same commit.
export const KNOWN_PRODUCTS: ProductSpec[] = [
  raptor, falcon9, starship, tesla4680, neuralinkN1,
  model3, modelY, cybertruck, optimus, cybercab,
  megapack, powerwall, superchargerV4,
];

export function getProduct(slug: string): ProductSpec | undefined {
  return KNOWN_PRODUCTS.find((p) => p.slug === slug);
}

export function listProducts(): ProductSpec[] {
  return KNOWN_PRODUCTS;
}
