/**
 * Glossary entries for /learn/[slug].
 *
 * Each entry is intentionally written as first-principles, not paraphrased
 * marketing. Body should answer "what is it / why does it matter / who
 * owns this layer."
 */

export interface LearnEntry {
  slug: string;
  term: string;
  oneLiner: string;
  body: string;
  /** ticker symbols that pay rent on this concept */
  relatedTickers?: string[];
  /** other glossary slugs */
  relatedTerms?: string[];
  category: "semiconductors" | "compute" | "autonomy" | "energy" | "materials" | "space" | "quantum";
}

export const LEARN: LearnEntry[] = [
  {
    slug: "hbm",
    term: "HBM (High Bandwidth Memory)",
    oneLiner: "Vertically stacked DRAM packaged next to a GPU die to feed AI workloads at memory-bandwidth limits.",
    category: "semiconductors",
    body:
      "A standard DDR5 DIMM gives you ~50 GB/s of memory bandwidth per channel. An NVIDIA Blackwell B200 GPU needs ~8,000 GB/s. HBM (High Bandwidth Memory) is how you close that gap: DRAM dies stacked vertically with through-silicon vias (TSVs), packaged on a silicon interposer right next to the compute die, so the path from memory cell to compute is millimeters instead of inches.\n\nThe current generation in production is HBM3E — typically 8 stacks of 12 dies (12-Hi), giving ~1.2 TB/s per stack and up to 36 GB per package. HBM4, sampling in 2026 with HVM in 2027, doubles channel count and lifts bandwidth past 1.6 TB/s per stack. The next architecture frontier is HBM-on-logic: instead of placing HBM next to logic on a 2.5D interposer, fab the HBM controller into the logic die itself (a 3D stack), which TSMC's CoWoS-L packaging is converging toward.\n\nWho owns this layer: SK Hynix (000660.KS) leads with ~55% market share and was sole-source on NVIDIA's first Blackwell SKUs. Samsung (005930.KS) has ~30% and is pushing to qualify HBM3E 12-Hi at NVIDIA — the single most-watched semiconductor catalyst on the KOSPI. Micron (MU) has the smallest share but is the only US-headquartered HBM vendor, which carries strategic premium. Without HBM there is no AI training cluster at scale.",
    relatedTickers: ["000660.KS", "005930.KS", "MU", "NVDA", "TSM"],
    relatedTerms: ["cowos", "euv", "hyperscaler-capex"],
  },
  {
    slug: "euv",
    term: "EUV (Extreme Ultraviolet Lithography)",
    oneLiner: "The 13.5nm-wavelength light source that lets foundries pattern transistors below 7nm. Sole-supplied by ASML.",
    category: "semiconductors",
    body:
      "Photolithography is how chip patterns get printed onto silicon. For decades, the trade made do with deep ultraviolet light (193nm wavelength) and increasingly heroic multi-patterning tricks. Below 7nm, that ran out of physical headroom. EUV — extreme ultraviolet, 13.5nm wavelength — restored the headroom, but generating EUV at production volume is one of the most physically extreme engineering feats in human history: a CO₂ laser hitting droplets of molten tin 50,000 times per second to generate a plasma that emits the light.\n\nOne company in the world ships EUV scanners at production volume: ASML (AMS: ASML). The current installed base (TWINSCAN NXE series) is used for everything 7nm and below at TSMC, Samsung, Intel, and SK Hynix. The next-generation system — High-NA EUV (TWINSCAN EXE:5000), at ~$380M per tool — has higher numerical aperture, enabling smaller print features without resorting to triple-patterning. TSMC's N2 (2nm) and Samsung's 2nm GAA nodes are the first to use it at HVM scale.\n\nWho depends on it: every leading-edge fab. There is no second source. If ASML stopped shipping, the leading-edge semiconductor roadmap freezes. Export controls have already cut off most of China from EUV — Huawei's HiSilicon has done remarkable things with DUV alone, but they cannot keep pace at 3nm and below.",
    relatedTickers: ["ASML", "TSM", "005930.KS"],
    relatedTerms: ["hbm", "gaa", "cowos"],
  },
  {
    slug: "gaa",
    term: "GAA (Gate-All-Around transistor)",
    oneLiner: "The transistor architecture replacing FinFET at 3nm and below. Wraps the gate fully around the channel.",
    category: "semiconductors",
    body:
      "FinFET, the transistor architecture that dominated leading-edge from ~22nm to ~5nm, runs out of headroom around 3nm: the fin gets too narrow to control reliably, and short-channel effects (leakage, threshold-voltage instability) start to dominate. Gate-All-Around (GAA) — also called nanosheet or nanowire — replaces the fin with horizontally stacked silicon sheets, with the gate material wrapped fully around each sheet on all four sides.\n\nMore gate-to-channel contact area = better electrostatic control = less leakage at the same dimensions. The practical benefit: another ~2 generations of transistor scaling before the next architecture (CFET, or complementary FET, stacking nFET on pFET vertically) takes over.\n\nSamsung Foundry was first to ship GAA at HVM (3nm GAA, 2022), though their yields lagged TSMC's N3 FinFET. TSMC introduces GAA at N2 (2026 H2 HVM). Intel skipped GAA at one node intermediate (Intel 3 stayed FinFET) and jumps to RibbonFET (Intel's GAA name) at Intel 18A.",
    relatedTickers: ["TSM", "005930.KS", "ASML"],
    relatedTerms: ["euv", "cowos"],
  },
  {
    slug: "cowos",
    term: "CoWoS (Chip-on-Wafer-on-Substrate)",
    oneLiner: "TSMC's advanced packaging tech — the actual physical bottleneck on every NVIDIA shipment.",
    category: "semiconductors",
    body:
      "TSMC's CoWoS (Chip-on-Wafer-on-Substrate) places multiple chiplets — a GPU die, HBM stacks, sometimes I/O die — onto a single silicon interposer, then attaches the interposer to a package substrate. Variant CoWoS-L (with local silicon interconnects) shipped for Blackwell. The 'wafer' part is the key: the interposer is itself a silicon wafer, sized 80-100mm² and growing toward 120mm² for next-gen, with through-silicon vias and routing layers manufactured at deep-submicron nodes.\n\nThis is the actual production constraint on AI hardware. NVIDIA can design Blackwell at 5nm; SK Hynix can stack HBM3E. But until TSMC's CoWoS line at Longtan (and now expanding to Chiayi + new AP6/7/8 sites) can package them together, GPUs don't ship. Industry estimates put TSMC's CoWoS-L capacity in 2026 at roughly 70-80K wafer starts/month — and every NVIDIA, AMD, AVGO ASIC, and Google TPU customer is competing for that capacity.\n\nThis is why the supply chain story is so concentrated: there is NVIDIA, but behind NVIDIA there is TSMC, and behind TSMC's leading-edge logic there is also TSMC's leading-edge packaging.",
    relatedTickers: ["TSM", "NVDA", "AMD", "AVGO"],
    relatedTerms: ["hbm", "euv"],
  },
  {
    slug: "fsd-robotaxi",
    term: "FSD / Robotaxi",
    oneLiner: "Tesla's end-to-end neural-net autonomous-driving stack and the planned ride-hail service running on it.",
    category: "autonomy",
    body:
      "Tesla's Full Self-Driving (FSD) and the broader Robotaxi network are the highest-impact narrative levers on TSLA's valuation that haven't shown up in revenue yet. The technical bet is end-to-end neural networks: instead of the modular SLAM + perception + planning + control stack used by Waymo, Cruise, and most competitors, Tesla's FSD v12+ uses a single neural network that maps camera pixels directly to vehicle controls. The argument for this approach is data scale (Tesla's fleet records ~10× the supervised-learning data of any competitor per unit time) and software simplicity.\n\nThe argument against: regulatory compliance and demonstrable safety case. As of 2026, Tesla Robotaxi operates a supervised pilot in Austin and the SF Bay Area. The regulatory unlock — a state-by-state path to fully driverless operation under the existing Federal Motor Vehicle Safety Standards framework — is the binary catalyst. Texas operates under permissive state-level rules; California requires CPUC and DMV approval (the same path Waymo cleared); New York and most northeast states require state legislation.\n\nIf Tesla converts the ~7M-vehicle FSD-capable fleet into a per-mile autonomous economic unit at scale, the unit economics for Tesla shift from selling cars to operating fleets — and the AI-flywheel benefit (more miles → better model → safer service → more miles) compounds aggressively.",
    relatedTickers: ["TSLA", "NVDA"],
    relatedTerms: ["hyperscaler-capex"],
  },
  {
    slug: "hyperscaler-capex",
    term: "Hyperscaler capex",
    oneLiner: "The Microsoft + Google + Meta + Amazon AI-infrastructure spend that funds every layer of this Atlas.",
    category: "compute",
    body:
      "The 4 US hyperscalers (Microsoft, Google, Meta, Amazon) collectively spent ~$200B on capital expenditure in 2024 and are guiding ~$300-350B in 2025-2026, with the AI infrastructure share running from ~40% in 2023 to >60% in 2026. This is the single largest physical-infrastructure spending wave in private-sector history, dwarfing the dot-com fiber buildout in inflation-adjusted dollars.\n\nThe money flows downstream in a predictable order: hyperscaler capex → NVIDIA + AMD GPUs (~60% of the AI-infra share lands here), HBM (Hynix, Samsung, Micron pick up ~10%), foundry (TSMC), advanced packaging (TSMC CoWoS), networking (Broadcom, Arista), datacenter real estate (Equinix, Digital Realty), power generation (the SMR PPA story — Oklo, NuScale, Cameco), and ultimately the rare earths and lithium that go into the cooling / power-distribution infrastructure.\n\nThe bear case for the entire Atlas is hyperscaler capex digestion — i.e., one of the big four signals a year of consolidation rather than expansion. Any whiff of this compresses the multiple on every name downstream. The bull case is that the demand from sovereign AI buildouts (Saudi HUMAIN, UAE G42, India, Japan, France, UK) is large enough to backfill any US hyperscaler pause.",
    relatedTickers: ["NVDA", "TSM", "000660.KS", "005930.KS", "AVGO"],
    relatedTerms: ["hbm", "cowos"],
  },
  {
    slug: "qubit",
    term: "Qubit",
    oneLiner: "The quantum-computing equivalent of a bit. Multiple physical implementations — none yet at commercial scale.",
    category: "quantum",
    body:
      "A classical bit is 0 or 1. A qubit is a quantum two-state system that, until measured, exists in a superposition of both states. Entangled together, n qubits encode 2ⁿ amplitude values simultaneously, which is the resource that quantum algorithms (Shor's, Grover's, VQE) consume.\n\nThe practical question is not 'how many qubits' but 'how many *useful* qubits at what fidelity.' Today's gate-model machines have:\n• Superconducting (IBM Heron 156Q, Rigetti Ankaa-3 84Q): fast gates (~10ns), but require mK dilution refrigerators and have shorter coherence times.\n• Trapped-ion (IonQ Forte 36 AQ, Quantinuum H2): essentially identical qubits with the longest coherence times, but slower gates (~100µs).\n• Photonic (PsiQuantum-private, Xanadu-private): bet on millions of qubits via quantum-error-correction codes that overhead an enormous physical qubit count to extract logical qubits.\n• Neutral atom (QuEra-private, Pasqal-private): emerging architecture, low SWaP, programmable.\n\nWhat matters commercially is logical-qubit count and gate-error rate after error correction. Useful 'quantum advantage' on commercially relevant problems is widely expected 2027-2030. The publicly traded names (IONQ, RGTI, QBTS) trade on milestone press, not revenue.",
    relatedTickers: ["IONQ", "RGTI", "QBTS", "ARQQ", "IBM"],
  },
  {
    slug: "ree",
    term: "Rare earths (REE)",
    oneLiner: "17 elements critical to magnets, lasers, and catalysts. China holds ~70% of global mining + ~85% of refining.",
    category: "materials",
    body:
      "Rare earths are 17 metallic elements (the lanthanides + scandium + yttrium). 'Rare' is misleading — they're actually moderately abundant in the crust — but they're chemically similar to each other, which makes separation extraordinarily difficult. China learned the chemistry in the 1980s and now controls ~70% of global mining and ~85% of separation/refining.\n\nThe 4 'heavy REEs' that matter most for downstream applications are dysprosium and terbium (for the magnets in EV motors, wind turbines, F-35 actuators), yttrium (for high-temperature alloys), and europium (lasers). Light REEs (neodymium, praseodymium) are also magnet ingredients but more widely available.\n\nWestern alternatives:\n• MP Materials (MP) — Mountain Pass, CA. The only operating US REE mine. Magnet plant in Fort Worth coming online.\n• Lynas (LYC.AX) — Mt Weld, Australia → Malaysia processing → Hondo TX separation under DoD contract.\n• Critical Metals (CRML) — Tanbreez, Greenland (heavy-REE rich kakortokite, currently in permitting).\n\nThe binary catalyst on each name is US government direct funding (DPA Title III, DoD strategic minerals authority) or anchor customer commitment (GM, F-35 prime, defense magnet program). REE pricing is volatile but the structural decoupling story has multi-decade runway.",
    relatedTickers: ["MP", "CRML", "LYC.AX", "ALB"],
  },
  {
    slug: "lfp-vs-nmc",
    term: "LFP vs NMC battery chemistry",
    oneLiner: "Two dominant lithium-ion cathode chemistries with different cost / energy density / safety trade-offs.",
    category: "energy",
    body:
      "LFP (Lithium Iron Phosphate, LiFePO₄) and NMC/NCMA (Lithium Nickel Manganese Cobalt + Aluminum) are the two cathode chemistries dominating EV and grid-storage batteries.\n\nLFP advantages: lower cost (no cobalt, no nickel premium), better thermal safety (no thermal runaway at typical operating temps), longer cycle life (>3,000 full cycles vs ~1,500 for NMC). Disadvantage: ~30% lower energy density at the pack level. CATL, BYD, and the Chinese cell ecosystem dominate LFP at cost. Tesla switched standard-range Model 3/Y to LFP cells in 2021 and is bringing LFP cell production to Nevada.\n\nNMC/NCMA advantages: higher energy density (better for long-range premium EVs, where weight matters most), more established Western supply chain. Disadvantages: cost (nickel + cobalt commodity exposure), safety margins require more sophisticated battery management. LGES, Samsung SDI, SK On dominate high-nickel chemistry.\n\nThe industry split is increasingly clear: LFP for standard-range + grid storage, high-nickel NMC/NCMA for long-range premium. Solid-state (still pre-commercial) is the option-value bet on a third path: high energy density + safety + cycle life without the nickel/cobalt exposure.",
    relatedTickers: ["373220.KS", "006400.KS", "300750.SZ", "1211.HK", "TSLA"],
  },
  {
    slug: "smr",
    term: "SMR (Small Modular Reactor)",
    oneLiner: "Factory-built nuclear reactors <300 MWe each. The credible answer to AI data-center power demand.",
    category: "energy",
    body:
      "Small Modular Reactors (SMRs) are nuclear reactors with electrical output below 300 MWe, designed to be factory-fabricated and shipped to site rather than built bespoke in-place. The architectural argument: smaller reactors are cheaper per-MWe at production scale, have shorter construction times (3-5 years vs 10-15 for a gigawatt-scale conventional reactor), and can be deployed in locations that can't support a full-scale plant.\n\nThe AI angle: hyperscaler power-purchase agreements (PPAs). Microsoft, Google, Amazon, and Meta have all signed nuclear PPAs in 2024-2025, with multi-decade contract durations and prices above market spot. Some of these support existing reactor restarts (Three Mile Island Unit 1 → Microsoft); others underwrite new construction commitments.\n\nPublic-market SMR names:\n• Oklo (OKLO) — Aurora micro-reactor (15 MWe), planned at INL. Sam Altman was chair pre-IPO.\n• NuScale (SMR) — Only NRC design-certified SMR (VOYGR-77 module). UAMPS customer lost in 2023.\n• BWX Technologies (BWXT) — Naval reactor incumbent + SMR foundry.\n• Cameco (CCJ) — uranium fuel + Westinghouse stake.\n\nNRC licensing remains the binary constraint. The first US SMR construction commitment is unlikely before late 2026.",
    relatedTickers: ["OKLO", "SMR", "CCJ"],
  },
];

export function getLearn(slug: string): LearnEntry | undefined {
  return LEARN.find((l) => l.slug === slug);
}
