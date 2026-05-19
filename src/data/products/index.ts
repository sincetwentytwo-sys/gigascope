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
  position: [number, number, number];
  rotation?: [number, number, number];
  geometry: GeometryKind;
  /** Args forwarded to the matching three.js geometry constructor.
   *  Most entries are numbers; cylinder/cone accept a trailing `openEnded` boolean. */
  args: Array<number | boolean>;
  color: string;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  href?: string;
};

export type ProductCategory =
  | "rocket"
  | "engine"
  | "battery"
  | "chip"
  | "vehicle"
  | "spacecraft";

export type ProductSpec = {
  slug: string;
  name: string;
  aka?: string;
  category: ProductCategory;
  description: string;
  cameraPosition: [number, number, number];
  cameraTarget?: [number, number, number];
  background?: string;
  parts: PartSpec[];
  relatedSites?: string[];
};

import { raptor } from "./raptor";
import { falcon9 } from "./falcon9";
import { starship } from "./starship";

export const KNOWN_PRODUCTS: ProductSpec[] = [raptor, falcon9, starship];

export function getProduct(slug: string): ProductSpec | undefined {
  return KNOWN_PRODUCTS.find((p) => p.slug === slug);
}

export function listProducts(): ProductSpec[] {
  return KNOWN_PRODUCTS;
}
