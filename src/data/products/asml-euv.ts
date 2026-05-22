import type { ProductSpec } from "./index";

export const asmlEuv: ProductSpec = {
  slug: "asml-euv",
  name: "ASML High-NA EUV (TWINSCAN EXE:5000)",
  aka: "High-numerical-aperture EUV scanner",
  category: "lithography",
  description:
    "Next-generation EUV lithography tool from ASML — 0.55 NA (vs 0.33 NA for prior NXE series). ~$380M per system. Generates 13.5 nm extreme-ultraviolet light by hitting molten tin droplets with a CO₂ laser 50,000 times per second. Single-source on the entire planet for sub-2 nm logic. First systems shipping to TSMC, Intel, Samsung, SK Hynix in 2024-2026. The single most monopolistic asset in semiconductor manufacturing.",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "laser", name: "CO₂ laser source (Cymer)", description: "30 kW pre-pulse + main-pulse CO₂ laser. Built by Cymer (ASML subsidiary). Generates the laser pulses that vaporize tin droplets to produce EUV plasma. The laser-produced plasma (LPP) architecture is unique to ASML.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.15, y: 0.285 } },
    { id: "plasma", name: "Tin droplet plasma chamber", description: "50,000 molten tin droplets per second fall through a vacuum chamber. The CO₂ laser hits each droplet, vaporizing it to ~220,000 K plasma that emits 13.5 nm EUV light. Captured photons are routed via mirrors.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.36, y: 0.285 } },
    { id: "collector", name: "Collector mirror", description: "Molybdenum/silicon multilayer mirror that focuses the EUV light from the plasma into a beam. Surface roughness measured in single atoms. Manufactured by Zeiss SMT (the only company that can make EUV-grade optics).", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.56, y: 0.285 } },
    { id: "projection", name: "Projection optics (Zeiss)", description: "Series of multilayer reflective mirrors that demagnify the reticle pattern by ~4× onto the wafer. High-NA uses anamorphic optics — the demagnification is 4× horizontal and 8× vertical. Zeiss SMT manufactures the entire optical column.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.81, y: 0.285 } },
    { id: "reticle", name: "Reticle stage (EUV mask)", description: "Reflective EUV mask sits on a precision-controlled stage. The patterns drawn on the mask are 4× larger than what will be printed on the wafer. Mask blanks are manufactured by AGC, Hoya, and Schott — also EUV-monopolist suppliers.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.40, y: 0.62 } },
    { id: "wafer-stage", name: "Wafer stage (dual-stage)", description: "300 mm wafer chuck mounted on a magnetically levitated stage that moves at >2 m/s with nanometer-scale positioning accuracy. Dual-stage: while one wafer is being exposed, the next is being aligned. ASML's dual-stage architecture has been a competitive moat since 2001.", geometry: "box", args: [0,0,0], color: "#0066cc", hotspot: { x: 0.73, y: 0.685 } },
    { id: "chamber", name: "Vacuum chamber + frame", description: "EUV is absorbed by air, so the entire optical path must be in vacuum. The chamber + isolation frame weighs ~165 tonnes. Vibration isolation maintains nanometer-scale positioning under ambient floor vibration.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.15, y: 0.685 } },
  ],
  relatedSites: [],
};
