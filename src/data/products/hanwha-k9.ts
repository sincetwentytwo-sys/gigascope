import type { ProductSpec } from "./index";

export const hanwhaK9: ProductSpec = {
  slug: "hanwha-k9",
  name: "Hanwha K9 Thunder",
  aka: "K9 self-propelled howitzer",
  category: "weapon",
  description:
    "Korea's flagship 155 mm / L52 self-propelled howitzer, in service with 9+ NATO/allied armies (Poland, Egypt, Turkey, Finland, Norway, Estonia, India, Australia, UK). 40 km range with base bleed rounds, 60 km with V-LAP. Autoloader supports burst-fire 3 rounds in 15 seconds. The most-exported Western 155 mm SPH of the 2020s.",
  cameraPosition: [0, 0, 5],
  mainCredit: {
    source: "Wikimedia Commons (Kwon Soon-sam / Defense Citizen Network)",
    url: "https://commons.wikimedia.org/wiki/File:K-9thunder.jpg",
    license: "CC BY-SA 2.0 KR",
  },
  parts: [
    { id: "barrel", name: "155 mm L52 main gun (40 km range)", description: "52-caliber main gun (8.06 m barrel length). 40 km base range, 60 km with V-LAP (velocity-enhanced long artillery projectile). Compatible with all NATO 155 mm ammunition standards including Excalibur GPS-guided rounds.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.79, y: 0.375 } },
    { id: "turret", name: "Turret + autoloader", description: "Fully enclosed turret with armor against artillery splinter + small-arms. Autoloader supports burst-fire — 3 rounds in 15 seconds, 6 rounds/min sustained. The Polish K9PL variant uses a modified turret for compatibility with Polish ammunition.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.43, y: 0.42 } },
    { id: "driver", name: "Driver compartment", description: "Driver sits in the front-left hull. Day/night periscopes, modern digital fire control display, GPS/INS navigation. The K9A2 upgrade adds a fully automated load-and-fire mode.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.255, y: 0.585 } },
    { id: "powerpack", name: "Powerpack (MTU MT 881 / 1,000 hp)", description: "MTU MT 881 1,000 hp diesel engine + Allison transmission powerpack. Powerpack is a single removable unit — field-swappable in ~2 hours. 67 km/h top speed on road.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.765, y: 0.585 } },
    { id: "track-1", name: "Drive wheel + idler (front)", description: "Front drive sprocket. 7 road wheels per side support a 56-tonne combat weight.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.23, y: 0.73 } },
    { id: "track-2", name: "Road wheel 2", description: "Independent torsion-bar suspension on each road wheel. Designed for the steep terrain typical of the Korean peninsula.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.32, y: 0.73 } },
    { id: "track-3", name: "Road wheel 3", description: "Road wheel 3.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.41, y: 0.73 } },
    { id: "track-4", name: "Road wheel 4 (center)", description: "Center road wheel. The K9 chassis is shared with the K10 ammunition resupply vehicle.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.50, y: 0.73 } },
    { id: "track-5", name: "Road wheel 5", description: "Road wheel 5.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.59, y: 0.73 } },
    { id: "track-6", name: "Road wheel 6", description: "Road wheel 6.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.68, y: 0.73 } },
    { id: "track-7", name: "Drive sprocket (rear)", description: "Rear drive sprocket / track tensioner.", geometry: "sphere", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.77, y: 0.73 } },
  ],
  relatedSites: [],
};
