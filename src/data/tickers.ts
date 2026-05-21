/**
 * Multi-sector ticker universe for GIGASCOPE.
 *
 * Not financial advice. All numeric fields are static reference data
 * (approximate market cap in USD billions, last-refresh date stamped per-row).
 * Live price comes from /api/quote/[symbol].
 *
 * Adding a ticker:
 *   - Append to TICKERS below.
 *   - exchange: "NASDAQ" | "NYSE" | "KRX" | "TWSE" | "AMS" | "LSE" | "FRA"
 *   - yahooSymbol: the symbol Yahoo Finance recognizes
 *     (e.g. "TSLA", "005930.KS", "ASML.AS", "TSM"). Used by the quote API.
 */

export type SectorId =
  | "musk-empire"
  | "semis-ai"
  | "quantum"
  | "critical-materials"
  | "defense-space"
  | "fusion-nuclear"
  | "robotics-ai";

export type Confidence = "high" | "medium" | "low" | "speculative";

export interface Catalyst {
  date: string;          // YYYY-MM-DD or YYYY-Qx
  label: string;
  blurb?: string;
  confidence?: Confidence;
}

export interface KeyMetric {
  label: string;
  value: string;
  note?: string;
}

export interface Ticker {
  symbol: string;                // canonical (uppercase, e.g., "TSLA", "005930.KS")
  yahooSymbol: string;           // symbol used by Yahoo Finance chart endpoint
  name: string;
  shortName?: string;
  exchange: "NASDAQ" | "NYSE" | "KRX" | "TWSE" | "AMS" | "LSE" | "FRA" | "HKEX";
  hq: string;
  ceo?: string;
  founded?: number;
  website?: string;
  sectors: SectorId[];
  /** Approx market cap in USD billions. Refresh ~weekly via a script later. */
  marketCapB?: number;
  marketCapAsOf?: string;
  thesis: string;                // 1-3 sentence why-this-stock-matters
  bullCase: string[];
  bearCase: string[];
  metrics?: KeyMetric[];
  catalysts?: Catalyst[];
  competitors?: string[];        // other ticker symbols in our universe
  relatedSites?: string[];       // factory slugs in src/data/factories.ts
  relatedProducts?: string[];    // product slugs in src/data/products
  /** Free-form long-form section (markdown-ish, no actual markdown rendering yet) */
  deepDive?: string;
  /** Color used in heatmap-style accents. Defaults to sector color. */
  accent?: string;
  /** Headline ticker shown in marquees. */
  featured?: boolean;
  /** ISO date of when this row was last hand-verified. */
  lastVerified?: string;
}

export interface Sector {
  id: SectorId;
  name: string;
  blurb: string;
  longBlurb: string;
  color: string;
  icon: string;
}

export const SECTORS: Sector[] = [
  {
    id: "musk-empire",
    name: "Musk Empire",
    blurb: "Tesla, SpaceX, xAI, Neuralink, Boring Co — the original Gigascope universe.",
    longBlurb:
      "The integrated industrial bet behind the Musk-led companies. Vertical stack from raw lithium to humanoid robots to orbital comms to brain-machine interfaces, all sharing capital, engineers, and customer surface area.",
    color: "#e31937",
    icon: "⚡",
  },
  {
    id: "semis-ai",
    name: "Semis & AI Compute",
    blurb: "GPUs, HBM, foundries, packaging — the physical layer of the AI build-out.",
    longBlurb:
      "Every AI workload eventually lands on a wafer. This sector tracks the GPU vendor (NVDA), foundry (TSM), memory (005930.KS, 000660.KS, MU), EUV monopoly (ASML), packaging, and the second-tier accelerator vendors (AMD, AVGO, ARM) racing for share.",
    color: "#76b900",
    icon: "🧠",
  },
  {
    id: "quantum",
    name: "Quantum Computing",
    blurb: "Trapped-ion, superconducting, photonic — the long-tail bet on post-classical compute.",
    longBlurb:
      "Highly speculative, highly story-driven names where pre-revenue stocks routinely 5×–10× on milestone press. Tracked here as a discrete sector because retail flows and option chains move together.",
    color: "#7b2dbd",
    icon: "⚛️",
  },
  {
    id: "critical-materials",
    name: "Critical Materials",
    blurb: "Lithium, rare earths, antimony — the upstream bottleneck nobody wants to own.",
    longBlurb:
      "The physical raw inputs gating the energy + defense + AI build-out. Permitting timelines stretch a decade. CRML and the lithium majors sit at this chokepoint.",
    color: "#bf5600",
    icon: "⛏️",
  },
  {
    id: "defense-space",
    name: "Defense & Space",
    blurb: "Hypersonics, drones, satellites, autonomy — primes + new-space disruptors.",
    longBlurb:
      "The Replicator-era defense bet. Primes (LMT, NOC, RTX) still dominate dollars, but the alpha is in the new-space launchers (RKLB), drone autonomy (KTOS, ANDURIL-private), and software (PLTR).",
    color: "#005288",
    icon: "🛰️",
  },
  {
    id: "fusion-nuclear",
    name: "Fusion & Nuclear",
    blurb: "SMRs, fusion startups, uranium — the 'AI needs power' trade.",
    longBlurb:
      "Hyperscaler PPAs have crowned a new generation of nuclear names. SMR (NuScale), uranium miners (CCJ), and fusion-adjacent listings track the structural electricity-demand inflection.",
    color: "#00875a",
    icon: "☢️",
  },
  {
    id: "robotics-ai",
    name: "Robotics & Applied AI",
    blurb: "Humanoids, autonomy stacks, AI-pure-plays beyond hyperscalers.",
    longBlurb:
      "Optimus is the canonical humanoid, but a public-market basket is forming: PLTR (defense AI), SYM (warehouse autonomy), and the next wave of robotics IPOs in queue.",
    color: "#0077b6",
    icon: "🤖",
  },
];

