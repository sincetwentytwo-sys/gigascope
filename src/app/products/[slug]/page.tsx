import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProduct,
  listProducts,
  type ProductCategory,
} from "@/data/products";
import { getFactory } from "@/data/factories";
import Product3DViewerWrapper from "@/components/Product3DViewerWrapper";

const SITE_URL = "https://gigascope.xyz";

const CATEGORY_COLORS: Record<ProductCategory, string> = {
  rocket: "#7aa6ff",
  engine: "#ff7a40",
  battery: "#5dd39e",
  chip: "#c97aff",
  vehicle: "#ffd166",
  spacecraft: "#7adfff",
  robot: "#ff7adf",
  energy: "#7aff9e",
  charging: "#7affe5",
};

export function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) {
    return { title: "Product — GIGASCOPE" };
  }
  const url = `${SITE_URL}/products/${p.slug}`;
  const title = `${p.name} — Interactive 3D Breakdown — GIGASCOPE`;
  const desc =
    p.description.length > 180
      ? p.description.slice(0, 177).trimEnd() + "…"
      : p.description;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      type: "article",
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${p.name} interactive 3D breakdown`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const accent = CATEGORY_COLORS[product.category];
  const relatedFactories = (product.relatedSites ?? [])
    .map((s) => getFactory(s))
    .filter((f): f is NonNullable<ReturnType<typeof getFactory>> => !!f);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb / header */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/products"
          className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] hover:text-white"
        >
          &larr; All products
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {product.name}
          </h1>
          {product.aka && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#8292aa]">
              {product.aka}
            </span>
          )}
          <span
            className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border"
            style={{
              color: accent,
              borderColor: `${accent}66`,
            }}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* 3D viewer */}
      <Product3DViewerWrapper product={product} />

      {/* Description + related */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-sm uppercase tracking-widest text-white mb-3">
            Overview
          </h2>
          <p className="text-base text-[#d6dde8] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="border border-[#343538] bg-[#121316]/60 p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] mb-3">
              Quick stats
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#8292aa]">Category</dt>
                <dd className="text-white" style={{ color: accent }}>
                  {product.category}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#8292aa]">Parts modeled</dt>
                <dd className="text-white">{product.parts.length}</dd>
              </div>
            </dl>
          </div>

          {relatedFactories.length > 0 && (
            <div className="border border-[#343538] bg-[#121316]/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[#8292aa] mb-3">
                Built / launched at
              </div>
              <ul className="flex flex-col gap-2">
                {relatedFactories.map((f) => (
                  <li key={f.slug}>
                    <Link
                      href={`/site/${f.slug}`}
                      className="flex items-center gap-2 text-sm text-[#d6dde8] hover:text-white"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: f.color }}
                      />
                      <span className="flex-1">{f.name}</span>
                      <span className="font-mono text-[10px] text-[#8292aa]">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
