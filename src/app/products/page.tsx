import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, type ProductCategory } from "@/data/products";

// Hub thumbnails now reuse the per-product main reference photo (real photo,
// matches the detail page). Fall back to the legacy procedural screenshot
// only if the photo is missing (shouldn't happen — 13 / 13 ship with photos).
const PRODUCT_THUMB = new Map<string, string>(
  listProducts().map((p) => {
    const ext = p.slug === "4680" ? "svg" : "jpg";
    const photo = `/products/photos/${p.slug}/main.${ext}`;
    const legacy = `/products/${p.slug}.jpg`;
    if (existsSync(resolve(process.cwd(), "public", "products", "photos", p.slug, `main.${ext}`))) {
      return [p.slug, photo] as const;
    }
    if (existsSync(resolve(process.cwd(), "public", "products", `${p.slug}.jpg`))) {
      return [p.slug, legacy] as const;
    }
    return [p.slug, ""] as const;
  }),
);

export const metadata: Metadata = {
  title: "Component Breakdowns — GIGASCOPE",
  description:
    "Click-to-explore breakdowns of Musk-empire hardware — Raptor engine, Starship, Falcon 9, Cybertruck, Optimus, 4680 cell, Megapack, and more. Each component links to a tech blurb you can actually read.",
  alternates: { canonical: "https://gigascope.xyz/products" },
  openGraph: {
    title: "Component Breakdowns — GIGASCOPE",
    description:
      "Real reference photos with clickable parts. 13 flagship products across Tesla, SpaceX, xAI, Neuralink, and Boring.",
    url: "https://gigascope.xyz/products",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Component Breakdowns — GIGASCOPE",
    description:
      "Real reference photos with clickable parts. 13 flagship products across Tesla, SpaceX, xAI, Neuralink, and Boring.",
  },
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  rocket: "#7aa6ff",
  engine: "#ff7a40",
  battery: "#5dd39e",
  chip: "#c97aff",
  compute: "#76b900",
  memory: "#06b6d4",
  lithography: "#005bbb",
  packaging: "#ec4899",
  vehicle: "#ffd166",
  spacecraft: "#7adfff",
  robot: "#ff7adf",
  energy: "#7adf9e",
  charging: "#ffae40",
  weapon: "#f7941d",
  quantum: "#a855f7",
  reactor: "#22c55e",
};

const CATEGORY_GRADIENTS: Record<ProductCategory, string> = {
  rocket: "linear-gradient(135deg, #1a2540 0%, #0a0a0c 50%, #2a1a40 100%)",
  engine: "linear-gradient(135deg, #2a1500 0%, #0a0a0c 50%, #3a1a00 100%)",
  battery: "linear-gradient(135deg, #0d2a1a 0%, #0a0a0c 50%, #1a3a2a 100%)",
  chip: "linear-gradient(135deg, #2a0d3a 0%, #0a0a0c 50%, #1a0d2a 100%)",
  compute: "linear-gradient(135deg, #1a2d0a 0%, #0a0a0c 50%, #2d3a0d 100%)",
  memory: "linear-gradient(135deg, #052b3a 0%, #0a0a0c 50%, #0d3a4d 100%)",
  lithography: "linear-gradient(135deg, #0a1a3a 0%, #0a0a0c 50%, #0d2d5a 100%)",
  packaging: "linear-gradient(135deg, #3a0d2a 0%, #0a0a0c 50%, #4d0d3a 100%)",
  vehicle: "linear-gradient(135deg, #2a200d 0%, #0a0a0c 50%, #3a2a0d 100%)",
  spacecraft: "linear-gradient(135deg, #0d1f2a 0%, #0a0a0c 50%, #0d2a3a 100%)",
  robot: "linear-gradient(135deg, #2a0d22 0%, #0a0a0c 50%, #3a0d33 100%)",
  energy: "linear-gradient(135deg, #0d2a20 0%, #0a0a0c 50%, #1a3a2d 100%)",
  charging: "linear-gradient(135deg, #2a1a0d 0%, #0a0a0c 50%, #3a2a13 100%)",
  weapon: "linear-gradient(135deg, #2a1300 0%, #0a0a0c 50%, #3a1800 100%)",
  quantum: "linear-gradient(135deg, #2d0d3a 0%, #0a0a0c 50%, #3a0d4d 100%)",
  reactor: "linear-gradient(135deg, #0d2a0d 0%, #0a0a0c 50%, #1a3a1a 100%)",
};

export default function ProductsHubPage() {
  const products = listProducts();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-dim mb-2">
          GIGASCOPE / Products
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
          Component Breakdowns
        </h1>
        <p className="text-dim text-base sm:text-lg leading-relaxed max-w-2xl">
          Real reference photos with clickable parts. Engines, rockets, cars,
          batteries, robots — the hardware that defines the Musk empire,
          dissected one component at a time.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="border border-border-custom p-8 text-center text-dim">
          No product breakdowns available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {products.map((p) => {
            const color = CATEGORY_COLORS[p.category];
            const gradient = CATEGORY_GRADIENTS[p.category];
            const shortDesc =
              p.description.length > 130
                ? p.description.slice(0, 127).trimEnd() + "…"
                : p.description;
            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="group block border border-border-custom bg-bg/60 hover:border-text/40 transition-colors overflow-hidden"
              >
                <div
                  className="aspect-[4/3] w-full relative overflow-hidden"
                  style={{ background: gradient }}
                >
                  {PRODUCT_THUMB.get(p.slug) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={PRODUCT_THUMB.get(p.slug)!}
                      alt={p.name}
                      className={`absolute inset-0 w-full h-full ${p.slug === "4680" ? "object-contain bg-white" : "object-cover"} group-hover:scale-105 transition-transform duration-700`}
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity"
                      style={{
                        background: `radial-gradient(circle at 50% 60%, ${color}40 0%, transparent 60%)`,
                      }}
                    />
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 border"
                      style={{
                        color,
                        borderColor: `${color}66`,
                        background: "#0a0a0c99",
                      }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 font-mono text-[10px] text-text/60 uppercase tracking-widest">
                    {p.parts.length} parts
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="text-lg sm:text-xl font-bold text-text mb-1 leading-tight">
                    {p.name}
                  </h2>
                  {p.aka && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-dim mb-2">
                      {p.aka}
                    </div>
                  )}
                  <p className="text-sm text-dim leading-relaxed">
                    {shortDesc}
                  </p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-dim group-hover:text-text transition-colors">
                    Open breakdown &rarr;
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
