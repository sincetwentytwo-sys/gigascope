import type { ProductSpec } from "./index";

export const nvdaBlackwell: ProductSpec = {
  slug: "nvda-blackwell",
  name: "NVIDIA Blackwell B200",
  aka: "GB200 superchip",
  category: "compute",
  description:
    "Two reticle-limited GPU dies fabricated on TSMC N4P, joined by a 10 TB/s NVLink-C2C interconnect into a single logical GPU. 208 billion transistors total. 8 HBM3E stacks deliver 192 GB at 8 TB/s. Packaged on a CoWoS-L interposer with local Si interconnect bridges. ~1,200 W thermal design point. The defining AI training accelerator of the 2024–2026 hyperscaler buildout.",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "interposer", name: "Silicon interposer (CoWoS-L)", description: "TSMC CoWoS-L advanced packaging. Two reticle-limited GPU dies + 8 HBM3E stacks mounted on a fan-out interposer with local-silicon-interconnect (LSI) bridges between dies. The actual production bottleneck on every Blackwell shipment.", geometry: "box", args: [0,0,0], color: "#374151", hotspot: { x: 0.50, y: 0.55 } },
    { id: "gpu-die-1", name: "GPU die 1", description: "104 billion transistors. Reticle-limited at TSMC N4P node. Contains streaming multiprocessors, L2 cache, Tensor Cores (5th gen), Transformer Engine (2nd gen), NVLink-C2C south edge interface to GPU die 2.", geometry: "box", args: [0,0,0], color: "#76b900", hotspot: { x: 0.42, y: 0.53 } },
    { id: "gpu-die-2", name: "GPU die 2", description: "104 billion transistors, mirror layout of die 1. The two dies appear to software as one monolithic GPU thanks to the 10 TB/s NVLink-C2C link. Together: 208 B transistors, ~1×10²⁰ FP4 FLOPS dense.", geometry: "box", args: [0,0,0], color: "#76b900", hotspot: { x: 0.57, y: 0.53 } },
    { id: "nvlink-c2c", name: "NVLink-C2C (chip-to-chip)", description: "10 TB/s coherent interconnect joining the two GPU dies along the inner edge. Removes the inter-die hop penalty for tensor parallelism — the two dies share L2 cache state and look like one GPU to CUDA.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.50, y: 0.53 } },
    { id: "hbm-1", name: "HBM3E stack 1 (left)", description: "12-Hi (12 DRAM dies) stack of HBM3E. 24 GB per stack, ~1.2 TB/s. Sourced from SK Hynix (sole-source on first Blackwell SKUs) and Micron, with Samsung pushing to qualify HBM3E 12-Hi in 2025-2026.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.255, y: 0.34 } },
    { id: "hbm-2", name: "HBM3E stack 2 (left)", description: "Second of four left-side HBM3E stacks. All 8 stacks share the 1024-bit total interface across the interposer.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.255, y: 0.43 } },
    { id: "hbm-3", name: "HBM3E stack 3 (left)", description: "Third of four left-side HBM3E stacks.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.255, y: 0.53 } },
    { id: "hbm-4", name: "HBM3E stack 4 (left)", description: "Fourth left-side HBM3E stack.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.255, y: 0.62 } },
    { id: "hbm-5", name: "HBM3E stack 5 (right)", description: "Fifth HBM3E stack — first of four on the right side, symmetric layout vs left bank.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.745, y: 0.34 } },
    { id: "hbm-6", name: "HBM3E stack 6 (right)", description: "Sixth HBM3E stack.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.745, y: 0.43 } },
    { id: "hbm-7", name: "HBM3E stack 7 (right)", description: "Seventh HBM3E stack.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.745, y: 0.53 } },
    { id: "hbm-8", name: "HBM3E stack 8 (right)", description: "Eighth HBM3E stack. Total memory: 192 GB at 8 TB/s aggregate bandwidth.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.745, y: 0.62 } },
    { id: "pcie", name: "PCIe 6.0 I/O", description: "PCIe Gen 6 host interface plus NVLink-NW for inter-GPU scale-out across NVSwitch fabric. 1.8 TB/s aggregate I/O.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.77 } },
    { id: "power", name: "Power delivery", description: "~1,200 W typical board TGP. Multi-phase VRM, direct-die liquid cooling standard in NVL72 rack deployments.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.22, y: 0.77 } },
  ],
  relatedSites: [],
};
