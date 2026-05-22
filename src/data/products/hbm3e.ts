import type { ProductSpec } from "./index";

export const hbm3e: ProductSpec = {
  slug: "hbm3e",
  name: "HBM3E 12-Hi stack",
  aka: "High Bandwidth Memory 3 Extended",
  category: "memory",
  description:
    "12 vertically stacked DRAM dies plus a logic base die, bonded by through-silicon vias (TSVs). Each stack delivers 24-36 GB at ~1.2 TB/s. The structural bottleneck on every NVIDIA Hopper/Blackwell GPU. SK Hynix holds ~55% market share and is sole-source on key Blackwell SKUs; Samsung pushing to qualify; Micron the smallest but only US-headquartered supplier.",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "die-12", name: "DRAM die 12 (top)", description: "Topmost DRAM die. Each die is a 16 Gb or 24 Gb DDR5-class device fabricated on a leading-edge DRAM node (1a/1b/1c). The top die has a slightly thicker substrate to allow handling during stack assembly.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.185 } },
    { id: "die-11", name: "DRAM die 11", description: "DRAM die 11 of 12. All non-top dies are thinned to ~30-40 µm to keep the total stack height below ~720 µm (HBM3E spec).", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.24 } },
    { id: "die-10", name: "DRAM die 10", description: "DRAM die 10.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.295 } },
    { id: "die-9", name: "DRAM die 9", description: "DRAM die 9.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.345 } },
    { id: "die-8", name: "DRAM die 8", description: "DRAM die 8.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.40 } },
    { id: "die-7", name: "DRAM die 7", description: "DRAM die 7.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.45 } },
    { id: "die-6", name: "DRAM die 6", description: "DRAM die 6.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.505 } },
    { id: "die-5", name: "DRAM die 5", description: "DRAM die 5.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.56 } },
    { id: "die-4", name: "DRAM die 4", description: "DRAM die 4.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.612 } },
    { id: "die-3", name: "DRAM die 3", description: "DRAM die 3.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.664 } },
    { id: "die-2", name: "DRAM die 2", description: "DRAM die 2.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.716 } },
    { id: "die-1", name: "DRAM die 1 (bottom)", description: "Bottom DRAM die. Sits directly above the logic base die that handles all I/O routing and channel mapping.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.766 } },
    { id: "base-die", name: "Logic base die", description: "Custom logic die that exposes the 1024-bit HBM3E interface to the SoC interposer. Contains row-buffer control, ECC, refresh management. Fabricated on a more advanced node than the DRAM dies above — HBM4 will move this to TSMC N3/N4 for processing-in-memory features.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.82 } },
    { id: "tsv-left", name: "TSV (through-silicon vias)", description: "Through-silicon vias drilled vertically through every die in the stack, plated with copper. Carry data, clock, and power between the dies. Pitch ~50 µm, several thousand TSVs per stack.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.08, y: 0.50 } },
    { id: "tsv-right", name: "TSV (right side)", description: "Mirror TSV column on the opposite edge of the stack. HBM3E uses bilateral I/O routing — half the channels go to each side of the base die.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.92, y: 0.50 } },
  ],
  relatedSites: [],
};
