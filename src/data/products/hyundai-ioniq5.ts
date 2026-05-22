import type { ProductSpec } from "./index";

export const hyundaiIoniq5: ProductSpec = {
  slug: "hyundai-ioniq5",
  name: "Hyundai IONIQ 5",
  aka: "E-GMP global EV",
  category: "vehicle",
  description:
    "First Hyundai built on the dedicated E-GMP electric platform. 800 V architecture (vs 400 V on most competitors) enables 350 kW DC fast charging — 10-80% in 18 minutes. Skateboard battery pack, fully flat floor, V2L (vehicle-to-load) bidirectional power. World Car of the Year 2022. Built at Hyundai Ulsan + Metaplant America (Ellabell GA).",
  cameraPosition: [0, 0, 5],
  imageType: "svg",
  parts: [
    { id: "adas", name: "ADAS sensor stack", description: "Front-facing camera + radar + side ultrasonic sensors. Highway Driving Assist 2 (HDA 2) supports hands-off (eyes-on) lane changes. Hyundai is integrating L3 capability for select markets via the Pleos OS update.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.50, y: 0.23 } },
    { id: "front-motor", name: "Front motor (100 kW)", description: "Permanent magnet synchronous motor on the front axle. AWD variants pair this with a larger rear motor for total 239 kW (320 hp) combined. The IONIQ 5 N tunes both motors to 478 kW combined.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.205, y: 0.465 } },
    { id: "body", name: "Body / silhouette", description: "Pixel-themed exterior design — homage to the 1974 Pony concept. CdC0.288, length 4,635 mm, wheelbase 3,000 mm (longer than midsize sedans despite compact-crossover footprint). E-GMP modularity allows the same platform to build IONIQ 5, IONIQ 6, IONIQ 9, EV6, EV9.", geometry: "box", args: [0,0,0], color: "#1e293b", hotspot: { x: 0.50, y: 0.41 } },
    { id: "rear-motor", name: "Rear motor (165 kW)", description: "Larger rear motor in RWD/AWD variants. PMSM, oil-cooled, integrated reducer. 350 N·m torque. The IONIQ 5 N uses a different rear motor with overboost mode for 478 kW peak.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.785, y: 0.465 } },
    { id: "front-wheel", name: "Front wheel", description: "Standard 19\" / 20\" wheels. The IONIQ 5 N uses 21\" forged wheels with Pirelli P Zero tires.", geometry: "sphere", args: [0,0,0], color: "#374151", hotspot: { x: 0.21, y: 0.615 } },
    { id: "rear-wheel", name: "Rear wheel", description: "Wheelbase is 3,000 mm — longer than competitor crossovers, enabling the flat floor + lounge seating.", geometry: "sphere", args: [0,0,0], color: "#374151", hotspot: { x: 0.79, y: 0.615 } },
    { id: "battery", name: "77 kWh battery pack (E-GMP skateboard)", description: "Standard range: 58 kWh. Long range: 77.4 kWh. NCM 8:1:1 chemistry, supplied by SK On. Pack-as-platform — the structural battery floor is the skateboard. 800 V architecture is unique among non-luxury EVs.", geometry: "box", args: [0,0,0], color: "#0066cc", hotspot: { x: 0.50, y: 0.695 } },
    { id: "charge-port", name: "350 kW DC fast charge inlet", description: "CCS Combo 2 inlet supports 350 kW DC fast charging — among the highest commercially available. 10% → 80% in ~18 minutes on a 350 kW Ionity station. Also V2L (vehicle-to-load) bidirectional: powers home appliances or other EVs.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.50, y: 0.81 } },
  ],
  relatedSites: [],
};
