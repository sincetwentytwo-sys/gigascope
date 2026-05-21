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
  | "robotics-ai"
  | "batteries-ev"
  | "korea-industrial"
  | "china-tech"
  | "hyperscalers";

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

export interface Source {
  /** Display label, e.g. "Tesla 10-K FY2024" */
  label: string;
  url: string;
  /** Tier 1 = SEC/DART/IR/government/whitepaper, Tier 2 = vetted trade press, Tier 3 = general media */
  tier?: 1 | 2 | 3;
}

export interface Facility {
  name: string;
  city: string;
  country: string;
  flag?: string;
  lat: number;
  lng: number;
  status: "operational" | "construction" | "expanding" | "announced" | "planned";
  blurb?: string;
  /** Linked factory slug (if present in src/data/factories.ts) so we can deep-link to /site/[slug] */
  siteSlug?: string;
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
  /** Primary-source citations rendered in the company-page sidebar. */
  sources?: Source[];
  /** Major physical facilities — used by /company/[slug] map. */
  facilities?: Facility[];
  /** Optional alias in Korean — surfaces on the page header. */
  koreanName?: string;
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
  {
    id: "batteries-ev",
    name: "Batteries & EVs",
    blurb: "Cell makers + EV majors — LFP/NMC, solid-state, gigafactories.",
    longBlurb:
      "The physical-layer enablers of electrification. Korean trio (LGES / Samsung SDI / SK On) plus CATL and BYD dominate global cell output. Solid-state (QuantumScape) is the option-value contender.",
    color: "#0066cc",
    icon: "🔋",
  },
  {
    id: "korea-industrial",
    name: "Korea Industrial",
    blurb: "Hyundai, Hanwha, LIG Nex1 — chaebol champions in EV, defense, energy.",
    longBlurb:
      "Korean industrial chaebols on the KOSPI. Hyundai Motor (EV/robotics — Boston Dynamics), Hanwha Aerospace (defense + space), LIG Nex1 (missiles). Underfollowed in English-language coverage — primary-source advantage from DART.",
    color: "#003478",
    icon: "🇰🇷",
  },
  {
    id: "china-tech",
    name: "China Tech",
    blurb: "BYD, CATL, SMIC — the parallel industrial complex.",
    longBlurb:
      "Geopolitically sensitive but unavoidable for global supply-chain mapping. Tracked with primary-source caveats; export controls, sanctions, and listing-venue (HKEX vs Shenzhen vs ADR) all noted per name.",
    color: "#e60012",
    icon: "🇨🇳",
  },
  {
    id: "hyperscalers",
    name: "Hyperscalers",
    blurb: "MSFT, GOOG, META, AMZN — they fund the whole AI build-out.",
    longBlurb:
      "The 4 US hyperscalers collectively guide ~$300-350B in capex for 2025-2026, with the AI-infra share above 60%. Every other company in the Atlas — chips, memory, lithography, packaging, datacenter real estate, nuclear PPAs, rare earths — gets paid downstream of these four. Track the capex calls, not just earnings.",
    color: "#0066cc",
    icon: "☁️",
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
    deepDive:
      "Tesla today is not a single product company; it is four optionalities stapled together with a profitable auto business funding the rest. The first leg is automotive — Model Y is the best-selling vehicle on Earth, and a sub-$30K Model 2-class platform manufactured at the Berlin and (eventually) Mexico gigafactories is the next volume unlock. The second leg is energy storage — Megapack and Powerwall are growing >50% YoY, structurally tied to the new utility load from AI data centers and the broader grid-firming buildout. The third leg is FSD/Robotaxi: a regulatory unlock state-by-state would convert a software franchise that exists today (~6M vehicles with FSD-capable hardware) into a per-mile economic engine; the latency between regulatory event and revenue ramp is the variable. The fourth and most contested leg is Optimus — at any plausible production cost (Musk's stated <$20K target), every TAM assumption in robotics is upside, but the dispersion of outcomes is enormous. The vertical integration story — 4680 cell pack, lithium refining, casting, motor magnets, in-house compute (Dojo) — is the actual moat. Tesla doesn't have to beat BYD on cost in China; it has to extract margin per car globally while compounding the rest, which is what the Q3-Q4 2025 earnings prints have shown. The bear case is real (decelerating auto growth, Chinese price war, founder governance overhang), but a sum-of-the-parts that gives any non-zero value to Optimus and FSD makes the multiple defensible.",
    facilities: [
      { name: "Gigafactory Texas", city: "Austin", country: "USA", flag: "🇺🇸", lat: 30.2225, lng: -97.6172, status: "operational", siteSlug: "gigafactory-texas", blurb: "Model Y, Cybertruck, 4680 cells, Optimus pilot line." },
      { name: "Gigafactory Nevada", city: "Reno", country: "USA", flag: "🇺🇸", lat: 39.5388, lng: -119.4424, status: "operational", siteSlug: "gigafactory-nevada", blurb: "Battery cells, Semi, drive units." },
      { name: "Gigafactory Berlin-Brandenburg", city: "Grünheide", country: "Germany", flag: "🇩🇪", lat: 52.4067, lng: 13.7841, status: "operational", siteSlug: "gigafactory-berlin", blurb: "Model Y for EU." },
      { name: "Gigafactory Shanghai", city: "Shanghai", country: "China", flag: "🇨🇳", lat: 31.0011, lng: 121.7654, status: "operational", siteSlug: "gigafactory-shanghai", blurb: "Model 3 / Y for China + export." },
      { name: "Gigafactory Mexico", city: "Monterrey", country: "Mexico", flag: "🇲🇽", lat: 25.7847, lng: -100.3897, status: "announced", siteSlug: "gigafactory-mexico", blurb: "Next-gen low-cost platform (Model 2)." },
    ],
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
    deepDive:
      "NVIDIA is the closest thing the AI build-out has to a monopoly node. The stack is hardware (Hopper → Blackwell B100/B200 → Rubin GB300 → Vera Rubin Ultra on a 1-year cadence), networking (NVLink, NVSwitch, Spectrum-X, Quantum InfiniBand from the Mellanox acquisition), and software (CUDA, cuDNN, TensorRT, NIM microservices, Omniverse). Each layer reinforces the others: CUDA is the world's most-installed parallel computing platform, with switching costs measured in re-engineering man-years; NVLink scale-out is the only credible answer to multi-rack training topologies; the Spectrum-X Ethernet fabric extends the moat into hyperscalers that won't tolerate vendor lock-in on networking. Demand is structurally bifurcated: top-4 hyperscaler customers still ~40% of data-center revenue, but sovereign AI buildouts (Saudi Arabia HUMAIN, UAE G42, Japan, India, France) are scaling into a distinct demand pool that backfills any single-customer compression. The robotics platform (Cosmos foundation model + Isaac Sim + GR00T humanoid models + DRIVE AV) is a second product line still in its early innings. The bear case rests on hyperscaler in-house silicon (Google TPU v5/v6, AWS Trainium, Meta MTIA) eventually closing the per-watt-per-dollar gap, plus cyclical capex digestion. Both are real, but the cadence of architecture refresh (Blackwell → Rubin → Rubin Ultra → Feynman) keeps NVIDIA a generation ahead on the compounding 4D variable: chip, package, system, software. The 73% gross margin on data center is the proof — NVIDIA prices the way only a monopoly can.",
    sources: [
      { label: "NVIDIA 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001045810&type=10-K", tier: 1 },
      { label: "NVIDIA IR — Quarterly results", url: "https://investor.nvidia.com/financial-info/quarterly-results/default.aspx", tier: 1 },
      { label: "NVIDIA GTC keynotes (technical roadmap)", url: "https://www.nvidia.com/gtc/", tier: 1 },
      { label: "Blackwell architecture whitepaper", url: "https://resources.nvidia.com/en-us-blackwell-architecture", tier: 1 },
    ],
    facilities: [
      { name: "NVIDIA HQ (Endeavor + Voyager)", city: "Santa Clara", country: "USA", flag: "🇺🇸", lat: 37.3697, lng: -121.9594, status: "operational", blurb: "R&D headquarters, no fab — fab-less designer." },
      { name: "Israel R&D (ex-Mellanox)", city: "Yokneam", country: "Israel", flag: "🇮🇱", lat: 32.6601, lng: 35.1106, status: "operational", blurb: "Networking (NVLink, Spectrum-X)." },
    ],
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
    deepDive:
      "TSMC is the single most important industrial asset in the global AI supply chain — full stop. ~90% market share in leading-edge logic (5nm, 3nm), exclusive customer for ASML's High-NA EUV systems, and the actual physical bottleneck on every NVIDIA shipment is CoWoS-L advanced packaging capacity (which TSMC owns and is scaling at Longtan + Chiayi + AP6 site selection). The N2 (2nm) node enters HVM in H2-2026, the first node to use Gate-All-Around transistors at TSMC, followed by N2P with backside power delivery (A16) in 2027. Every fabless customer that matters — NVIDIA, Apple, AMD, Qualcomm, Broadcom, MediaTek, Tesla AI4/AI5 — depends on TSMC roadmap discipline. Capital intensity is the bear case: an N2 fab shell now costs ~$25-30B, and TSMC is funding multiple in parallel (Hsinchu, Tainan, Kaohsiung, Arizona Phase 2/3, Kumamoto JASM, Dresden ESMC). Geopolitical tail risk dwarfs every other variable — a Taiwan Strait kinetic event would collapse global tech equity, not just TSMC. The Arizona Fab 21 Phase 1 (N4 production) de-risks the single-point-of-failure narrative incrementally; Phase 2 (N3) and Phase 3 (N2) bring leading-edge to US soil under the CHIPS Act umbrella by 2028-2030. The customer concentration on Apple + NVIDIA + AMD is real, but the substitutes are essentially zero — Samsung Foundry trails by yield, Intel Foundry trails by execution, GlobalFoundries doesn't compete on leading edge. The strategic-asset valuation framework will not break until High-NA EUV monopoly breaks or until 1.4nm-equivalent tape-out at a credible alternative.",
    sources: [
      { label: "TSMC 20-F (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001046179&type=20-F", tier: 1 },
      { label: "TSMC IR — Quarterly results", url: "https://investor.tsmc.com/english/quarterly-results", tier: 1 },
      { label: "TSMC Annual Report", url: "https://investor.tsmc.com/english/annual-reports", tier: 1 },
    ],
    facilities: [
      { name: "Fab 12 / 14 / 18 (Hsinchu-Tainan)", city: "Hsinchu/Tainan", country: "Taiwan", flag: "🇹🇼", lat: 23.0167, lng: 120.2192, status: "operational", blurb: "Leading-edge logic. N3 (2022) and N2 (2025 H2) HVM. CoWoS packaging at Longtan." },
      { name: "Fab 21 Arizona", city: "Phoenix", country: "USA", flag: "🇺🇸", lat: 33.7375, lng: -112.1300, status: "construction", blurb: "Phase 1: N4 (production), Phase 2: N3, Phase 3: N2 — ~$65B total commitment." },
      { name: "Fab 23 Kumamoto (JASM)", city: "Kikuyo", country: "Japan", flag: "🇯🇵", lat: 32.8867, lng: 130.8556, status: "operational", blurb: "JV with Sony / Denso. 28/22nm + 16/12nm. Second fab announced." },
      { name: "Fab 24 Dresden (ESMC)", city: "Dresden", country: "Germany", flag: "🇩🇪", lat: 51.0823, lng: 13.7308, status: "construction", blurb: "JV with Bosch, Infineon, NXP. 28/22nm + 16/12nm for EU automotive." },
    ],
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
    sources: [
      { label: "ASML Annual Report", url: "https://www.asml.com/en/investors/annual-report", tier: 1 },
      { label: "ASML IR — Financial calendar", url: "https://www.asml.com/en/investors", tier: 1 },
      { label: "High-NA EUV (EXE:5000) whitepaper", url: "https://www.asml.com/en/products/euv-lithography-systems/twinscan-exe5000", tier: 1 },
    ],
    facilities: [
      { name: "Veldhoven HQ + factory", city: "Veldhoven", country: "Netherlands", flag: "🇳🇱", lat: 51.4083, lng: 5.4544, status: "operational", blurb: "Primary EUV + DUV assembly. Cleanroom Phase 2 ramping for High-NA." },
      { name: "Wilton CT (US ops)", city: "Wilton", country: "USA", flag: "🇺🇸", lat: 41.1953, lng: -73.4376, status: "operational", blurb: "Cymer light source (acquired 2013)." },
      { name: "Linkou", city: "Linkou", country: "Taiwan", flag: "🇹🇼", lat: 25.0772, lng: 121.3661, status: "operational", blurb: "Customer support hub for TSMC + UMC." },
    ],
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
    koreanName: "삼성전자",
    deepDive:
      "Samsung Electronics is the most strategically complex large-cap on the planet: world #1 in DRAM, #1 in NAND, world #1 smartphone vendor by volume, world #2 in foundry, and increasingly relevant in OLED + appliances + EV batteries (via Samsung SDI, separately listed). The 2026 trade is simple to articulate but binary in outcome: can Samsung pass NVIDIA's HBM3E 12-Hi qualification? Doing so re-rates the entire memory franchise; failing to do so cements SK Hynix's HBM lead through HBM4 (sampling 2026, HVM 2027) and leaves Samsung competing on commodity DRAM bit-supply economics. Foundry is the other binary lever — Samsung's 3nm GAA yields trail TSMC's N3 by a meaningful margin, but the 2nm GAA ramp in H2-2026 plus the Taylor TX fab coming online give two leading-edge alternatives if Samsung executes. The conglomerate discount (KOSPI valuation, governance overhang from the family-control structure, won FX drag on USD-denominated commodity revenues) keeps EV/EBITDA below global peers despite arguably more diversified exposure to every major AI/electrification trade. The Pyeongtaek campus is the largest semiconductor manufacturing site in human history (P1-P5 phases). The bear case is real (HBM execution, foundry yield, China NAND exposure); the bull case is that Samsung is the only company in the world that fabricates both leading-edge logic AND leading-edge memory in-house, which becomes structurally valuable as advanced packaging (HBM-on-logic 3D stacking) becomes the next compute architecture frontier.",
    sources: [
      { label: "Samsung Electronics DART filings", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90", tier: 1 },
      { label: "Samsung IR (English)", url: "https://www.samsung.com/global/ir/", tier: 1 },
      { label: "Samsung Foundry roadmap", url: "https://semiconductor.samsung.com/foundry/", tier: 1 },
    ],
    facilities: [
      { name: "Pyeongtaek Campus (P1–P4)", city: "Pyeongtaek", country: "South Korea", flag: "🇰🇷", lat: 36.9636, lng: 127.0731, status: "operational", blurb: "World's largest semiconductor fab campus. DRAM, NAND, HBM, foundry. P4/P5 under construction." },
      { name: "Hwaseong Campus", city: "Hwaseong", country: "South Korea", flag: "🇰🇷", lat: 37.1992, lng: 127.0744, status: "operational", blurb: "Foundry leading-edge (3nm GAA), memory. R&D center." },
      { name: "Taylor Fab (Texas)", city: "Taylor", country: "USA", flag: "🇺🇸", lat: 30.5708, lng: -97.4093, status: "construction", blurb: "$17B+ fab. 4nm initial, 2nm planned. CHIPS Act funded." },
      { name: "Xi'an NAND Fab", city: "Xi'an", country: "China", flag: "🇨🇳", lat: 34.3416, lng: 108.9398, status: "operational", blurb: "V-NAND. Export-control sensitive." },
    ],
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
    koreanName: "SK하이닉스",
    deepDive:
      "SK Hynix is the cleanest pure-play public-market expression of the AI memory thesis. The company holds ~55% market share in HBM (the high-bandwidth memory stacked on every NVIDIA Hopper and Blackwell SKU), is sole-source on multiple key NVIDIA configurations (B100, B200, GB200), and is co-developing HBM4 directly with NVIDIA + TSMC's CoWoS packaging team. The HBM revenue mix shift is the structural story: HBM commands 3-5× the gross margin of commodity DRAM and absorbs DRAM wafer capacity, which simultaneously tightens the commodity DRAM market and lifts mix-blended margins. The M15X HBM-only fab at the Icheon campus is ramping through 2026, M16 EUV DRAM provides the 1c-node leverage for HBM4 base-die, and the announced $3.87B West Lafayette (Purdue) advanced packaging facility is the first US HBM packaging installation — a strategic hedge against single-country supply concentration. The Korean national strategic Yongin Cluster ($120B+ across 4 new fabs through 2046) anchors capacity through the back half of the decade. The bear case has two legs: (1) Samsung qualifies HBM3E 12-Hi at NVIDIA, which compresses Hynix share toward 40%; (2) the commodity DRAM exposure (still ~50% of mix) is cyclical and any AI-capex digestion ripples through Hynix earnings dramatically. The bull case is that HBM4 development is structurally further ahead than peers, the customer is locked-in for multi-generation development cycles, and the parent company SK Group's chaebol balance sheet absorbs capex intensity that single-product-line peers can't sustain.",
    sources: [
      { label: "SK Hynix DART filings", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=SK%ED%95%98%EC%9D%B4%EB%8B%89%EC%8A%A4", tier: 1 },
      { label: "SK Hynix IR (English)", url: "https://www.skhynix.com/eng/ir/financialStatements.do", tier: 1 },
      { label: "SK Hynix HBM3E announcement", url: "https://news.skhynix.com/", tier: 1 },
    ],
    facilities: [
      { name: "Icheon Campus (M14, M16, M15X)", city: "Icheon", country: "South Korea", flag: "🇰🇷", lat: 37.2614, lng: 127.4814, status: "operational", blurb: "Primary DRAM + HBM site. M15X HBM-only fab ramping. M16 EUV DRAM." },
      { name: "Cheongju Campus (M11, M12, M15)", city: "Cheongju", country: "South Korea", flag: "🇰🇷", lat: 36.6291, lng: 127.4892, status: "operational", blurb: "NAND production. M15 V-NAND." },
      { name: "Yongin Cluster (planned)", city: "Yongin", country: "South Korea", flag: "🇰🇷", lat: 37.2411, lng: 127.1776, status: "planned", blurb: "$120B+ mega-cluster, 4 new fabs through 2046. National strategic project." },
      { name: "West Lafayette (Purdue HBM packaging)", city: "West Lafayette", country: "USA", flag: "🇺🇸", lat: 40.4259, lng: -86.9081, status: "announced", blurb: "$3.87B advanced packaging facility — first US HBM packaging." },
    ],
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
    sources: [
      { label: "Micron 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000723125&type=10-K", tier: 1 },
      { label: "Micron IR", url: "https://investors.micron.com/financial-information/quarterly-results", tier: 1 },
      { label: "Micron Idaho/NY CHIPS Act announcement", url: "https://www.commerce.gov/news/press-releases/2024/12/biden-harris-administration-announces-finalized-625-billion-chips", tier: 1 },
    ],
    facilities: [
      { name: "Boise HQ + Fab 8/9", city: "Boise", country: "USA", flag: "🇺🇸", lat: 43.5826, lng: -116.2230, status: "expanding", blurb: "New Idaho leading-edge fab — first US-HQ DRAM fab in 20+ years." },
      { name: "Clay NY mega-fab (4 fabs)", city: "Clay", country: "USA", flag: "🇺🇸", lat: 43.1854, lng: -76.1849, status: "construction", blurb: "Up to $100B over 20 years. Largest single private investment in US history." },
      { name: "Taichung Fab", city: "Taichung", country: "Taiwan", flag: "🇹🇼", lat: 24.1839, lng: 120.6478, status: "operational", blurb: "HBM3E assembly + advanced packaging." },
    ],
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
    sources: [
      { label: "Rigetti 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001838359&type=10-K", tier: 1 },
      { label: "Rigetti IR", url: "https://investors.rigetti.com/", tier: 1 },
      { label: "Ankaa-3 technical announcement", url: "https://www.rigetti.com/news", tier: 1 },
    ],
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
    sources: [
      { label: "IonQ 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001823794&type=10-K", tier: 1 },
      { label: "IonQ IR", url: "https://investors.ionq.com/", tier: 1 },
      { label: "IonQ Tempo + Forte architecture", url: "https://ionq.com/quantum-systems", tier: 1 },
    ],
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
    deepDive:
      "Critical Metals Corp (CRML) sits at the most politically charged intersection in critical materials: a Greenland-based rare-earth deposit at a moment when Western governments are openly desperate for non-China REE supply. The flagship Tanbreez deposit in southern Greenland is a kakortokite-hosted resource that — uniquely among publicly disclosed REE projects — has a heavy-REE-enriched assemblage (high in dysprosium, terbium, yttrium, the elements that actually limit defense + EV motor magnet production). Tanbreez was previously held by a Chinese-affiliated investor before Greenland blocked the transaction; CRML acquired the project specifically because the Greenland government wanted a Western counterparty. The Wolfsberg lithium project in Austria is the second leg — a hard-rock spodumene resource with EU-OEM offtake interest, sitting inside the EU customs union (i.e., not subject to import frictions). The bear case is real and ugly: tiny float, repeated dilution risk, multi-year permitting timelines for any Greenland operation (10+ years is not abnormal), and a global REE pricing environment still well below early-2020s peaks. The bull case rests on policy: a US-DoD funding commitment for Tanbreez (under the Defense Production Act framework that has funded MP Materials' magnet plant) would re-rate the equity in a single press release, as would a Trump-administration symbolic prioritization of Greenland-based critical minerals. This is option-value sizing, not a position-trade — but for owners who already have conviction on the structural REE supply gap, CRML is one of the very few public-market vehicles with credible exposure outside MP Materials and Lynas.",
    sources: [
      { label: "Critical Metals 20-F (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001932757&type=20-F", tier: 1 },
      { label: "Critical Metals IR", url: "https://www.criticalmetalscorp.com/investors", tier: 1 },
      { label: "Tanbreez project page", url: "https://www.criticalmetalscorp.com/projects/tanbreez", tier: 1 },
      { label: "USGS Mineral Commodity Summaries (REE)", url: "https://www.usgs.gov/centers/national-minerals-information-center/rare-earths-statistics-and-information", tier: 1 },
    ],
    facilities: [
      { name: "Tanbreez REE project", city: "Killavaat Alannguat", country: "Greenland", flag: "🇬🇱", lat: 60.5500, lng: -45.0500, status: "planned", blurb: "Heavy-REE-rich kakortokite deposit. Among the largest REE resources outside China." },
      { name: "Wolfsberg lithium project", city: "Wolfsberg", country: "Austria", flag: "🇦🇹", lat: 46.8333, lng: 14.8500, status: "planned", blurb: "EU-domiciled spodumene project; offtake interest from European OEMs." },
    ],
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
    deepDive:
      "Palantir is the highest-multiple defense name on the public market because, structurally, it isn't a defense name — it's an enterprise AI software company that happens to have spent two decades building government-grade data infrastructure. AIP (Artificial Intelligence Platform), launched in 2023, has become the company's growth engine: deals are closing at 7-figure ACVs within 60-day evaluation cycles, which is unheard-of for traditional government IT. The Foundry/Gotham/Apollo stack underneath AIP is the actual moat — a 15-year accumulation of ontology + lineage + permissioning tooling that no enterprise can replicate by buying an LLM API. On the government side: the Maven Smart System contract, the Army TITAN program, the Project Maven expansion, and the recent DOGE-adjacent civilian-agency consolidation play give Palantir entrenched position across the US national security state. The commercial business — once skepticism's favorite punching bag — is now growing >60% YoY across major Fortune 500 deployments. The bear case is unambiguous: the multiple is among the highest in software (>50× sales), which means any deceleration compresses the stock violently. The bull case is that AIP is creating a category — 'ontology-grounded AI' — that Palantir functionally invented and that hyperscalers can't trivially replicate. Founder Alex Karp's ideological alignment with US national security state (overt, public, written) is a feature for sticky government revenue and a feature for the cohort of commercial buyers who care about US-aligned vendors as China cleavage deepens.",
    sources: [
      { label: "Palantir 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001321655&type=10-K", tier: 1 },
      { label: "Palantir IR", url: "https://investors.palantir.com/", tier: 1 },
      { label: "USASpending.gov — Palantir contracts", url: "https://www.usaspending.gov/recipient/0027ae08-7e9c-67f2-1620-22fb8568f4d6-C/latest", tier: 1 },
    ],
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
    sources: [
      { label: "Rocket Lab 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001819994&type=10-K", tier: 1 },
      { label: "Rocket Lab IR", url: "https://investors.rocketlabusa.com/", tier: 1 },
      { label: "Neutron development updates", url: "https://www.rocketlabusa.com/launch/neutron/", tier: 1 },
    ],
    facilities: [
      { name: "Long Beach HQ + Neutron production", city: "Long Beach", country: "USA", flag: "🇺🇸", lat: 33.8120, lng: -118.1583, status: "operational", blurb: "Engineering HQ + Archimedes engine + Neutron stage manufacturing." },
      { name: "Launch Complex 1 (Mahia)", city: "Mahia Peninsula", country: "New Zealand", flag: "🇳🇿", lat: -39.2630, lng: 177.8650, status: "operational", blurb: "Primary Electron launch site." },
      { name: "Launch Complex 2 (Wallops)", city: "Wallops Island", country: "USA", flag: "🇺🇸", lat: 37.8338, lng: -75.4881, status: "operational", blurb: "Electron + Neutron US launch operations." },
    ],
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
    sources: [
      { label: "Oklo 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001849056&type=10-K", tier: 1 },
      { label: "Oklo IR", url: "https://investors.oklo.com/", tier: 1 },
      { label: "NRC Aurora COLA docket", url: "https://www.nrc.gov/reactors/non-power/new-fac/oklo.html", tier: 1 },
    ],
    facilities: [
      { name: "Aurora pilot — INL", city: "Idaho Falls", country: "USA", flag: "🇺🇸", lat: 43.5208, lng: -112.0489, status: "planned", blurb: "First Aurora micro-reactor planned at Idaho National Lab." },
    ],
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

  // ─────────────────────── BATTERIES & EVs ───────────────────────
  {
    symbol: "373220.KS",
    yahooSymbol: "373220.KS",
    name: "LG Energy Solution",
    shortName: "LGES",
    exchange: "KRX",
    hq: "Seoul, South Korea",
    ceo: "Kim Dong-myung",
    founded: 2020,
    website: "https://www.lgensol.com",
    sectors: ["batteries-ev", "korea-industrial"],
    marketCapB: 75,
    marketCapAsOf: "2026-05",
    koreanName: "LG에너지솔루션",
    thesis:
      "Largest non-Chinese EV battery maker. NMC/NCMA leadership + emerging LFP capability. GM, Hyundai/Kia, Stellantis JVs anchor demand.",
    bullCase: [
      "GM Ultium JV is durable, multi-decade footprint in N. America.",
      "ESS demand inflecting alongside utility-scale storage (Tesla-style).",
      "Solid-state R&D + lithium-sulfur on roadmap.",
    ],
    bearCase: [
      "Margin pressure from Chinese LFP commoditization.",
      "GM EV demand has been choppy — JV utilization risk.",
      "Capex intensity for new gigafactory builds.",
    ],
    catalysts: [
      { date: "2026-2H", label: "Holland MI LFP line online", confidence: "medium" },
      { date: "2027", label: "Solid-state cell sampling", confidence: "speculative" },
    ],
    competitors: ["006400.KS", "300750.SZ", "1211.HK"],
    accent: "#a50034",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "LG Energy Solution is the only non-Chinese EV battery maker with global hyperscale OEM offtake commitments — the Ultium JV with GM in Ohio + Tennessee + Michigan, the Honda 40 GWh JV in Lansing, the Stellantis NextStar JV in Windsor, plus 80 GWh of nameplate capacity at Wrocław Poland. Korean cell technology has a generational head start in high-nickel NMC/NCMA chemistries, which deliver energy density that LFP cannot match — critical for the long-range premium EV segment where margins live. The LFP capability LGES is now bringing online at Holland MI is the company's strategic answer to CATL/BYD cost — building LFP at scale on the existing 18650/21700 form-factor process. The bear case is real: LFP commoditization erases premium pricing on the long-range tail; GM's EV growth has been choppy; capex intensity is brutal. The bull case is that ESS demand is structurally accelerating alongside utility-grid firming for AI data centers (a Tesla-Megapack adjacent market), and that LGES is genuinely the closest public-market analog to the Tesla Energy thesis on the cell side. R&D dollars on lithium-sulfur (Q4-2026 sampling guidance) and all-solid-state (post-2027) preserve technology optionality the Chinese cell majors haven't matched. Korean primary-source advantage: DART quarterly filings (분기보고서) disclose customer concentration ratios, plant utilization, and capex roadmap with more granularity than US 10-Q peers — a real moat for English-language analysts willing to translate.",
    sources: [
      { label: "LGES DART filings", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=LG%EC%97%90%EB%84%88%EC%A7%80%EC%86%94%EB%A3%A8%EC%85%98", tier: 1 },
      { label: "LGES IR (English)", url: "https://www.lgensol.com/en/ir-financial-info", tier: 1 },
    ],
    facilities: [
      { name: "Ochang Plant", city: "Ochang", country: "South Korea", flag: "🇰🇷", lat: 36.7172, lng: 127.4400, status: "operational", blurb: "Korea HQ + R&D + pilot. NMC + solid-state R&D." },
      { name: "Wrocław Plant (Europe)", city: "Wrocław", country: "Poland", flag: "🇵🇱", lat: 51.1079, lng: 17.0385, status: "operational", blurb: "Largest EV battery plant in Europe (~80 GWh annual)." },
      { name: "Holland MI (Ultium JV w/ GM)", city: "Holland", country: "USA", flag: "🇺🇸", lat: 42.7875, lng: -86.1089, status: "expanding", blurb: "GM Ultium JV. NMC + LFP capacity coming." },
      { name: "Lansing JV w/ Honda", city: "Lansing", country: "USA", flag: "🇺🇸", lat: 42.7325, lng: -84.5555, status: "construction", blurb: "Honda 50:50 JV, 40 GWh." },
    ],
  },
  {
    symbol: "006400.KS",
    yahooSymbol: "006400.KS",
    name: "Samsung SDI",
    shortName: "Samsung SDI",
    exchange: "KRX",
    hq: "Yongin, South Korea",
    ceo: "Choi Joo-Sun",
    founded: 1970,
    website: "https://www.samsungsdi.com",
    sectors: ["batteries-ev", "korea-industrial"],
    marketCapB: 25,
    marketCapAsOf: "2026-05",
    koreanName: "삼성SDI",
    thesis:
      "Samsung-group battery arm. Premium NMC focus (BMW, Stellantis, GM JV). Solid-state most-advanced pilot among Korean trio.",
    bullCase: [
      "Pilot line for all-solid-state cell already operating at Suwon.",
      "Stellantis StarPlus JV (33 GWh) operational from 2025.",
      "ESS pivot taking share alongside EV slowdown.",
    ],
    bearCase: [
      "Smaller scale than LGES — pricing leverage limited.",
      "EV slowdown hits revenue concentration on premium auto.",
    ],
    competitors: ["373220.KS", "300750.SZ"],
    accent: "#1428a0",
    lastVerified: "2026-05-22",
    sources: [
      { label: "Samsung SDI DART", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%EC%82%BC%EC%84%B1SDI", tier: 1 },
      { label: "Samsung SDI IR", url: "https://www.samsungsdi.com/ir/financial-information.html", tier: 1 },
    ],
    facilities: [
      { name: "Suwon HQ + R&D", city: "Suwon", country: "South Korea", flag: "🇰🇷", lat: 37.2636, lng: 127.0286, status: "operational" },
      { name: "Cheonan Plant", city: "Cheonan", country: "South Korea", flag: "🇰🇷", lat: 36.8151, lng: 127.1139, status: "operational" },
      { name: "StarPlus Stellantis JV", city: "Kokomo", country: "USA", flag: "🇺🇸", lat: 40.4864, lng: -86.1336, status: "operational", blurb: "First US battery JV: Stellantis-Samsung SDI, ~33 GWh." },
    ],
  },
  {
    symbol: "300750.SZ",
    yahooSymbol: "300750.SZ",
    name: "Contemporary Amperex Technology (CATL)",
    shortName: "CATL",
    exchange: "KRX",
    hq: "Ningde, Fujian, China",
    ceo: "Robin Zeng",
    founded: 2011,
    website: "https://www.catl.com",
    sectors: ["batteries-ev", "china-tech"],
    marketCapB: 180,
    marketCapAsOf: "2026-05",
    thesis:
      "World's largest EV battery maker (~37% share). LFP cost leadership + sodium-ion roadmap + Shenxing fast-charge platform.",
    bullCase: [
      "Cost leadership in LFP is a 20-30% wedge vs Western/Korean cells.",
      "Tesla, Ford, BMW, Mercedes all use CATL cells — diverse customer base.",
      "Sodium-ion + condensed matter battery are real, not vapor.",
    ],
    bearCase: [
      "US tariff + IRA exclusion drag on N. American addressable market.",
      "Geopolitical tail risk.",
      "Western OEMs vertical-integrating to displace.",
    ],
    competitors: ["373220.KS", "006400.KS", "1211.HK"],
    accent: "#e60012",
    featured: true,
    lastVerified: "2026-05-22",
    sources: [
      { label: "CATL annual report (Shenzhen exchange)", url: "https://www.szse.cn/disclosure/listed/notice/index.html?stock=300750", tier: 1 },
      { label: "CATL IR (English)", url: "https://www.catl.com/en/investors/", tier: 1 },
    ],
    facilities: [
      { name: "Ningde HQ + main plant", city: "Ningde", country: "China", flag: "🇨🇳", lat: 26.6650, lng: 119.5478, status: "operational" },
      { name: "Yibin (LFP mega)", city: "Yibin", country: "China", flag: "🇨🇳", lat: 28.7517, lng: 104.6402, status: "operational" },
      { name: "Arnstadt (Germany)", city: "Arnstadt", country: "Germany", flag: "🇩🇪", lat: 50.8419, lng: 10.9494, status: "operational" },
      { name: "Debrecen (Hungary)", city: "Debrecen", country: "Hungary", flag: "🇭🇺", lat: 47.5316, lng: 21.6273, status: "construction" },
    ],
  },
  {
    symbol: "1211.HK",
    yahooSymbol: "1211.HK",
    name: "BYD Company",
    shortName: "BYD",
    exchange: "HKEX",
    hq: "Shenzhen, China",
    ceo: "Wang Chuanfu",
    founded: 1995,
    website: "https://www.byd.com",
    sectors: ["batteries-ev", "china-tech"],
    marketCapB: 110,
    marketCapAsOf: "2026-05",
    thesis:
      "Vertically integrated EV+battery champion. Cell-to-pack Blade LFP, cheapest mass-market BEV cost structure on Earth. Tesla's only credible global competitor on cost.",
    bullCase: [
      "Vehicle volume already past Tesla on quarterly basis.",
      "Vertical integration (cells + motors + power electronics + chips).",
      "Global expansion (Brazil, Hungary, Thailand) bypasses tariffs partially.",
    ],
    bearCase: [
      "Locked out of US passenger-car market by tariffs.",
      "Margin compression from domestic price war.",
      "Single-country political concentration risk.",
    ],
    competitors: ["TSLA", "300750.SZ"],
    accent: "#e60012",
    featured: true,
    lastVerified: "2026-05-22",
    sources: [
      { label: "BYD annual report (HKEX)", url: "https://www.hkexnews.hk/listedco/listconews/sehk/Annual_Report/2024/0428/1211_2024.htm", tier: 1 },
      { label: "BYD IR", url: "https://www.byd.com/en/about-us/investor-information", tier: 1 },
    ],
    facilities: [
      { name: "Shenzhen HQ + assembly", city: "Shenzhen", country: "China", flag: "🇨🇳", lat: 22.5431, lng: 114.0579, status: "operational" },
      { name: "Hefei mega complex", city: "Hefei", country: "China", flag: "🇨🇳", lat: 31.8206, lng: 117.2272, status: "operational" },
      { name: "Bahia plant", city: "Camaçari", country: "Brazil", flag: "🇧🇷", lat: -12.6989, lng: -38.3231, status: "construction" },
      { name: "Szeged plant", city: "Szeged", country: "Hungary", flag: "🇭🇺", lat: 46.2530, lng: 20.1414, status: "construction" },
    ],
  },

  // ─────────────────────── KOREA INDUSTRIAL ───────────────────────
  {
    symbol: "005380.KS",
    yahooSymbol: "005380.KS",
    name: "Hyundai Motor Company",
    shortName: "Hyundai Motor",
    exchange: "KRX",
    hq: "Seoul, South Korea",
    ceo: "Chang Jae-hoon",
    founded: 1967,
    website: "https://www.hyundai.com",
    sectors: ["batteries-ev", "korea-industrial", "robotics-ai"],
    marketCapB: 45,
    marketCapAsOf: "2026-05",
    koreanName: "현대자동차",
    thesis:
      "Hyundai-Kia is the only legacy OEM with a credible dedicated EV platform (E-GMP). Owns Boston Dynamics. Combined Hyundai-Kia is #3 global automaker — and trades at half the multiple of any other OEM with comparable EV mix.",
    bullCase: [
      "E-GMP and IONIQ 5/6/9 EVs critically acclaimed + winning EV market share globally.",
      "Boston Dynamics ownership = humanoid + quadruped optionality.",
      "Hydrogen FCEV bet (NEXO + commercial) genuinely unique.",
      "Korea discount: KOSPI listings trade at structural multiple discount.",
    ],
    bearCase: [
      "China market share collapse.",
      "Boston Dynamics revenue tiny vs auto business.",
      "Chaebol governance overhang on multiple.",
    ],
    competitors: ["TSLA", "1211.HK"],
    accent: "#002c5f",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "Hyundai Motor Company is the most underpriced EV pure-play on the global market — and few US-based analysts have actually internalized this. The dedicated E-GMP platform underpins the IONIQ 5/6/9 + Kia EV6/EV9 line, which have collected basically every major Car of the Year award (World Car of the Year 2022, 2023, 2025). Hyundai-Kia combined is the world's #3 automaker by volume, behind only Toyota and Volkswagen Group, but trades at a fraction of either's EV/EBITDA. The Hyundai Motor Group Metaplant America at Ellabell GA — a $7.6B EV-dedicated plant with an LG Energy Solution battery JV next door — is the operational lynchpin of the company's tariff-resilient North American strategy under the IRA framework. Beyond automobiles: Hyundai outright owns Boston Dynamics, the most-cited humanoid + quadruped robotics company on Earth. The Atlas humanoid is now electric-actuator (replacing hydraulics), and Spot is in 100s of industrial deployments globally. Hyundai is also the only automaker that has shipped a hydrogen fuel-cell passenger vehicle (NEXO) at scale and operates the largest fuel-cell stack production line in the world (Chungju). Add the Korean-listing structural multiple discount and the chaebol governance overhang, and you arrive at a company that is competing with Tesla on EVs, with Boston Dynamics on humanoids, with Toyota on hydrogen, and prints ~10% operating margins — yet trades at single-digit forward P/E. The bear case (China share collapse, Boston Dynamics revenue still nano-cap-sized, governance) is well-known. The bull case is mean-reversion-by-quality: at some point, the world's third-largest automaker should not trade like a value trap.",
    sources: [
      { label: "Hyundai DART filings", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%ED%98%84%EB%8C%80%EC%9E%90%EB%8F%99%EC%B0%A8", tier: 1 },
      { label: "Hyundai IR", url: "https://www.hyundai.com/worldwide/en/company/ir/finance-information", tier: 1 },
      { label: "Boston Dynamics (subsidiary)", url: "https://bostondynamics.com", tier: 1 },
    ],
    facilities: [
      { name: "Ulsan Plant (largest auto plant on Earth)", city: "Ulsan", country: "South Korea", flag: "🇰🇷", lat: 35.5104, lng: 129.3597, status: "operational", blurb: "5 plants, ~1.5M vehicles/year capacity." },
      { name: "Hyundai Motor Group Metaplant America", city: "Ellabell, GA", country: "USA", flag: "🇺🇸", lat: 32.1450, lng: -81.4814, status: "expanding", blurb: "$7.6B EV-dedicated plant + LG batteries JV." },
      { name: "Boston Dynamics HQ", city: "Waltham, MA", country: "USA", flag: "🇺🇸", lat: 42.3765, lng: -71.2356, status: "operational", blurb: "Atlas + Spot + Stretch robotics." },
    ],
  },
  {
    symbol: "012450.KS",
    yahooSymbol: "012450.KS",
    name: "Hanwha Aerospace",
    shortName: "Hanwha Aero",
    exchange: "KRX",
    hq: "Changwon, South Korea",
    ceo: "Sohn Jae-il",
    founded: 1977,
    website: "https://www.hanwhaaerospace.com",
    sectors: ["defense-space", "korea-industrial"],
    marketCapB: 22,
    marketCapAsOf: "2026-05",
    koreanName: "한화에어로스페이스",
    thesis:
      "Korea's defense + space national champion. K9 howitzer global hit (Poland, Egypt, UK, Australia). Korean SLV Nuri owns rocket IP. Most operating leverage of any defense name globally on the post-Ukraine demand cycle.",
    bullCase: [
      "K9 backlog runs through 2028+ across NATO allies.",
      "Korea space agency contract anchors Nuri rocket commercialization.",
      "Aerospace engine business + UAM optionality.",
    ],
    bearCase: [
      "Peace breakouts compress multiple.",
      "Korean won FX drag on USD-denominated contracts.",
    ],
    competitors: ["LMT"],
    accent: "#f7941d",
    featured: true,
    lastVerified: "2026-05-22",
    sources: [
      { label: "Hanwha Aerospace DART", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%ED%95%9C%ED%99%94%EC%97%90%EC%96%B4%EB%A1%9C%EC%8A%A4%ED%8E%98%EC%9D%B4%EC%8A%A4", tier: 1 },
      { label: "Hanwha IR (English)", url: "https://www.hanwhaaerospace.com/eng/investor/ir-events.do", tier: 1 },
    ],
    facilities: [
      { name: "Changwon Plant (K9, engines)", city: "Changwon", country: "South Korea", flag: "🇰🇷", lat: 35.2280, lng: 128.6811, status: "operational" },
      { name: "Daejeon (rockets, Nuri)", city: "Daejeon", country: "South Korea", flag: "🇰🇷", lat: 36.3504, lng: 127.3845, status: "operational" },
    ],
  },
  {
    symbol: "079550.KS",
    yahooSymbol: "079550.KS",
    name: "LIG Nex1",
    shortName: "LIG Nex1",
    exchange: "KRX",
    hq: "Seongnam, South Korea",
    ceo: "Kim Ji-chan",
    founded: 1976,
    website: "https://www.lignex1.com",
    sectors: ["defense-space", "korea-industrial"],
    marketCapB: 5,
    marketCapAsOf: "2026-05",
    koreanName: "LIG넥스원",
    thesis:
      "Korea's missile + precision-guided munitions specialist. Cheongung-II (KM-SAM) air defense, Hyunmoo ballistic and cruise missiles, Sea-Skua. Operating leverage from Polish + Middle East orders.",
    bullCase: [
      "Cheongung-II export wins (UAE, Saudi Arabia) at a fraction of Patriot price.",
      "Hyunmoo series — Korea's only domestically developed long-range strike option.",
      "Sub-LMT pricing gives competitive global posture in cost-sensitive markets.",
    ],
    bearCase: [
      "Single-product-line concentration on missiles.",
      "Export-finance exposure to non-investment-grade buyers.",
    ],
    competitors: ["LMT", "012450.KS"],
    accent: "#003366",
    lastVerified: "2026-05-22",
    sources: [
      { label: "LIG Nex1 DART filings", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=LIG%EB%84%A5%EC%8A%A4%EC%9B%90", tier: 1 },
      { label: "LIG Nex1 IR", url: "https://www.lignex1.com/web/eng/ir/financial/financialInfo.do", tier: 1 },
    ],
    facilities: [
      { name: "Seongnam R&D HQ", city: "Seongnam", country: "South Korea", flag: "🇰🇷", lat: 37.3897, lng: 127.1230, status: "operational" },
      { name: "Pangyo R&D + production", city: "Yongin", country: "South Korea", flag: "🇰🇷", lat: 37.3411, lng: 127.1230, status: "operational" },
    ],
  },
  {
    symbol: "IBM",
    yahooSymbol: "IBM",
    name: "International Business Machines",
    shortName: "IBM",
    exchange: "NYSE",
    hq: "Armonk, NY",
    ceo: "Arvind Krishna",
    founded: 1911,
    website: "https://www.ibm.com",
    sectors: ["quantum", "semis-ai"],
    marketCapB: 240,
    marketCapAsOf: "2026-05",
    thesis:
      "Often dismissed as legacy, but: IBM Quantum is the most-deployed gate-model quantum stack on the planet (Heron, Condor, Flamingo, Kookaburra roadmap), and watsonx + Red Hat give a credible AI software franchise outside the hyperscaler triumvirate.",
    bullCase: [
      "IBM Quantum System Two with 1,121-qubit Condor + 462-qubit Flamingo modular roadmap.",
      "Red Hat OpenShift is the de-facto hybrid-cloud Kubernetes layer.",
      "watsonx as enterprise-LLM platform with Granite open-weights models.",
    ],
    bearCase: [
      "Consulting business mature, software growth needs to do all the work.",
      "Quantum revenue still rounding error vs other lines.",
    ],
    catalysts: [
      { date: "2026", label: "Kookaburra 4,158-qubit milestone", confidence: "medium" },
    ],
    competitors: ["IONQ", "RGTI"],
    accent: "#054ada",
    lastVerified: "2026-05-22",
    sources: [
      { label: "IBM 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000051143&type=10-K", tier: 1 },
      { label: "IBM Quantum roadmap", url: "https://www.ibm.com/quantum/roadmap", tier: 1 },
    ],
    facilities: [
      { name: "IBM Quantum (Yorktown Heights)", city: "Yorktown Heights, NY", country: "USA", flag: "🇺🇸", lat: 41.2106, lng: -73.7956, status: "operational", blurb: "Quantum hardware R&D — Heron, Condor, Flamingo, Kookaburra." },
    ],
  },
  {
    symbol: "LYC.AX",
    yahooSymbol: "LYC.AX",
    name: "Lynas Rare Earths",
    shortName: "Lynas",
    exchange: "LSE",
    hq: "Sydney, Australia",
    ceo: "Amanda Lacaze",
    founded: 1983,
    website: "https://lynasrareearths.com",
    sectors: ["critical-materials"],
    marketCapB: 7,
    marketCapAsOf: "2026-05",
    thesis:
      "Largest non-Chinese rare earth producer. Mt Weld (Australia) ore → Malaysia processing → US Texas separation facility (under DoD funding). The fully integrated allied-nation REE supply chain.",
    bullCase: [
      "Mt Weld is one of the highest-grade REE deposits on Earth.",
      "Kalgoorlie cracking + leaching plant moves processing onshore Australia.",
      "Texas separation facility (DoD-funded) brings heavy-REE separation to US soil first time.",
    ],
    bearCase: [
      "REE pricing weak — operating margins compressed.",
      "Malaysia plant licensing remains a recurring political risk.",
    ],
    competitors: ["MP", "CRML"],
    accent: "#00857d",
    lastVerified: "2026-05-22",
    sources: [
      { label: "Lynas IR (ASX)", url: "https://lynasrareearths.com/investors/", tier: 1 },
      { label: "DoD REE separation award", url: "https://www.defense.gov/News/Releases/Release/Article/2625730/", tier: 1 },
    ],
    facilities: [
      { name: "Mt Weld mine", city: "Mt Weld", country: "Australia", flag: "🇦🇺", lat: -28.8800, lng: 122.5400, status: "operational" },
      { name: "Lynas Malaysia (LAMP)", city: "Gebeng", country: "Malaysia", flag: "🇲🇾", lat: 3.9667, lng: 103.4167, status: "operational" },
      { name: "Lynas USA (Hondo, TX)", city: "Hondo, TX", country: "USA", flag: "🇺🇸", lat: 29.3505, lng: -99.1417, status: "construction", blurb: "Heavy-REE separation under DoD contract." },
      { name: "Kalgoorlie processing", city: "Kalgoorlie", country: "Australia", flag: "🇦🇺", lat: -30.7489, lng: 121.4655, status: "operational" },
    ],
  },

  // ─────────────────────── HYPERSCALERS ───────────────────────
  {
    symbol: "MSFT",
    yahooSymbol: "MSFT",
    name: "Microsoft Corporation",
    shortName: "Microsoft",
    exchange: "NASDAQ",
    hq: "Redmond, WA",
    ceo: "Satya Nadella",
    founded: 1975,
    website: "https://www.microsoft.com",
    sectors: ["hyperscalers", "semis-ai"],
    marketCapB: 3500,
    marketCapAsOf: "2026-05",
    thesis:
      "OpenAI's exclusive cloud + Azure AI's hyperscale moat + Microsoft Copilot's enterprise distribution. Capex guidance >$100B/year — the single largest individual AI infrastructure spender on Earth.",
    bullCase: [
      "OpenAI relationship is a multi-decade compute + IP partnership at scale.",
      "Azure AI growth >30% YoY with margin lift.",
      "Microsoft 365 Copilot attach rate climbing every quarter.",
      "Maia + Cobalt in-house silicon programs reduce NVDA dependency over time.",
    ],
    bearCase: [
      "Capex hits FCF; pressure to defend OpenAI economics.",
      "Sovereign AI regulators are taking aim at hyperscaler concentration.",
    ],
    competitors: ["GOOG", "META", "AMZN"],
    accent: "#0078d4",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "Microsoft is the largest single channel of AI capital expenditure on Earth. CY2025 capex guidance crossed $100B for the first time, with the AI infrastructure share running ~70% — roughly 8% of US private nonresidential structures investment is now Microsoft datacenters. The OpenAI partnership is the defining relationship: Microsoft is OpenAI's exclusive cloud, gets right-of-first-refusal on commercial deployment of OpenAI models, and through the 2023 investment + revenue-share arrangement holds claims on profits up to a (large) capped amount. Azure OpenAI Service has become the dominant enterprise-LLM channel — banks, healthcare, government — and the integration into Microsoft 365 Copilot is converting the legacy Office suite into the world's largest AI-assisted workflow surface. The in-house silicon programs (Maia 100 AI accelerator + Cobalt 100 Arm CPU) are designed to gradually reduce NVIDIA dependency without breaking it; the realistic case is hybrid fleets for the next 5+ years. Underneath, Microsoft has signed nuclear PPAs (Three Mile Island Unit 1 restart with Constellation), wind/solar offtake at unprecedented scale, and a Helion fusion PPA with a 2028 first-power target. The bear case is that capex outruns AI revenue capture, and that the OpenAI relationship dilutes as OpenAI seeks more independence. The bull case is that Copilot becomes a per-seat utility across every enterprise user on Earth — and that the AI infrastructure investment compounds into a structural cost advantage no other hyperscaler can match without taking decades to build.",
    sources: [
      { label: "Microsoft 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=10-K", tier: 1 },
      { label: "Microsoft IR", url: "https://www.microsoft.com/en-us/investor", tier: 1 },
      { label: "Stargate / OpenAI infrastructure announcements", url: "https://news.microsoft.com/source/", tier: 1 },
    ],
    facilities: [
      { name: "Redmond HQ", city: "Redmond, WA", country: "USA", flag: "🇺🇸", lat: 47.6398, lng: -122.1281, status: "operational" },
      { name: "Wisconsin AI datacenter (Mt Pleasant)", city: "Mt Pleasant, WI", country: "USA", flag: "🇺🇸", lat: 42.7311, lng: -87.9215, status: "construction", blurb: "$3.3B AI campus on the old Foxconn site." },
      { name: "Quincy WA datacenter cluster", city: "Quincy, WA", country: "USA", flag: "🇺🇸", lat: 47.2335, lng: -119.8531, status: "expanding" },
    ],
  },
  {
    symbol: "GOOG",
    yahooSymbol: "GOOG",
    name: "Alphabet Inc. (Google)",
    shortName: "Alphabet",
    exchange: "NASDAQ",
    hq: "Mountain View, CA",
    ceo: "Sundar Pichai",
    founded: 1998,
    website: "https://abc.xyz",
    sectors: ["hyperscalers", "semis-ai"],
    marketCapB: 2200,
    marketCapAsOf: "2026-05",
    thesis:
      "Most vertically integrated AI shop on Earth: TPU silicon, Gemini foundation models, full data center, search distribution, YouTube data, Android, Waymo. The capex story rivals MSFT but with a wider product surface.",
    bullCase: [
      "TPU v5/v6 + Trillium gives a real NVDA-alternative path.",
      "Gemini 2 reaches model-quality parity with frontier OpenAI models.",
      "Waymo is the leading robotaxi operator with paid-rides at scale.",
    ],
    bearCase: [
      "Search disruption from chat is a real, unresolved business model risk.",
      "Capex pressure on operating margin.",
    ],
    competitors: ["MSFT", "META", "AMZN"],
    accent: "#4285f4",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "Alphabet is the most vertically integrated AI shop in the world: silicon (TPU v5p/Trillium), foundation models (Gemini 2 + Imagen + Veo + Lumiere), data corpus (search + YouTube + Maps + Workspace), distribution (Search, YouTube, Android, Chrome, Gmail), and the application layer (NotebookLM, AI Overviews, Gemini app, Waymo). The TPU program — running since 2015 — is the only credible non-NVIDIA AI accelerator at hyperscale, and TPU v6 (Trillium) achieves ~4.7× the per-pod compute of TPU v5p. Google Cloud is now profitable and growing >30% YoY, with AI workloads carrying the operating leverage. Search faces a real but slow-burn disruption from chat-as-interface; Google's response — AI Overviews + Gemini app + Search Generative Experience — appears to be defending share even if ad RPM compresses. Waymo is the only US robotaxi service with paid public rides at scale (>150K weekly rides as of mid-2026), operating in 5+ metros with no human safety driver. The bear case is twofold: search ad revenue compression is real, and the federal antitrust case (US v. Google) could force structural changes to default placement deals (the Apple traffic-acquisition cost is the most-watched line item). The bull case is that Google's data + compute + model + distribution stack is the only one in the world that goes vertical end-to-end — and AI compounding favors the most integrated player.",
    sources: [
      { label: "Alphabet 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=10-K", tier: 1 },
      { label: "Alphabet IR", url: "https://abc.xyz/investor/", tier: 1 },
      { label: "Google DeepMind technical blog", url: "https://deepmind.google/discover/blog/", tier: 1 },
    ],
    facilities: [
      { name: "Googleplex (Mountain View)", city: "Mountain View, CA", country: "USA", flag: "🇺🇸", lat: 37.4220, lng: -122.0841, status: "operational" },
      { name: "Iowa datacenter (Council Bluffs)", city: "Council Bluffs, IA", country: "USA", flag: "🇺🇸", lat: 41.2619, lng: -95.8608, status: "expanding" },
      { name: "Singapore datacenter region", city: "Singapore", country: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198, status: "operational" },
    ],
  },
  {
    symbol: "META",
    yahooSymbol: "META",
    name: "Meta Platforms",
    shortName: "Meta",
    exchange: "NASDAQ",
    hq: "Menlo Park, CA",
    ceo: "Mark Zuckerberg",
    founded: 2004,
    website: "https://about.meta.com",
    sectors: ["hyperscalers", "robotics-ai"],
    marketCapB: 1500,
    marketCapAsOf: "2026-05",
    thesis:
      "Largest open-source AI model distributor (Llama 3, Llama 4). Capex commitment $60-80B/year. Llama is a strategic free option on infra positioning vs OpenAI/Anthropic.",
    bullCase: [
      "Ad business cash-flowing the AI investment, no dilution.",
      "Llama distribution creates an open-weights ecosystem Meta benefits from.",
      "MTIA in-house silicon ramping at scale.",
    ],
    bearCase: [
      "Reality Labs continues to burn $15B+/year.",
      "Capex magnitude relative to FCF pressures multiple.",
    ],
    competitors: ["MSFT", "GOOG"],
    accent: "#0866ff",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "Meta is the unconventional AI capex story: the ad business is the largest, fastest-growing cash machine in modern tech (>$170B revenue 2025 estimated), funding ~$60-80B in capital expenditure with no dilution. Llama is the most-downloaded open-weights LLM lineage in history; the strategic logic is that commoditizing the foundation-model layer prevents Microsoft+OpenAI from becoming a toll booth and gives Meta access to community-driven improvements it could not otherwise afford. MTIA (Meta Training and Inference Accelerator) is the in-house silicon program — designed by Broadcom — running at scale on recommendation workloads, freeing Hopper/Blackwell capacity for Llama training. The Hyperion AI campus in Richland Parish, Louisiana, will be the largest single AI datacenter under construction in the world at ~2 GW of power at full buildout. Reality Labs still burns ~$15-17B/year — the Quest hardware business is real but the metaverse-vision payoff remains diffuse. The bear case is that ad revenue is cyclical, AI capex magnitude relative to FCF compresses the multiple, and that Llama's open-weights strategy doesn't translate into a competitive moat. The bull case is that Meta is the only big-cap with both (a) a self-funding ad machine that absorbs the capex, and (b) the largest social-graph data set on Earth — which is genuinely useful training material that no other hyperscaler has.",
    sources: [
      { label: "Meta 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001326801&type=10-K", tier: 1 },
      { label: "Meta IR", url: "https://investor.fb.com/", tier: 1 },
      { label: "Llama models release notes", url: "https://ai.meta.com/blog/", tier: 1 },
    ],
    facilities: [
      { name: "Menlo Park HQ", city: "Menlo Park, CA", country: "USA", flag: "🇺🇸", lat: 37.4848, lng: -122.1484, status: "operational" },
      { name: "Hyperion AI campus", city: "Richland Parish, LA", country: "USA", flag: "🇺🇸", lat: 32.4170, lng: -91.5230, status: "construction", blurb: "Largest single AI datacenter on Earth at full buildout (~2 GW)." },
      { name: "Prineville OR datacenter", city: "Prineville, OR", country: "USA", flag: "🇺🇸", lat: 44.2998, lng: -120.8341, status: "operational" },
    ],
  },
  {
    symbol: "AMZN",
    yahooSymbol: "AMZN",
    name: "Amazon.com Inc.",
    shortName: "Amazon",
    exchange: "NASDAQ",
    hq: "Seattle, WA",
    ceo: "Andy Jassy",
    founded: 1994,
    website: "https://www.amazon.com",
    sectors: ["hyperscalers"],
    marketCapB: 2000,
    marketCapAsOf: "2026-05",
    thesis:
      "AWS still the largest cloud provider; Trainium + Inferentia are the longest-running hyperscaler in-house AI silicon programs. Anthropic equity stake gives a foundation-model option.",
    bullCase: [
      "AWS growth re-accelerating with Bedrock + Trainium 2.",
      "Anthropic partnership + multi-billion equity gives MSFT-OpenAI parity narrative.",
      "Project Kuiper (LEO satellites) gives Starlink-adjacent optionality.",
    ],
    bearCase: [
      "Retail margin compression from Walmart + Temu competition.",
      "AWS share losing slightly to Azure on AI workloads.",
    ],
    competitors: ["MSFT", "GOOG"],
    accent: "#ff9900",
    featured: true,
    lastVerified: "2026-05-22",
    deepDive:
      "Amazon is the largest cloud + the oldest hyperscaler in-house AI silicon program (Trainium 1 since 2022, Trainium 2 ramping 2025-2026). AWS remains the largest cloud by revenue, though Azure has pulled even on AI workloads. The Anthropic equity stake ($8B committed across multiple rounds) gives Amazon a foundation-model partnership analogous to Microsoft-OpenAI — Anthropic uses AWS as primary training infrastructure, returns model access through Bedrock, and the partnership effectively positions Amazon as the second pole in the foundation-model partnership map. Bedrock is now a serious enterprise-LLM front door, hosting Claude, Llama, Mistral, and Amazon's own Titan/Nova model family. Project Kuiper — Amazon's LEO satellite broadband program — is the most credible Starlink challenger, with FCC-approved 3,236-satellite constellation and prototype launches underway in 2025-2026. The bear case is that retail margin is under structural pressure from Walmart + Temu, that AWS growth has slightly trailed Azure on AI-workload share, and that the Anthropic partnership is less exclusive than MSFT-OpenAI. The bull case is that Trainium 2 + 3 give Amazon the longest-running in-house AI silicon program (deeper expertise + cost advantage at scale), and that the AWS revenue base is large enough that even single-digit AI-workload share gains throw off enormous absolute dollars.",
    sources: [
      { label: "Amazon 10-K (SEC EDGAR)", url: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001018724&type=10-K", tier: 1 },
      { label: "Amazon IR", url: "https://ir.aboutamazon.com/", tier: 1 },
      { label: "AWS Trainium / Inferentia documentation", url: "https://aws.amazon.com/machine-learning/trainium/", tier: 1 },
    ],
    facilities: [
      { name: "Seattle HQ", city: "Seattle, WA", country: "USA", flag: "🇺🇸", lat: 47.6062, lng: -122.3321, status: "operational" },
      { name: "Northern Virginia datacenter cluster", city: "Ashburn, VA", country: "USA", flag: "🇺🇸", lat: 39.0438, lng: -77.4874, status: "operational", blurb: "World's largest concentration of AWS capacity." },
      { name: "Project Kuiper sat ops (Redmond)", city: "Redmond, WA", country: "USA", flag: "🇺🇸", lat: 47.6740, lng: -122.1215, status: "operational" },
    ],
  },

  // ─────────────────────── MORE KOREAN INDUSTRIAL (robotics + solar) ───────────────────────
  {
    symbol: "454910.KS",
    yahooSymbol: "454910.KS",
    name: "Doosan Robotics",
    shortName: "Doosan Robotics",
    exchange: "KRX",
    hq: "Suwon, South Korea",
    ceo: "Ryu Jung-hoon",
    founded: 2015,
    website: "https://www.doosanrobotics.com",
    sectors: ["robotics-ai", "korea-industrial"],
    marketCapB: 3,
    marketCapAsOf: "2026-05",
    koreanName: "두산로보틱스",
    thesis:
      "Korea's largest collaborative-robot (cobot) maker. H-series + M-series + A-series cover payloads 5-25 kg. Targeting US + EU industrial automation channels.",
    bullCase: [
      "Cobot market growing 25%+ CAGR as labor shortages bite.",
      "Korea + Japan industrial customer base structurally strong.",
      "F&B + logistics verticals expanding rapidly.",
    ],
    bearCase: [
      "Universal Robots + Techman compete on the same per-unit price band.",
      "Margin compression as Chinese vendors enter.",
    ],
    competitors: ["277810.KQ"],
    accent: "#003478",
    lastVerified: "2026-05-22",
    sources: [
      { label: "Doosan Robotics DART", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%EB%91%90%EC%82%B0%EB%A1%9C%EB%B3%B4%ED%8B%B1%EC%8A%A4", tier: 1 },
      { label: "Doosan Robotics IR", url: "https://www.doosanrobotics.com/en/ir", tier: 1 },
    ],
    facilities: [
      { name: "Suwon HQ + factory", city: "Suwon", country: "South Korea", flag: "🇰🇷", lat: 37.2636, lng: 127.0286, status: "operational" },
    ],
  },
  {
    symbol: "277810.KQ",
    yahooSymbol: "277810.KQ",
    name: "Rainbow Robotics",
    shortName: "Rainbow Robotics",
    exchange: "KRX",
    hq: "Daejeon, South Korea",
    ceo: "Lee Jung-ho",
    founded: 2011,
    website: "https://www.rainbow-robotics.com",
    sectors: ["robotics-ai", "korea-industrial"],
    marketCapB: 2,
    marketCapAsOf: "2026-05",
    koreanName: "레인보우로보틱스",
    thesis:
      "KAIST HUBO-team spinoff. Humanoid + quadruped + cobot product line. Samsung Electronics is the largest shareholder (~14.7%) — strategic stake telegraphs Samsung's Optimus-equivalent ambitions.",
    bullCase: [
      "Samsung's strategic stake hints at internal Samsung robotics product line.",
      "HUBO heritage — academically credible bipedal humanoid program.",
      "Korean government-funded humanoid R&D programs as anchor customer.",
    ],
    bearCase: [
      "Pre-revenue at scale; concentrated retail flow.",
      "Tesla Optimus + Figure AI + Apptronik all chasing the same TAM with deeper pockets.",
    ],
    competitors: ["TSLA", "454910.KS"],
    accent: "#5b59e8",
    featured: true,
    lastVerified: "2026-05-22",
    sources: [
      { label: "Rainbow Robotics DART", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%EB%A0%88%EC%9D%B8%EB%B3%B4%EC%9A%B0%EB%A1%9C%EB%B3%B4%ED%8B%B1%EC%8A%A4", tier: 1 },
      { label: "Samsung stake disclosure", url: "https://dart.fss.or.kr", tier: 1 },
    ],
    facilities: [
      { name: "Daejeon HQ + R&D", city: "Daejeon", country: "South Korea", flag: "🇰🇷", lat: 36.3504, lng: 127.3845, status: "operational" },
    ],
  },
  {
    symbol: "009830.KS",
    yahooSymbol: "009830.KS",
    name: "Hanwha Solutions",
    shortName: "Hanwha Solutions",
    exchange: "KRX",
    hq: "Seoul, South Korea",
    ceo: "Lee Koo-young",
    founded: 1965,
    website: "https://www.hanwhasolutions.com",
    sectors: ["batteries-ev", "korea-industrial"],
    marketCapB: 4,
    marketCapAsOf: "2026-05",
    koreanName: "한화솔루션",
    thesis:
      "Korea's largest solar manufacturer (Q CELLS brand). Largest US solar module producer post-IRA via Dalton GA mega-fab. Chemicals + advanced materials add diversified industrial base.",
    bullCase: [
      "Dalton GA mega-fab makes Hanwha the largest non-Chinese cell + module producer.",
      "IRA tailwind on US-domiciled solar production credits.",
      "Korean industrial solar ecosystem genuinely competitive vs Chinese majors.",
    ],
    bearCase: [
      "Solar pricing collapse from Chinese overcapacity ongoing.",
      "IRA policy reversal under different administration is real risk.",
    ],
    accent: "#f7941d",
    lastVerified: "2026-05-22",
    sources: [
      { label: "Hanwha Solutions DART", url: "https://dart.fss.or.kr/dsab007/main.do?textCrpNm=%ED%95%9C%ED%99%94%EC%86%94%EB%A3%A8%EC%85%98", tier: 1 },
      { label: "Hanwha Solutions IR", url: "https://www.hanwhasolutions.com/en/ir/", tier: 1 },
    ],
    facilities: [
      { name: "Q CELLS Dalton GA", city: "Dalton, GA", country: "USA", flag: "🇺🇸", lat: 34.7698, lng: -84.9700, status: "expanding", blurb: "Largest US solar cell + module fab post-IRA." },
      { name: "Jincheon solar plant", city: "Jincheon", country: "South Korea", flag: "🇰🇷", lat: 36.8552, lng: 127.4359, status: "operational" },
    ],
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

/** url-safe slug. Replaces "." with "-" so "005930.KS" → "005930-ks". */
export function tickerSlug(t: Ticker): string {
  return t.symbol.toLowerCase().replace(/\./g, "-");
}
/** Canonical company Atlas page URL. */
export function tickerHref(t: Ticker): string {
  return `/company/${tickerSlug(t)}`;
}
/** Financial sidecar URL (price + thesis only). */
export function tickerFinanceHref(t: Ticker): string {
  return `/ticker/${tickerSlug(t)}`;
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
