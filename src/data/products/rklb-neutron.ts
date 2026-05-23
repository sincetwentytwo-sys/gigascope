import type { ProductSpec } from "./index";

export const rklbNeutron: ProductSpec = {
  slug: "rklb-neutron",
  name: "Rocket Lab Neutron",
  aka: "Medium-lift reusable rocket",
  category: "rocket",
  description:
    "Rocket Lab's next-generation medium-lift reusable launcher. 13 tonnes to LEO, fully reusable first stage. Methalox propellant, carbon-composite tanks, 7× Archimedes engines liftoff. Maiden flight target 2026 — the binary catalyst on RKLB's valuation. Built at Wallops Island VA + Long Beach CA.",
  cameraPosition: [0, 0, 5],
  mainCredit: {
    source: "Wikimedia Commons (CaglayanKutay / Soumya-8974) — labeled diagram",
    url: "https://commons.wikimedia.org/wiki/File:RocketLab_Neutron_ana_k%C4%B1s%C4%B1mlar_(en).png",
    license: "CC BY-SA 4.0",
  },
  parts: [
    { id: "fairing", name: "Hungry Hippo payload fairing", description: "Permanently attached payload fairing — the 'Hungry Hippo' design swings open like jaws to release the payload, then closes again for return. Unlike Falcon 9 fairings (which separate and are recovered separately), Neutron's stay attached and reusable.", geometry: "cone", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.155 } },
    { id: "stage-2", name: "2nd stage (expendable initially)", description: "Single Archimedes vacuum-optimized engine. Initially expendable, reuse roadmap is post-flight-10. Carbon-composite construction.", geometry: "cylinder", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.50, y: 0.25 } },
    { id: "stage-1", name: "1st stage tank (methalox)", description: "Reusable first stage. Carbon-composite tanks for methane (fuel) + liquid oxygen (oxidizer). Returns to land at Wallops Island via propulsive landing — RTLS only (no drone ship).", geometry: "cylinder", args: [0,0,0], color: "#374151", hotspot: { x: 0.50, y: 0.50 } },
    { id: "interstage", name: "Interstage / propellant feed", description: "Houses the propellant transfer lines from tank to engines, plus the separation mechanisms.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.50, y: 0.74 } },
    { id: "engines", name: "7× Archimedes engines", description: "7 Archimedes engines — methalox, oxidizer-rich staged combustion, in-house developed by Rocket Lab. 165 tonnes-force total liftoff thrust. Engine inherits learnings from Rutherford (Electron's electric-pump engine).", geometry: "cylinder", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.50, y: 0.84 } },
    { id: "fin-1", name: "Aerodynamic canard 1", description: "Lower canard for atmospheric reentry control. Used during the boost-back and entry burn for steering. Rocket Lab developed the canard architecture in-house — different from Falcon 9's grid fins.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.31, y: 0.815 } },
    { id: "fin-2", name: "Aerodynamic canard 2", description: "Second canard for stability during atmospheric flight. Both canards retract during ascent and deploy on descent.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.69, y: 0.815 } },
  ],
  relatedSites: [],
};
