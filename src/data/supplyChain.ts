/**
 * Hand-curated supply-chain edges across the GIGASCOPE universe.
 *
 * Each edge encodes: from → to, what flows, why it matters.
 * Nodes correspond to ticker symbols (matching TICKERS in tickers.ts).
 * Edges are directional: upstream supplier → downstream customer.
 *
 * Not exhaustive. Edited by hand. Update when a flagged catalyst confirms
 * or breaks a dependency.
 */

export interface ChainEdge {
  from: string;     // upstream supplier ticker
  to: string;       // downstream customer ticker
  flow: string;     // 1-line description ("HBM3E memory", "EUV lithography")
  criticality: "monopoly" | "primary" | "secondary";
  /** Optional. Public source backing this edge. */
  source?: { label: string; url: string };
  /** Tier index for the layered diagram (0 = raw materials, 4 = end customers). */
  fromTier: number;
  toTier: number;
}

/**
 * Layer tiers from upstream → downstream:
 *   0 = raw materials / mining
 *   1 = refining / wafer fabrication input (EUV, packaging)
 *   2 = chips (logic, memory)
 *   3 = compute systems / modules
 *   4 = end products (cars, robots, rockets, data centers)
 */
export const TIER_LABELS: Record<number, string> = {
  0: "Raw materials & mining",
  1: "Wafer + lithography",
  2: "Chips (logic + memory)",
  3: "Compute & systems",
  4: "End products & deployments",
};

