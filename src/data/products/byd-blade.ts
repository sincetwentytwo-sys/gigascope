import type { ProductSpec } from "./index";

export const bydBlade: ProductSpec = {
  slug: "byd-blade",
  name: "BYD Blade battery",
  aka: "CTP LFP cell-to-pack",
  category: "battery",
  description:
    "BYD's flagship LFP (lithium iron phosphate) cell — long and thin like a blade (~960 mm × 90 mm × 13 mm), arranged directly in the pack with no intermediate module housings (cell-to-pack architecture). Lower energy density than NCM but vastly better thermal safety + cycle life + cost. Powers BYD's entire EV lineup and licensed to Tesla (Model 3/Y Shanghai standard range), Ford (Mustang Mach-E), Toyota.",
  cameraPosition: [0, 0, 5],
  mainCredit: {
    source: "Wikimedia Commons (Matti Blume)",
    url: "https://commons.wikimedia.org/wiki/File:IAA_Summit_2023,_Munich_(P1110715).jpg",
    license: "CC BY-SA 4.0",
  },
  parts: [
    { id: "tray", name: "Pack tray (CTP — no module housing)", description: "Aluminum pack tray that holds the blade cells directly without intermediate module housings. Cell-to-Pack (CTP) architecture eliminates module weight + complexity — the blade cell IS the structural unit. Saves ~10-15% of pack weight.", geometry: "box", args: [0,0,0], color: "#374151", hotspot: { x: 0.50, y: 0.52 } },
    { id: "blade-1", name: "Blade cell 1 — LiFePO₄", description: "Lithium iron phosphate (LFP) chemistry. ~960 mm × 90 mm × 13 mm dimensions. Thin profile spreads heat dissipation across the long surface — the geometry is the cooling solution. Each blade is ~200 Ah capacity.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.290 } },
    { id: "blade-2", name: "Blade cell 2", description: "Stacked horizontally in the pack alongside blade 1. Hundreds of blades per pack for a typical EV (a BYD Atto 3 has ~96 blades).", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.355 } },
    { id: "blade-3", name: "Blade cell 3", description: "Blade cell layer 3.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.420 } },
    { id: "blade-4", name: "Blade cell 4", description: "Blade cell layer 4.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.485 } },
    { id: "blade-5", name: "Blade cell 5", description: "Blade cell layer 5.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.550 } },
    { id: "blade-6", name: "Blade cell 6", description: "Blade cell layer 6.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.615 } },
    { id: "blade-7", name: "Blade cell 7", description: "Blade cell layer 7.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.680 } },
    { id: "blade-8", name: "Blade cell 8", description: "Blade cell layer 8.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.745 } },
    { id: "blade-9", name: "Blade cell 9", description: "Blade cell layer 9. LFP famously passed BYD's 'nail penetration test' without thermal runaway — the chemistry's intrinsic safety + the cooling-by-geometry of the blade form factor is the headline marketing point.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.810 } },
  ],
  relatedSites: [],
};
