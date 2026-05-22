import type { ProductSpec } from "./index";

export const okloAurora: ProductSpec = {
  slug: "oklo-aurora",
  name: "Oklo Aurora",
  aka: "Liquid-metal-cooled micro-reactor",
  category: "reactor",
  description:
    "Oklo's flagship small modular reactor design. 15-50 MWe per unit. Sodium- or lead-cooled fast spectrum, HALEU fuel (19.75% enriched). Factory-built, ships to site as a single A-frame structure. First Aurora targeted for the Idaho National Laboratory under DOE collaboration. Hyperscaler PPA pipeline (Microsoft, Amazon AWS) anchors near-term commercial demand.",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "shelter", name: "A-frame roof / shelter", description: "Site-built A-frame structural shelter housing the entire reactor module. Designed to be visually unobtrusive — Aurora targets siting next to data centers, not isolated nuclear plants. Modular construction allows replication.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.20 } },
    { id: "vessel", name: "Reactor vessel", description: "Steel pressure vessel containing the reactor core + primary coolant loop. Designed for ~30-year fuel cycle without refueling (factory-loaded HALEU lasts the entire design lifetime).", geometry: "cylinder", args: [0,0,0], color: "#374151", hotspot: { x: 0.50, y: 0.40 } },
    { id: "core", name: "Reactor core (HALEU 19.75%)", description: "Reactor core fueled with High-Assay Low-Enriched Uranium (HALEU, 19.75% U-235). Fast-spectrum design — neutrons aren't moderated, allowing transmutation of long-lived actinides. Sized for 15-50 MWe (electrical) depending on configuration.", geometry: "cylinder", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.50, y: 0.385 } },
    { id: "control-rods", name: "Control rods", description: "Movable absorbers (boron carbide or hafnium) control reactor power. In SMR designs they double as passive shutdown — gravity drops them into the core if any signal is lost.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.50, y: 0.515 } },
    { id: "primary-loop", name: "Liquid-metal primary loop (Na or Pb)", description: "Liquid sodium or lead coolant circulates through the core, extracts heat, transfers it to the secondary loop via the steam generator. Unlike water-cooled reactors, liquid metal operates at atmospheric pressure — no high-pressure containment needed.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.610 } },
    { id: "steam-gen", name: "Steam generator (secondary loop)", description: "Heat exchanger that transfers thermal energy from the primary liquid-metal loop to the secondary water/steam loop. Isolates the radioactive primary coolant from the turbine.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.34, y: 0.700 } },
    { id: "turbine", name: "Turbine + generator", description: "Steam turbine + electrical generator. Either conventional Rankine cycle or supercritical CO₂ Brayton cycle depending on customer configuration. Output: 15-50 MWe of dispatchable carbon-free power.", geometry: "box", args: [0,0,0], color: "#0066cc", hotspot: { x: 0.66, y: 0.700 } },
    { id: "grid", name: "Grid interconnect", description: "Step-up transformer + grid interconnect. Aurora is designed for direct-PPA arrangements with data center customers (no utility intermediary) — first commercial deals are hyperscaler-anchored.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.50, y: 0.835 } },
  ],
  relatedSites: [],
};