export const EDGES: ChainEdge[] = [
  // Raw materials → wafer / batteries
  { from: "CRML", to: "MP",   flow: "Allied-nation REE alternative (oxide supply)", criticality: "secondary", fromTier: 0, toTier: 0 },
  { from: "MP",   to: "TSLA", flow: "Neodymium-iron-boron magnets for motors",      criticality: "primary",   fromTier: 0, toTier: 4,
    source: { label: "MP–GM offtake disclosure", url: "https://mpmaterials.com/news/" } },
  { from: "ALB",  to: "TSLA", flow: "Battery-grade lithium hydroxide",              criticality: "primary",   fromTier: 0, toTier: 4 },
  { from: "CCJ",  to: "OKLO", flow: "Uranium fuel supply (long-term contracts)",    criticality: "secondary", fromTier: 0, toTier: 4 },
  { from: "CCJ",  to: "SMR",  flow: "Uranium fuel supply",                          criticality: "secondary", fromTier: 0, toTier: 4 },

  // Lithography → foundry
  { from: "ASML", to: "TSM",  flow: "EUV + High-NA EUV lithography (sole supplier)", criticality: "monopoly", fromTier: 1, toTier: 2,
    source: { label: "ASML High-NA EXE:5000", url: "https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe5000" } },
  { from: "ASML", to: "005930.KS", flow: "EUV for 3nm GAA + foundry advanced nodes",  criticality: "monopoly", fromTier: 1, toTier: 2 },
  { from: "ASML", to: "000660.KS", flow: "EUV for HBM4 + 1c DRAM node",              criticality: "monopoly", fromTier: 1, toTier: 2 },

  // Foundry → fabless chips
  { from: "TSM",  to: "NVDA", flow: "Blackwell + Rubin GPU fabrication (N4P, N3, N2)", criticality: "monopoly", fromTier: 2, toTier: 2,
    source: { label: "NVIDIA 10-K (TSMC dependency disclosure)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=10-K" } },
  { from: "TSM",  to: "AMD",  flow: "MI300/MI325/MI350 fabrication (N5, N3)",          criticality: "primary",  fromTier: 2, toTier: 2 },
  { from: "TSM",  to: "AVGO", flow: "Hyperscaler ASIC fabrication (Google TPU, Meta MTIA)", criticality: "primary", fromTier: 2, toTier: 2 },
  { from: "TSM",  to: "TSLA", flow: "Tesla AI4 / AI5 inference chip fabrication",      criticality: "primary",  fromTier: 2, toTier: 2 },
  { from: "TSM",  to: "ARM",  flow: "Royalty pass-through (CPU IP)",                   criticality: "secondary", fromTier: 2, toTier: 2 },

  // Memory → compute systems
  { from: "000660.KS", to: "NVDA", flow: "HBM3E sole-source on Blackwell B100/B200",   criticality: "monopoly", fromTier: 2, toTier: 3,
    source: { label: "SK Hynix HBM3E announcements", url: "https://news.skhynix.com/" } },
  { from: "005930.KS", to: "NVDA", flow: "HBM3E qualification (pending) + HBM4 co-dev", criticality: "primary", fromTier: 2, toTier: 3 },
  { from: "MU",        to: "NVDA", flow: "HBM3E qualified, growing share",             criticality: "primary", fromTier: 2, toTier: 3 },

  // GPU/Compute → end products
  { from: "NVDA", to: "PLTR", flow: "GPU clusters for AIP deployment",                 criticality: "primary", fromTier: 3, toTier: 4 },
  { from: "NVDA", to: "TSLA", flow: "Cortex training cluster (50K+ H100 → Dojo hybrid)", criticality: "primary", fromTier: 3, toTier: 4,
    source: { label: "Tesla AI Day / xAI Colossus", url: "https://x.ai/colossus" } },

  // Foundry packaging
  { from: "TSM",  to: "000660.KS", flow: "CoWoS-L packaging for HBM stacks on NVDA SKUs", criticality: "primary", fromTier: 1, toTier: 2 },

  // Defense + autonomy stack
  { from: "NVDA", to: "RKLB", flow: "Compute for satellite payloads + Photon ops",     criticality: "secondary", fromTier: 3, toTier: 4 },
  { from: "PLTR", to: "LMT",  flow: "Foundry/Skywise software layer on weapons platforms", criticality: "secondary", fromTier: 3, toTier: 4 },

  // Nuclear → AI compute (downstream PPA story)
  { from: "OKLO", to: "NVDA", flow: "SMR PPA-style power for AI datacenters (long-dated)", criticality: "secondary", fromTier: 4, toTier: 3 },
  { from: "SMR",  to: "NVDA", flow: "SMR PPA-style power for AI datacenters",          criticality: "secondary", fromTier: 4, toTier: 3 },

  // Batteries / EV chain
  { from: "ALB",  to: "373220.KS", flow: "Battery-grade lithium hydroxide",            criticality: "primary",   fromTier: 0, toTier: 2 },
  { from: "ALB",  to: "006400.KS", flow: "Lithium hydroxide for NMC",                  criticality: "primary",   fromTier: 0, toTier: 2 },
  { from: "373220.KS", to: "TSLA", flow: "NCMA cells for select Tesla Models",         criticality: "secondary", fromTier: 2, toTier: 4 },
  { from: "373220.KS", to: "005380.KS", flow: "Cells for Hyundai/Kia E-GMP platform",  criticality: "primary",   fromTier: 2, toTier: 4 },
  { from: "006400.KS", to: "TSLA", flow: "21700 cells for Model 3/Y (early gen)",      criticality: "secondary", fromTier: 2, toTier: 4 },
  { from: "300750.SZ", to: "TSLA", flow: "LFP cells for Model 3/Y Shanghai",           criticality: "primary",   fromTier: 2, toTier: 4 },
  { from: "1211.HK",   to: "1211.HK", flow: "Vertically integrated cell-to-pack Blade", criticality: "monopoly", fromTier: 2, toTier: 4 },

  // Korea industrial cross-edges
  { from: "012450.KS", to: "LMT", flow: "K9 howitzer is co-marketed alongside LMT artillery in some NATO competitions",
    criticality: "secondary", fromTier: 4, toTier: 4 },
];

/** All ticker symbols that appear as either side of any edge. */
export function chainSymbols(): Set<string> {
  const s = new Set<string>();
  for (const e of EDGES) {
    s.add(e.from);
    s.add(e.to);
  }
  return s;
}

/** Edges where `symbol` is the downstream party (i.e. what feeds into this co.) */
export function upstreamOf(symbol: string): ChainEdge[] {
  return EDGES.filter((e) => e.to === symbol);
}

/** Edges where `symbol` is the upstream party (i.e. what this co. feeds into). */
export function downstreamOf(symbol: string): ChainEdge[] {
  return EDGES.filter((e) => e.from === symbol);
}
