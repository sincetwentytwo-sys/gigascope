import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProduct,
  listProducts,
  type ProductCategory,
} from "@/data/products";
import { getFactory } from "@/data/factories";
import Product2DViewer from "@/components/Product2DViewer";

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
  const title = `${p.name} — Component Breakdown — GIGASCOPE`;
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
          alt: `${p.name} component breakdown`,
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
          className="font-mono text-[10px] uppercase tracking-widest text-dim hover:text-text"
        >
          &larr; All products
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {product.name}
          </h1>
          {product.aka && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-dim">
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

      {/* Photo viewer */}
      <Product2DViewer product={product} />

      {/* Description + related */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-bold text-sm uppercase tracking-widest text-white mb-3">
            Overview
          </h2>
          <p className="text-base text-text leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="border border-border-custom bg-bg/60 p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-dim mb-3">
              Quick stats
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-dim">Category</dt>
                <dd className="text-white" style={{ color: accent }}>
                  {product.category}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dim">Parts modeled</dt>
                <dd className="text-white">{product.parts.length}</dd>
              </div>
            </dl>
          </div>

          {relatedFactories.length > 0 && (
            <div className="border border-border-custom bg-bg/60 p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-dim mb-3">
                Built / launched at
              </div>
              <ul className="flex flex-col gap-2">
                {relatedFactories.map((f) => (
                  <li key={f.slug}>
                    <Link
                      href={`/site/${f.slug}`}
                      className="flex items-center gap-2 text-sm text-text hover:text-text"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: f.color }}
                      />
                      <span className="flex-1">{f.name}</span>
                      <span className="font-mono text-[10px] text-dim">
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
