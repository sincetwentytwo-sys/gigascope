import type { MetadataRoute } from "next";
import { factories, DATA_LAST_UPDATED } from "@/data/factories";

const BASE_URL = "https://gigascope.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date(DATA_LAST_UPDATED);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: lastMod, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/compare`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/timeline`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: lastMod, changeFrequency: "monthly", priority: 0.5 },
  ];

  const factoryPages: MetadataRoute.Sitemap = factories.map((f) => ({
    url: `${BASE_URL}/factory/${f.slug}`,
    lastModified: f.lastUpdated ? new Date(f.lastUpdated) : lastMod,
    changeFrequency: "weekly",
    priority: f.featured ? 0.95 : 0.85,
  }));

  return [...staticPages, ...factoryPages];
}