export const TICKERS: Ticker[] = [
  // ─────────────────────── MUSK EMPIRE ───────────────────────
  {
    symbol: "TSLA",
    yahooSymbol: "TSLA",
    name: "Tesla, Inc.",
    shortName: "Tesla",
    exchange: "NASDAQ",
    hq: "Austin, TX",
    ceo: "Elon Musk",
    founded: 2003,
    website: "https://www.tesla.com",
    sectors: ["musk-empire", "robotics-ai"],
    marketCapB: 1100,
    marketCapAsOf: "2026-05",
    thesis:
      "Tesla is no longer a car company narrative — it is an AI/robotics/energy holding company whose option value sits in Optimus, FSD, and the Megapack/Powerwall stack. The auto franchise funds the rest.",
    bullCase: [
      "Optimus at scale would dwarf the auto business — every assumption around humanoid TAM is upside.",
      "Energy storage (Megapack + Powerwall) is growing >50% YoY with structural utility demand from AI datacenters.",
      "FSD/Robotaxi: a positive regulatory inflection (a single state-by-state unlock) is a step-function in valuation.",
      "Vertical integration on 4680 cells, lithium refining, casting — operating leverage no legacy OEM can match.",
    ],
    bearCase: [
      "Auto delivery growth has decelerated; price cuts pressure gross margin.",
      "Chinese EV competition (BYD, Xiaomi) is structural, not cyclical.",
      "Optimus + Robotaxi multiples already priced — execution risk one-sided.",
      "Founder key-person risk + governance pay package overhang.",
    ],
    metrics: [
      { label: "Vehicles delivered (TTM)", value: "~1.8M" },
      { label: "Energy deployed (TTM)", value: "~38 GWh" },
      { label: "Gross margin (auto, ex-credits)", value: "~17%" },
      { label: "Cash & equivalents", value: "~$33B" },
    ],
    catalysts: [
      { date: "2026-Q3", label: "Optimus V3 production target", confidence: "medium" },
      { date: "2026-Q4", label: "Robotaxi network expansion beyond Austin/Bay Area", confidence: "medium" },
      { date: "2026-2027", label: "Giga Mexico groundbreaking", confidence: "speculative" },
    ],
    competitors: ["NVDA", "AVGO"],
    relatedSites: ["gigafactory-texas", "gigafactory-nevada", "gigafactory-berlin", "gigafactory-shanghai", "gigafactory-mexico"],
    relatedProducts: ["model-y", "model-3", "cybertruck", "cybercab", "optimus", "megapack", "powerwall", "4680", "supercharger-v4"],
    accent: "#e31937",
    featured: true,
    lastVerified: "2026-05-22",
  },
  // SpaceX is private — placeholder for future tender-offer secondary tracking.
  // xAI is private — same.
  // Neuralink is private — same.

  // ─────────────────────── SEMIS & AI COMPUTE ───────────────────────
  {
    symbol: "NVDA",
    yahooSymbol: "NVDA",
    name: "NVIDIA Corporation",
    shortName: "NVIDIA",
    exchange: "NASDAQ",
    hq: "Santa Clara, CA",
    ceo: "Jensen Huang",
    founded: 1993,
    website: "https://www.nvidia.com",
    sectors: ["semis-ai", "robotics-ai"],
    marketCapB: 3400,
    marketCapAsOf: "2026-05",
    thesis:
      "NVIDIA owns the de-facto standard AI compute stack — hardware (Blackwell, Rubin), networking (NVLink, Spectrum-X), and software (CUDA, NIM). Every hyperscaler capex dollar still routes through it.",
    bullCase: [
      "Blackwell ramp is the largest product cycle in semiconductor history; Rubin succeeds it on a 1-year cadence.",
      "Sovereign AI buildouts (Middle East, India, Europe) are an entirely new demand pool, separate from US hyperscalers.",
      "CUDA moat: switching costs measured in re-engineering man-years.",
      "Robotics platform (Cosmos, Isaac, GR00T) opens a second product line beyond data-center GPUs.",
    ],
    bearCase: [
      "Hyperscaler in-house silicon (Trainium, TPU, MTIA) is closing the gap each generation.",
      "Cyclical risk — any whiff of capex digestion compresses the multiple violently.",
      "Concentration: top 4 customers ~40% of data-center revenue.",
      "China revenue capped by export controls; sovereign AI demand has to backfill.",
    ],
    metrics: [
      { label: "Data Center revenue (latest Q)", value: "~$36B", note: "vs $4B Q4-FY23" },
      { label: "Gross margin", value: "~73%" },
      { label: "Hopper → Blackwell shipping", value: "Yes" },
      { label: "Rubin tape-out", value: "1H 2026" },
    ],
    catalysts: [
      { date: "2026-Q3", label: "Rubin GB-series production ramp", confidence: "high" },
      { date: "2026-Q4", label: "Sovereign-AI Middle East commit announcements", confidence: "medium" },
      { date: "2027", label: "Vera Rubin Ultra (CY27)", confidence: "medium" },
    ],
    competitors: ["AMD", "AVGO", "ARM", "TSLA"],
    accent: "#76b900",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "AMD",
    yahooSymbol: "AMD",
    name: "Advanced Micro Devices",
    shortName: "AMD",
    exchange: "NASDAQ",
    hq: "Santa Clara, CA",
    ceo: "Lisa Su",
    founded: 1969,
    website: "https://www.amd.com",
    sectors: ["semis-ai"],
    marketCapB: 250,
    marketCapAsOf: "2026-05",
    thesis:
      "The credible #2 AI accelerator vendor. MI300/MI325/MI350 has won real hyperscaler design-ins; ROCm 6 finally narrows the CUDA gap.",
    bullCase: [
      "Hyperscalers explicitly want NVDA optionality — AMD is the only volume alternative.",
      "Xilinx integration (FPGA) + Pensando (DPU) gives a credible full-stack data-center pitch.",
      "Server CPU share (EPYC) keeps taking points from Intel.",
    ],
    bearCase: [
      "Software ecosystem still ~18 months behind CUDA.",
      "Margin profile structurally lower than NVDA.",
      "Client/gaming GPU is share-loss vs NVDA at the high end.",
    ],
    catalysts: [
      { date: "2026-Q3", label: "MI400 series launch", confidence: "medium" },
    ],
    competitors: ["NVDA", "AVGO", "ARM"],
    accent: "#ed1c24",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "AVGO",
    yahooSymbol: "AVGO",
    name: "Broadcom Inc.",
    shortName: "Broadcom",
    exchange: "NASDAQ",
    hq: "Palo Alto, CA",
    ceo: "Hock Tan",
    founded: 1991,
    website: "https://www.broadcom.com",
    sectors: ["semis-ai"],
    marketCapB: 900,
    marketCapAsOf: "2026-05",
    thesis:
      "The picks-and-shovels play on hyperscaler custom silicon. AVGO designs the in-house chips (Google TPU, Meta MTIA) — every dollar that leaves NVDA partially lands here.",
    bullCase: [
      "Custom ASIC business growing 60%+ YoY across multiple hyperscaler accounts.",
      "Networking (Tomahawk, Jericho) is the only credible NVLink alternative for scale-out.",
      "VMware subscription transition fully de-risked, cash gusher.",
    ],
    bearCase: [
      "Customer concentration extreme — Google + Meta + ByteDance dominate ASIC pipeline.",
      "VMware customer churn risk at renewal.",
    ],
    competitors: ["NVDA", "MRVL"],
    accent: "#cc092f",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "TSM",
    yahooSymbol: "TSM",
    name: "Taiwan Semiconductor Manufacturing",
    shortName: "TSMC",
    exchange: "NYSE",
    hq: "Hsinchu, Taiwan",
    ceo: "C.C. Wei",
    founded: 1987,
    website: "https://www.tsmc.com",
    sectors: ["semis-ai"],
    marketCapB: 1100,
    marketCapAsOf: "2026-05",
    thesis:
      "The single most important industrial asset in the global AI supply chain. ~90% share of leading-edge logic (5nm, 3nm, 2nm). N2 ramp in 2026 is the next inflection.",
    bullCase: [
      "CoWoS advanced packaging capacity is the literal bottleneck on NVDA shipments — TSM owns it.",
      "N2 / N2P node leadership through 2027.",
      "Arizona Fab 21 ramping, de-risks Taiwan single-point-of-failure narrative.",
    ],
    bearCase: [
      "Geopolitical tail risk dwarfs all other variables.",
      "Capex intensity rising — N2 fab is ~$25-30B per shell.",
      "Customer concentration on a small set of hyperscaler + Apple programs.",
    ],
    catalysts: [
      { date: "2026-2H", label: "N2 (2nm) HVM start", confidence: "high" },
      { date: "2027", label: "A16 with backside power", confidence: "medium" },
    ],
    competitors: ["INTC"],
    accent: "#cc0033",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "ASML",
    yahooSymbol: "ASML",
    name: "ASML Holding NV",
    shortName: "ASML",
    exchange: "AMS",
    hq: "Veldhoven, Netherlands",
    ceo: "Christophe Fouquet",
    founded: 1984,
    website: "https://www.asml.com",
    sectors: ["semis-ai"],
    marketCapB: 320,
    marketCapAsOf: "2026-05",
    thesis:
      "Monopoly supplier of EUV lithography. No EUV, no leading-edge chips. Period. High-NA EUV (EXE:5000) is the only path to sub-2nm at volume.",
    bullCase: [
      "Zero credible competitor in EUV. Tooling backlog stretches years.",
      "High-NA EUV systems at ~$380M each, multiple per fab.",
      "Service + spare parts is a growing recurring revenue stream.",
    ],
    bearCase: [
      "Export controls cut off a large share of China revenue.",
      "Lumpy bookings — single quarter swings spook the market.",
      "Customer capex digestion risk in any AI slowdown.",
    ],
    competitors: [],
    accent: "#005bbb",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "005930.KS",
    yahooSymbol: "005930.KS",
    name: "Samsung Electronics",
    shortName: "Samsung",
    exchange: "KRX",
    hq: "Suwon, South Korea",
    ceo: "Han Jong-hee / Jay Y. Lee (chairman)",
    founded: 1969,
    website: "https://www.samsung.com",
    sectors: ["semis-ai"],
    marketCapB: 380,
    marketCapAsOf: "2026-05",
    thesis:
      "The conglomerate behind HBM, NAND, smartphones, and a struggling-but-strategically-essential foundry. HBM3E qualification at NVIDIA is the single most-watched catalyst on KOSPI.",
    bullCase: [
      "HBM3E 12-high qualification at NVIDIA would re-rate the entire memory franchise.",
      "Foundry 2nm GAA ramp gives a second leading-edge supplier outside TSM.",
      "DRAM/NAND cycle inflecting positively after multi-year correction.",
    ],
    bearCase: [
      "HBM share lost decisively to Hynix; recovery is hope, not visibility.",
      "Foundry yields trail TSM N3 by meaningful margin — burning cash to catch up.",
      "Governance, KOSPI discount, won FX drag on reported earnings.",
    ],
    metrics: [
      { label: "HBM market share", value: "~30%", note: "vs Hynix ~55%" },
      { label: "Foundry node leading edge", value: "3nm GAA" },
    ],
    catalysts: [
      { date: "2026-2H", label: "HBM3E 12-Hi NVDA qualification", confidence: "medium" },
      { date: "2026-Q4", label: "2nm foundry HVM start", confidence: "medium" },
    ],
    competitors: ["000660.KS", "MU", "TSM"],
    accent: "#1428a0",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "000660.KS",
    yahooSymbol: "000660.KS",
    name: "SK Hynix Inc.",
    shortName: "SK Hynix",
    exchange: "KRX",
    hq: "Icheon, South Korea",
    ceo: "Kwak Noh-Jung",
    founded: 1983,
    website: "https://www.skhynix.com",
    sectors: ["semis-ai"],
    marketCapB: 170,
    marketCapAsOf: "2026-05",
    thesis:
      "The HBM winner. >50% market share in HBM3/HBM3E, sole qualified supplier on multiple NVIDIA SKUs through 2025. The cleanest pure-play on AI memory demand.",
    bullCase: [
      "HBM revenue mix shifting capacity off of commodity DRAM = structurally higher margins.",
      "HBM4 sampling 2026; co-development with NVIDIA + TSMC packaging.",
      "Sole-source position on key Blackwell SKUs.",
    ],
    bearCase: [
      "Samsung qualification at NVIDIA would compress share.",
      "Commodity DRAM exposure still ~50% of mix.",
      "Capex intensity rising fast to keep HBM lead.",
    ],
    metrics: [
      { label: "HBM market share", value: "~55%" },
      { label: "HBM revenue YoY", value: "+200%+" },
    ],
    catalysts: [
      { date: "2026-Q2", label: "HBM4 sampling", confidence: "high" },
      { date: "2026-2H", label: "M15X HBM fab ramp", confidence: "high" },
    ],
    competitors: ["005930.KS", "MU"],
    accent: "#ff0027",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "MU",
    yahooSymbol: "MU",
    name: "Micron Technology",
    shortName: "Micron",
    exchange: "NASDAQ",
    hq: "Boise, ID",
    ceo: "Sanjay Mehrotra",
    founded: 1978,
    website: "https://www.micron.com",
    sectors: ["semis-ai"],
    marketCapB: 130,
    marketCapAsOf: "2026-05",
    thesis:
      "The US memory champion. HBM3E qualified at NVIDIA, sole US-headquartered HBM supplier. CHIPS Act money + Idaho/NY fab buildouts are a multi-year capex story.",
    bullCase: [
      "HBM3E qualified at NVDA, real revenue contribution in 2025-2026.",
      "US fab buildouts politically protected; supply-chain diversification premium.",
      "HBM mix shift compresses bit-supply for commodity DRAM — tightens entire memory cycle.",
    ],
    bearCase: [
      "Trails Hynix in HBM capacity and roadmap by ~6 months.",
      "Capex burn through cycle trough.",
    ],
    competitors: ["005930.KS", "000660.KS"],
    accent: "#0066b2",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "ARM",
    yahooSymbol: "ARM",
    name: "Arm Holdings plc",
    shortName: "Arm",
    exchange: "NASDAQ",
    hq: "Cambridge, UK",
    ceo: "Rene Haas",
    founded: 1990,
    website: "https://www.arm.com",
    sectors: ["semis-ai"],
    marketCapB: 140,
    marketCapAsOf: "2026-05",
    thesis:
      "Royalty-on-everything model. v9 IP attach rate rising; Arm CPU showing up in NVIDIA Grace, AWS Graviton, every smartphone. Data-center CPU share is the upside lever.",
    bullCase: [
      "v9 royalty rate ~2x v8 — pure margin uplift as installed base rolls.",
      "Data-center CPU on Arm (Grace, Graviton, Cobalt) growing >50% YoY.",
      "SoftBank umbrella, AI infrastructure cross-pollination.",
    ],
    bearCase: [
      "Customer concentration on smartphone royalties.",
      "RISC-V long-tail threat in cost-sensitive endpoints.",
      "Valuation already prices high success.",
    ],
    competitors: ["NVDA", "AMD"],
    accent: "#0091bd",
    lastVerified: "2026-05-22",
  },

  // ─────────────────────── QUANTUM ───────────────────────
  {
    symbol: "RGTI",
    yahooSymbol: "RGTI",
    name: "Rigetti Computing",
    shortName: "Rigetti",
    exchange: "NASDAQ",
    hq: "Berkeley, CA",
    ceo: "Subodh Kulkarni",
    founded: 2013,
    website: "https://www.rigetti.com",
    sectors: ["quantum"],
    marketCapB: 5,
    marketCapAsOf: "2026-05",
    thesis:
      "Superconducting-qubit pure-play. 84-qubit Ankaa-3 deployed; roadmap targets 1000+ qubits by 2027. Highly retail-flow driven, milestone press = 30-50% moves.",
    bullCase: [
      "Modular chip architecture — scaling path that doesn't require monolithic dies.",
      "DARPA/AFRL contracts validate technical credibility.",
      "Highly volatile, optionality-style position sizing works.",
    ],
    bearCase: [
      "Pre-revenue at meaningful scale; going-concern dilution risk.",
      "Superconducting approach vs trapped-ion (IONQ) — winner unclear.",
      "Quantum advantage timeline still 3-7 years out.",
    ],
    catalysts: [
      { date: "2026", label: "Ankaa-3 84Q public benchmarking", confidence: "medium" },
      { date: "2027", label: "1000+ qubit modular system", confidence: "speculative" },
    ],
    competitors: ["IONQ", "QBTS", "ARQQ"],
    accent: "#7b2dbd",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "IONQ",
    yahooSymbol: "IONQ",
    name: "IonQ Inc.",
    shortName: "IonQ",
    exchange: "NYSE",
    hq: "College Park, MD",
    ceo: "Niccolo de Masi",
    founded: 2015,
    website: "https://ionq.com",
    sectors: ["quantum"],
    marketCapB: 9,
    marketCapAsOf: "2026-05",
    thesis:
      "Trapped-ion quantum leader, the largest pure-play by market cap. Tempo system (64+ AQ) targets commercial advantage by 2027.",
    bullCase: [
      "Trapped ion = naturally identical qubits, highest fidelity in industry.",
      "Cloud partnerships (AWS Braket, Azure Quantum, GCP).",
      "Acquisitions (Qubitekk, ID Quantique) build networking moat.",
    ],
    bearCase: [
      "Trapped-ion gate speed slower than superconducting — error rate advantage may not compensate at scale.",
      "Premium valuation vs peers, leaves no error margin.",
      "Pre-meaningful revenue; quarterly losses widen with R&D.",
    ],
    catalysts: [
      { date: "2026", label: "Tempo (#AQ 64) commercial deployment", confidence: "medium" },
      { date: "2027", label: "Networked quantum demo", confidence: "speculative" },
    ],
    competitors: ["RGTI", "QBTS", "ARQQ"],
    accent: "#9b51e0",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "QBTS",
    yahooSymbol: "QBTS",
    name: "D-Wave Quantum Inc.",
    shortName: "D-Wave",
    exchange: "NYSE",
    hq: "Burnaby, BC, Canada",
    ceo: "Alan Baratz",
    founded: 1999,
    website: "https://www.dwavequantum.com",
    sectors: ["quantum"],
    marketCapB: 2.5,
    marketCapAsOf: "2026-05",
    thesis:
      "Annealing quantum (not gate-model). The cynic's quantum stock — actually has revenue and customers (Mastercard, Pattison Food). Advantage2 system in 2025.",
    bullCase: [
      "Actual commercial revenue, not just contracts.",
      "Annealing solves real optimization problems today — no need to wait for fault tolerance.",
      "Gate-model R&D as second product line.",
    ],
    bearCase: [
      "Annealing seen as 'lesser' quantum — narrative discount persists.",
      "TAM of pure optimization is small vs general-purpose quantum.",
    ],
    competitors: ["RGTI", "IONQ"],
    accent: "#5e35b1",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "ARQQ",
    yahooSymbol: "ARQQ",
    name: "Arqit Quantum Inc.",
    shortName: "Arqit",
    exchange: "NASDAQ",
    hq: "London, UK",
    ceo: "Andy Leaver",
    founded: 2017,
    website: "https://arqit.uk",
    sectors: ["quantum"],
    marketCapB: 0.3,
    marketCapAsOf: "2026-05",
    thesis:
      "Quantum-safe encryption (QuantumCloud). Sells symmetric key infrastructure to telcos and defense — not a quantum computer at all. High-beta retail name.",
    bullCase: [
      "Real cybersecurity product with telco contracts.",
      "Post-quantum cryptography mandate (NSA CNSA 2.0) is a structural tailwind.",
    ],
    bearCase: [
      "Tiny revenue, repeated capital raises.",
      "Crowded post-quantum crypto space with bigger incumbents.",
    ],
    competitors: ["IONQ", "RGTI"],
    accent: "#ad1457",
    lastVerified: "2026-05-22",
  },

  // ─────────────────────── CRITICAL MATERIALS ───────────────────────
  {
    symbol: "CRML",
    yahooSymbol: "CRML",
    name: "Critical Metals Corp.",
    shortName: "Critical Metals",
    exchange: "NASDAQ",
    hq: "New York, NY",
    ceo: "Tony Sage",
    founded: 2021,
    website: "https://www.criticalmetalscorp.com",
    sectors: ["critical-materials"],
    marketCapB: 0.6,
    marketCapAsOf: "2026-05",
    thesis:
      "Greenland-based Tanbreez rare-earth deposit + Wolfsberg lithium in Austria. The 'allied-nation REE' thesis — i.e., not-China supply for defense + EVs.",
    bullCase: [
      "Tanbreez may be one of the largest REE deposits outside China.",
      "Trump-era Greenland focus = political tailwind for permits and DoD funding.",
      "Wolfsberg lithium has European OEM offtake interest.",
    ],
    bearCase: [
      "Tiny float, extreme volatility, dilution-prone.",
      "Mining permits in Greenland are still 5-10 year timelines.",
      "Rare-earth pricing remains structurally depressed vs early-2020s peaks.",
    ],
    catalysts: [
      { date: "2026-2H", label: "Tanbreez resource update", confidence: "medium" },
      { date: "2026-2027", label: "Wolfsberg construction decision", confidence: "speculative" },
    ],
    competitors: ["MP", "ALB", "SQM"],
    accent: "#bf5600",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "MP",
    yahooSymbol: "MP",
    name: "MP Materials Corp.",
    shortName: "MP Materials",
    exchange: "NYSE",
    hq: "Las Vegas, NV",
    ceo: "James Litinsky",
    founded: 2017,
    website: "https://mpmaterials.com",
    sectors: ["critical-materials"],
    marketCapB: 3,
    marketCapAsOf: "2026-05",
    thesis:
      "Mountain Pass — the only operating REE mine in the US. Stage II (oxide separation in Mountain Pass) + Stage III (magnets in Fort Worth) = full-stack US rare-earth supply.",
    bullCase: [
      "DoD as anchor customer + GM offtake agreement.",
      "Fort Worth magnet plant first US NdFeB magnet production at scale.",
      "Structural China-decoupling tailwind for any non-China REE.",
    ],
    bearCase: [
      "REE pricing weak — Stage II margin pressured.",
      "Magnet plant ramp execution risk.",
    ],
    competitors: ["CRML"],
    accent: "#d35400",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "ALB",
    yahooSymbol: "ALB",
    name: "Albemarle Corporation",
    shortName: "Albemarle",
    exchange: "NYSE",
    hq: "Charlotte, NC",
    ceo: "Kent Masters",
    founded: 1994,
    website: "https://www.albemarle.com",
    sectors: ["critical-materials"],
    marketCapB: 12,
    marketCapAsOf: "2026-05",
    thesis:
      "Largest US-listed lithium pure-play. Salar + spodumene assets, integrated converter. Trading on lithium spot, not company-specific dynamics.",
    bullCase: [
      "Lithium price likely past structural lows; EV demand re-accelerating.",
      "Integrated rock-to-hydroxide profile commands premium vs miners.",
    ],
    bearCase: [
      "Lithium supply still growing > demand near-term.",
      "China refining dominance compresses Western converter margin.",
    ],
    competitors: ["SQM", "CRML"],
    accent: "#1a8a47",
    lastVerified: "2026-05-22",
  },

  // ─────────────────────── DEFENSE & SPACE ───────────────────────
  {
    symbol: "PLTR",
    yahooSymbol: "PLTR",
    name: "Palantir Technologies",
    shortName: "Palantir",
    exchange: "NASDAQ",
    hq: "Denver, CO",
    ceo: "Alex Karp",
    founded: 2003,
    website: "https://www.palantir.com",
    sectors: ["defense-space", "robotics-ai"],
    marketCapB: 280,
    marketCapAsOf: "2026-05",
    thesis:
      "Software layer of US/NATO defense + the breakout enterprise AI deployment story (AIP). Highest-multiple defense name because revenue is software, not metal.",
    bullCase: [
      "AIP closing 7-figure commercial deals at unprecedented sales velocity.",
      "Defense contracts shifting from cost-plus to outcome — Palantir advantage.",
      "Founder-led ideological alignment with US national security state.",
    ],
    bearCase: [
      "Valuation > 50x sales — leaves no execution margin.",
      "Commercial growth deceleration would compress the multiple violently.",
    ],
    competitors: ["NVDA"],
    accent: "#0e1c2b",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "RKLB",
    yahooSymbol: "RKLB",
    name: "Rocket Lab USA",
    shortName: "Rocket Lab",
    exchange: "NASDAQ",
    hq: "Long Beach, CA",
    ceo: "Peter Beck",
    founded: 2006,
    website: "https://www.rocketlabusa.com",
    sectors: ["defense-space"],
    marketCapB: 12,
    marketCapAsOf: "2026-05",
    thesis:
      "Closest public-market analog to SpaceX. Electron operational; Neutron (medium-lift) maiden launch is the binary catalyst. Space-systems vertical integration (Photon, components) is real revenue.",
    bullCase: [
      "Neutron maiden flight could re-rate the entire name 50-100%.",
      "Space systems segment already meaningful revenue base.",
      "DoD/NRO customer mix improves duration of contracts.",
    ],
    bearCase: [
      "Neutron schedule has slipped multiple times.",
      "Cash burn meaningful until Neutron operational + space systems scale.",
    ],
    catalysts: [
      { date: "2026", label: "Neutron maiden launch", confidence: "medium" },
    ],
    accent: "#000000",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "LMT",
    yahooSymbol: "LMT",
    name: "Lockheed Martin",
    shortName: "Lockheed",
    exchange: "NYSE",
    hq: "Bethesda, MD",
    ceo: "Jim Taiclet",
    founded: 1995,
    website: "https://www.lockheedmartin.com",
    sectors: ["defense-space"],
    marketCapB: 110,
    marketCapAsOf: "2026-05",
    thesis:
      "F-35 monopoly + hypersonics + Aegis. Boring but inevitable; defense budget tailwind from Replicator + Ukraine + Indo-Pacific posture.",
    bullCase: [
      "F-35 sustainment + Block 4 upgrades = decades of locked-in revenue.",
      "Hypersonic test cadence accelerating; multiple programs of record.",
    ],
    bearCase: [
      "Margin compression on fixed-price programs.",
      "Production-cost reform pressure from DoD.",
    ],
    accent: "#003366",
    lastVerified: "2026-05-22",
  },

  // ─────────────────────── FUSION / NUCLEAR ───────────────────────
  {
    symbol: "OKLO",
    yahooSymbol: "OKLO",
    name: "Oklo Inc.",
    shortName: "Oklo",
    exchange: "NYSE",
    hq: "Santa Clara, CA",
    ceo: "Jacob DeWitte",
    founded: 2013,
    website: "https://oklo.com",
    sectors: ["fusion-nuclear"],
    marketCapB: 7,
    marketCapAsOf: "2026-05",
    thesis:
      "Small modular reactor (SMR) micro-design (Aurora). Sam Altman-chaired prior to IPO. The poster child for the 'AI needs power' nuclear trade.",
    bullCase: [
      "First Aurora deployment at INL could re-rate the entire SMR space.",
      "Hyperscaler PPAs becoming a real customer pipeline.",
    ],
    bearCase: [
      "NRC licensing schedule slippage risk — first DCA was rejected.",
      "Pre-revenue, cash-burn dependent on capital markets.",
    ],
    catalysts: [
      { date: "2027-2028", label: "INL Aurora first deployment target", confidence: "speculative" },
    ],
    competitors: ["SMR"],
    accent: "#00875a",
    featured: true,
    lastVerified: "2026-05-22",
  },
  {
    symbol: "SMR",
    yahooSymbol: "SMR",
    name: "NuScale Power Corporation",
    shortName: "NuScale",
    exchange: "NYSE",
    hq: "Portland, OR",
    ceo: "John Hopkins",
    founded: 2007,
    website: "https://www.nuscalepower.com",
    sectors: ["fusion-nuclear"],
    marketCapB: 3,
    marketCapAsOf: "2026-05",
    thesis:
      "Only NRC design-certified SMR in the US (VOYGR). UAMPS project cancelled was a setback; new utility customers needed to validate.",
    bullCase: [
      "Only certified design = first to deploy at scale if a customer commits.",
      "Hyperscaler nuclear PPA wave plays directly to design-certified incumbents.",
    ],
    bearCase: [
      "Lost flagship UAMPS customer.",
      "Cost overruns spooked the original utility consortium.",
    ],
    competitors: ["OKLO"],
    accent: "#00b894",
    lastVerified: "2026-05-22",
  },
  {
    symbol: "CCJ",
    yahooSymbol: "CCJ",
    name: "Cameco Corporation",
    shortName: "Cameco",
    exchange: "NYSE",
    hq: "Saskatoon, Canada",
    ceo: "Tim Gitzel",
    founded: 1988,
    website: "https://www.cameco.com",
    sectors: ["fusion-nuclear"],
    marketCapB: 25,
    marketCapAsOf: "2026-05",
    thesis:
      "Largest publicly-traded uranium miner in the Western world. Cigar Lake + McArthur River + Westinghouse stake = full-stack nuclear fuel cycle.",
    bullCase: [
      "Uranium spot still well below incentive price for new mines.",
      "Westinghouse stake captures downstream value as reactor fleet grows.",
      "Long-term contracted volume re-prices upward into structural deficit.",
    ],
    bearCase: [
      "Kazatomprom supply surprise downside.",
      "Mining cost inflation real.",
    ],
    accent: "#fdb913",
    lastVerified: "2026-05-22",
  },
];

