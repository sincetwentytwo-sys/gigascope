import type { Company, CompanyMeta } from "./types";

export const COMPANIES: CompanyMeta[] = [
  {
    id: "tesla",
    name: "Tesla",
    color: "#e31937",
    icon: "⚡",
    description: "Electric vehicles & energy",
  },
  {
    id: "spacex",
    name: "SpaceX",
    color: "#005288",
    icon: "🚀",
    description: "Rockets & Starlink",
  },
  {
    // xAI is no longer an independent company — SpaceX acquired it in an
    // all-stock merger (Feb 2026), and the combined entity IPO'd as SPCX in
    // June 2026. We keep xAI as its own grouping because the compute sites
    // (Colossus et al.) are physically and operationally distinct, but the
    // description must not imply independence.
    id: "xai",
    name: "xAI",
    color: "#7b2dbd",
    icon: "🧠",
    description: "AI compute · SpaceX division since Feb 2026",
  },
  {
    id: "neuralink",
    name: "Neuralink",
    color: "#00875a",
    icon: "🔬",
    description: "Brain-computer interfaces",
  },
  {
    id: "boring",
    name: "The Boring Company",
    color: "#bf5600",
    icon: "🕳️",
    description: "Tunnel infrastructure",
  },
  {
    id: "joint",
    name: "Joint Ventures",
    color: "#c4a000",
    icon: "🤝",
    description: "Cross-company projects",
  },
];

export function getCompanyMeta(id: Company): CompanyMeta {
  return COMPANIES.find((c) => c.id === id) ?? COMPANIES[0];
}
