import type { MetadataRoute } from "next";
import { factories, DATA_LAST_UPDATED } from "@/data/factories";
import { listProducts } from "@/data/products";
import { SECTORS, TICKERS } from "@/data/tickers";

const BASE_URL = "https://gigascope.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date(DATA_LAST_UPDATED);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: lastMod, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/markets`, lastModified: lastMod, changeFrequency: "hourly", priority: 0.95 },
    { url: `${BASE_URL}/sectors`, lastModified: lastMod, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: lastMod, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE_URL}/pro`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/compare`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/timeline`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/products`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.5 },
  ];

  const sectorPages: MetadataRoute.Sitemap = SECTORS.map((s) => ({
    url: `${BASE_URL}/sectors/${s.id}`,
    lastModified: lastMod,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const tickerPages: MetadataRoute.Sitemap = TICKERS.map((t) => ({
    url: `${BASE_URL}/ticker/${t.symbol.toLowerCase().replace(/\./g, "-")}`,
    lastModified: lastMod,
    changeFrequency: "hourly",
    priority: t.featured ? 0.95 : 0.8,
  }));

  const factoryPages: MetadataRoute.Sitemap = factories.map((f) => ({
    url: `${BASE_URL}/site/${f.slug}`,
    lastModified: f.lastUpdated ? new Date(f.lastUpdated) : lastMod,
    changeFrequency: "weekly",
    priority: f.featured ? 0.95 : 0.85,
  }));

  const productPages: MetadataRoute.Sitemap = listProducts().map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: lastMod,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...sectorPages, ...tickerPages, ...factoryPages, ...productPages];
}
