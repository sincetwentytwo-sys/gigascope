import type { ProductSpec } from "./index";

export const tsmcCowos: ProductSpec = {
  slug: "tsmc-cowos",
  name: "TSMC CoWoS-L packaging",
  aka: "Chip-on-Wafer-on-Substrate (Local Si Interconnect variant)",
  category: "packaging",
  description:
    "TSMC's advanced 2.5D packaging technology — chiplets and HBM stacks placed on a silicon interposer with local Si interconnect bridges (LSI) for high-density inter-die communication. The actual physical bottleneck on every NVIDIA Blackwell shipment. CoWoS capacity at Longtan, Chiayi, and the AP6/7/8 sites is the structural constraint on the entire AI compute supply chain through 2026.",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "lid", name: "Heat spreader / lid + TIM2", description: "Copper lid bonded to the die stack with thermal interface material (TIM2). For Blackwell-class power densities (~1,200 W), even the TIM2 selection is critical — TSMC uses liquid metal or graphene-loaded compounds. The lid distributes heat to the cooling solution above.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.50, y: 0.20 } },
    { id: "hbm-left", name: "HBM3E stack (left)", description: "Left-side HBM3E memory stack bonded to the interposer via micro-bumps (25 µm pitch). One of two HBM stacks per CoWoS-L module in the standard Blackwell configuration; more for next-gen packages.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.25, y: 0.43 } },
    { id: "gpu-1", name: "GPU die 1 (compute)", description: "First reticle-limited compute die fabricated at TSMC N4P/N3. Bonded face-down to the interposer. Each compute die uses thousands of micro-bumps for power, ground, and data routing.", geometry: "box", args: [0,0,0], color: "#76b900", hotspot: { x: 0.425, y: 0.40 } },
    { id: "gpu-2", name: "GPU die 2 (compute)", description: "Second compute die mirroring die 1. The space between dies hosts LSI bridges for chip-to-chip routing.", geometry: "box", args: [0,0,0], color: "#76b900", hotspot: { x: 0.575, y: 0.40 } },
    { id: "hbm-right", name: "HBM3E stack (right)", description: "Right-side HBM3E stack. Symmetric to the left, separated by the compute dies in the middle.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.75, y: 0.43 } },
    { id: "lsi", name: "Local Si Interconnect (LSI) bridges", description: "Embedded silicon chiplets buried in the interposer that handle high-density routing between adjacent dies. Replaces a continuous wafer-scale interposer with cheaper smaller silicon strips. CoWoS-L is TSMC's roadmap for sub-monolithic-reticle packaging.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.585 } },
    { id: "rdl", name: "RDL fan-out (redistribution layer)", description: "Organic redistribution layer that routes signals from the LSI bridges to the package substrate below. Manufactured on a reconstituted wafer (chiplets first, RDL second).", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.70 } },
    { id: "substrate", name: "Organic substrate", description: "Bottom organic package substrate that connects to the PCB via solder balls. Built by Unimicron, Ibiden, or AT&S. Power delivery + signal routing to the server motherboard.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.50, y: 0.815 } },
  ],
  relatedSites: [],
};
