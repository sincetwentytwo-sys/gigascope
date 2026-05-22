import type { ProductSpec } from "./index";

export const lgesUltium: ProductSpec = {
  slug: "lges-ultium",
  name: "LGES Ultium pouch cell",
  aka: "NCM 9.5 large-format pouch",
  category: "battery",
  description:
    "LG Energy Solution's flagship pouch-cell chemistry used on the GM Ultium platform (Hummer EV, Silverado EV, Lyriq, Equinox EV). High-nickel NCMA cathode (~90% Ni / 5% Co / 5% Mn-Al). Stacked-electrode design with 50+ alternating layers in a single pouch. Manufactured at Ochang Korea + Wrocław Poland + Holland MI (Ultium JV).",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "pos-tab", name: "Positive tab (aluminum)", description: "Aluminum current collector tab that extends out of the pouch. Connects to the cell-level positive bus. Tabs are laser-welded to the bus bar at the module level.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.50, y: 0.285 } },
    { id: "cathode-1", name: "Cathode — NCM 9.5 (Ni 90% / Co 5% / Mn 5%)", description: "Lithium nickel-cobalt-manganese oxide cathode. ~90% Ni for high energy density, low Co for cost + ethics. Coated onto aluminum foil substrate. The 'high-nickel' chemistry that gives Korean cells their energy density advantage over Chinese LFP.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.50, y: 0.38 } },
    { id: "separator-1", name: "Ceramic-coated separator", description: "Polyethylene separator with a ceramic alumina coating. The ceramic layer prevents thermal runaway propagation and improves cycle life. Korean cell makers ship ceramic separators as standard; many cheaper cells skip this.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.453 } },
    { id: "anode", name: "Anode — graphite + Si-O composite", description: "Graphite + small fraction of silicon-oxide composite. The Si-O addition improves energy density at the cost of cycle life — Ultium G2 roadmap pushes Si content higher. Coated onto copper foil substrate.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.525 } },
    { id: "cathode-2", name: "Cathode (next stack layer)", description: "Stacked-electrode design alternates cathode-separator-anode-separator-cathode through 50+ layers in a single pouch. Each cell has a few hundred Ah capacity.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.50, y: 0.61 } },
    { id: "neg-tab", name: "Negative tab (copper)", description: "Copper current collector tab. Mirror of positive tab. Connects to the cell-level negative bus.", geometry: "box", args: [0,0,0], color: "#9ca3af", hotspot: { x: 0.50, y: 0.715 } },
    { id: "pouch", name: "Aluminum pouch laminate + electrolyte", description: "Aluminum laminate film with polymer inner/outer layers — softer alternative to prismatic metal cans. Filled with liquid electrolyte (LiPF₆ in carbonate solvent mix) and vacuum-sealed. Allows higher gravimetric density than prismatic cells.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.805 } },
  ],
  relatedSites: [],
};
