/**
 * Product 3D breakdown contract.
 *
 * Each ProductSpec drives a generic <Product3DViewer/> using procedural
 * three.js primitives (cylinder/cone/box/sphere/torus/ring) — NO GLB/FBX.
 * Parts are listed in `parts[]`; each renders as a clickable mesh that
 * surfaces its `name` + `description` (and optional `href`) in a side panel.
 *
 * Adding a new product:
 *   1. Create `src/data/products/<slug>.ts` exporting a `ProductSpec` whose
 *      `slug` matches the file name and the route `/products/<slug>`.
 *   2. Register it in `KNOWN_PRODUCTS` below (alphabetical-ish, by category).
 *   3. The /products hub and [slug] static params pick it up automatically.
 *
 * Conventions:
 *   - Units are arbitrary scene-units; build engines around ~3-5 units tall
 *     so a single `cameraPosition` like [6, 4, 8] frames them well.
 *   - Part descriptions: 150-300 chars, technical, "why this matters".
 *   - Use `metalness` ~0.7-0.95 for metal, `roughness` ~0.2-0.5.
 *   - `relatedSites` are factory slugs from `src/data/factories.ts`.
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
  /** Legacy 3D viewer fields — kept optional for back-compat with the
   *  original procedural-3D dataset. The current 2D photo/SVG viewer only
   *  uses `name`, `description`, `color`, and `hotspot`. */
  position?: [number, number, number];
  rotation?: [number, number, number];
  geometry?: GeometryKind;
  args?: Array<number | boolean>;
  color: string;
  emissive?: string;
  metalness?: number;
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
  cameraPosition: [number, number, number];
  cameraTarget?: [number, number, number];
  cameraMinDistance?: number;
  cameraMaxDistance?: number;
  /** Which axis the cutaway plane is perpendicular to. Default "z" — slices
   *  the model along its X-Y plane, which is correct for products whose long
   *  axis runs along X (Cybertruck, Model 3, etc). Set to "x" for products
   *  whose long axis runs along Z (e.g. Cybercab). */
  cutawayAxis?: "x" | "z";
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

// Extended (non-Musk) Atlas products — semis, batteries, defense, quantum, nuclear.
// All use stylised SVG schematics rather than real CC-licensed reference photos.
import { nvdaBlackwell } from "./nvda-blackwell";
import { hbm3e } from "./hbm3e";
import { asmlEuv } from "./asml-euv";
import { tsmcCowos } from "./tsmc-cowos";
import { hyundaiIoniq5 } from "./hyundai-ioniq5";
import { bostonDynamicsAtlas } from "./boston-dynamics-atlas";
import { lgesUltium } from "./lges-ultium";
import { bydBlade } from "./byd-blade";
import { hanwhaK9 } from "./hanwha-k9";
import { rklbNeutron } from "./rklb-neutron";
import { ionqTempo } from "./ionq-tempo";
import { okloAurora } from "./oklo-aurora";

export const KNOWN_PRODUCTS: ProductSpec[] = [
  // Musk Empire (primary)
  raptor, falcon9, starship, tesla4680, neuralinkN1,
  model3, modelY, cybertruck, optimus, cybercab,
  megapack, powerwall, superchargerV4,
  // Extended Atlas (semis + memory + litho + packaging)
  nvdaBlackwell, hbm3e, asmlEuv, tsmcCowos,
  // Extended Atlas (vehicles + robotics)
  hyundaiIoniq5, bostonDynamicsAtlas,
  // Extended Atlas (batteries)
  lgesUltium, bydBlade,
  // Extended Atlas (defense + space)
  hanwhaK9, rklbNeutron,
  // Extended Atlas (quantum + nuclear)
  ionqTempo, okloAurora,
];

export function getProduct(slug: string): ProductSpec | undefined {
  return KNOWN_PRODUCTS.find((p) => p.slug === slug);
}

export function listProducts(): ProductSpec[] {
  return KNOWN_PRODUCTS;
}
