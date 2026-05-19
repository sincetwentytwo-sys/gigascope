import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, type ProductCategory } from "@/data/products";

const PRODUCT_THUMBS = new Set(
  listProducts()
    .filter((p) => existsSync(resolve(process.cwd(), "public", "products", `${p.slug}.jpg`)))
    .map((p) => p.slug),
);

export const metadata: Metadata = {
  title: "Interactive Product Breakdowns — GIGASCOPE",
  description:
    "3D interactive breakdowns of Musk Empire hardware — Raptor engine, Starship, Falcon 9, Tesla 4680, Neuralink N1. Click any part to learn how it actually works.",
  openGraph: {
    title: "Interactive Product Breakdowns — GIGASCOPE",
    description:
      "3D interactive breakdowns of Musk Empire hardware. Click any part to learn how it actually works.",
  },
};

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  rocket: "#7aa6ff",
  engine: "#ff7a40",
  battery: "#5dd39e",
  chip: "#c97aff",
  vehicle: "#ffd166",
  spacecraft: "#7adfff",
};

const CATEGORY_GRADIENTS: Record<ProductCategory, string> = {
  rocket:
    "linear-gradient(135deg, #1a2540 0%, #0a0a0c 50%, #2a1a40 100%)",
  engine:
    "linear-gradient(135deg, #2a1500 0%, #0a0a0c 50%, #3a1a00 100%)",
  battery:
    "linear-gradient(135deg, #0d2a1a 0%, #0a0a0c 50%, #1a3a2a 100%)",
  chip: "linear-gradient(135deg, #2a0d3a 0%, #0a0a0c 50%, #1a0d2a 100%)",
  vehicle:
    "linear-gradient(135deg, #2a200d 0%, #0a0a0c 50%, #3a2a0d 100%)",
  spacecraft:
    "linear-gradient(135deg, #0d1f2a 0%, #0a0a0c 50%, #0d2a3a 100%)",
};

export default function ProductsHubPage() {
  const products = listProducts();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] mb-2">
          GIGASCOPE / Products
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
          Interactive Product Breakdown
        </h1>
        <p className="text-dim text-base sm:text-lg leading-relaxed max-w-2xl">
          Click any part to learn how it actually works. Procedural 3D models of
          the hardware that defines the Musk empire — engines, rockets,
          batteries, chips.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="border border-[#343538] p-8 text-center text-dim">
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
                className="group block border border-[#343538] bg-[#121316]/60 hover:border-white/40 transition-colors overflow-hidden"
              >
                <div
                  className="aspect-[4/3] w-full relative overflow-hidden"
                  style={{ background: gradient }}
                >
                  {PRODUCT_THUMBS.has(p.slug) ? (
                    <img
                      src={`/products/${p.slug}.jpg`}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                  <div className="absolute bottom-3 right-3 font-mono text-[10px] text-white/60 uppercase tracking-widest">
                    {p.parts.length} parts
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-1 leading-tight">
                    {p.name}
                  </h2>
                  {p.aka && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] mb-2">
                      {p.aka}
                    </div>
                  )}
                  <p className="text-sm text-[#b7c8e1] leading-relaxed">
                    {shortDesc}
                  </p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-[#8292aa] group-hover:text-white transition-colors">
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
