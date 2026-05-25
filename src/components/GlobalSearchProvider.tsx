import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";
import GlobalSearch from "./GlobalSearch";

// Static pages kept in global search after Round 4 (2026-05-25 page-kill).
// /news, /timeline, /calendar, /downloads dropped. Their 308 redirects
// in next.config.ts handle external/cached links.
const STATIC_PAGES: Array<{ title: string; href: string; subtitle: string }> = [
  { title: "Charter membership", href: "/pro", subtitle: "Alerts, digest, downloads · $9 charter" },
  { title: "Compare", href: "/compare", subtitle: "Before/after satellite slider" },
  { title: "Products", href: "/products", subtitle: "Component breakdowns" },
  { title: "Methodology", href: "/methodology", subtitle: "How we calculate progress" },
  { title: "About", href: "/about", subtitle: "Data sources, confidence policy" },
  { title: "SpaceX Financial Tracker", href: "/spacex-ipo", subtitle: "Capex, sites, S-1, catalysts" },
];

export default function GlobalSearchProvider() {
  const entries: Parameters<typeof GlobalSearch>[0]["entries"] = [];

  // sites
  for (const f of factories) {
    entries.push({
      kind: "site",
      title: `${f.flag} ${f.name}`,
      subtitle: `${f.location} · ${f.status}`,
      href: `/site/${f.slug}`,
      blob: `${f.name} ${f.aka ?? ""} ${f.location} ${f.company} ${f.flag}`.toLowerCase(),
    });
  }
  // products
  for (const p of listProducts()) {
    entries.push({
      kind: "product",
      title: p.name,
      subtitle: p.category,
      href: `/products/${p.slug}`,
      blob: `${p.name} ${p.aka ?? ""} ${p.category}`.toLowerCase(),
    });
  }
  // static pages
  for (const p of STATIC_PAGES) {
    entries.push({
      kind: "page",
      title: p.title,
      subtitle: p.subtitle,
      href: p.href,
      blob: `${p.title} ${p.subtitle}`.toLowerCase(),
    });
  }

  return <GlobalSearch entries={entries} />;
}
