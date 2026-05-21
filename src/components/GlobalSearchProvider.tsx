import { TICKERS, SECTORS, tickerHref } from "@/data/tickers";
import { factories } from "@/data/factories";
import { listProducts } from "@/data/products";
import { LEARN } from "@/data/learn";
import { listPrivateCompanies } from "@/data/privateCompanies";
import GlobalSearch from "./GlobalSearch";

const STATIC_PAGES: Array<{ title: string; href: string; subtitle: string }> = [
  { title: "Atlas (live heatmap)", href: "/markets", subtitle: "Live multi-sector heatmap + top movers" },
  { title: "Sectors", href: "/sectors", subtitle: "10 macro theses" },
  { title: "News", href: "/news", subtitle: "Aggregated headlines across the universe" },
  { title: "Calendar", href: "/calendar", subtitle: "Catalysts + milestones, chronological" },
  { title: "Supply chain", href: "/supply-chain", subtitle: "Layered tier graph + edges" },
  { title: "Watchlist", href: "/watchlist", subtitle: "Your starred companies" },
  { title: "Investor tier", href: "/investor", subtitle: "Alerts, digest, downloads · $9 early bird" },
  { title: "Timeline", href: "/timeline", subtitle: "Site milestone timeline" },
  { title: "Compare", href: "/compare", subtitle: "Before/after satellite slider" },
  { title: "Products", href: "/products", subtitle: "Component breakdowns" },
  { title: "About", href: "/about", subtitle: "Data sources, confidence policy" },
];

export default function GlobalSearchProvider() {
  const entries: Parameters<typeof GlobalSearch>[0]["entries"] = [];

  // companies + tickers
  for (const t of TICKERS) {
    entries.push({
      kind: "company",
      title: `${t.symbol} · ${t.name}`,
      subtitle: t.thesis.slice(0, 110),
      href: tickerHref(t),
      blob: `${t.symbol} ${t.name} ${t.shortName ?? ""} ${t.koreanName ?? ""} ${t.hq} ${t.sectors.join(" ")}`.toLowerCase(),
    });
  }
  // sectors
  for (const s of SECTORS) {
    entries.push({
      kind: "sector",
      title: s.name,
      subtitle: s.blurb,
      href: `/sectors/${s.id}`,
      blob: `${s.name} ${s.id} ${s.blurb}`.toLowerCase(),
    });
  }
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
  // private companies
  for (const c of listPrivateCompanies()) {
    entries.push({
      kind: "company",
      title: `${c.name} (private)`,
      subtitle: c.thesis.slice(0, 110),
      href: `/private/${c.slug}`,
      blob: `${c.name} private ${c.hq} ${c.sectors.join(" ")}`.toLowerCase(),
    });
  }
  // learn entries
  for (const l of LEARN) {
    entries.push({
      kind: "page",
      title: l.term,
      subtitle: l.oneLiner,
      href: `/learn/${l.slug}`,
      blob: `learn ${l.term} ${l.oneLiner} ${l.category}`.toLowerCase(),
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