// ────────────────────────── helpers ──────────────────────────

export function listTickers(): Ticker[] {
  return TICKERS;
}

export function getTicker(symbol: string): Ticker | undefined {
  const s = symbol.toUpperCase();
  return TICKERS.find((t) => t.symbol.toUpperCase() === s);
}

/** url-safe slug for [symbol] route. Replaces "." with "-" so "005930.KS" → "005930-ks" */
export function tickerHref(t: Ticker): string {
  return `/ticker/${t.symbol.toLowerCase().replace(/\./g, "-")}`;
}

export function tickerSlugToSymbol(slug: string): string {
  // accept either canonical (e.g. "tsla") or dotted-flattened ("005930-ks")
  const upper = slug.toUpperCase();
  // try direct match first
  const direct = TICKERS.find((t) => t.symbol.toUpperCase() === upper);
  if (direct) return direct.symbol;
  // try dash → dot
  const dotted = upper.replace(/-/g, ".");
  const dot = TICKERS.find((t) => t.symbol.toUpperCase() === dotted);
  return dot?.symbol ?? upper;
}

export function tickersBySector(id: SectorId): Ticker[] {
  return TICKERS.filter((t) => t.sectors.includes(id));
}

export function getSector(id: SectorId): Sector | undefined {
  return SECTORS.find((s) => s.id === id);
}

export function featuredTickers(): Ticker[] {
  return TICKERS.filter((t) => t.featured);
}
