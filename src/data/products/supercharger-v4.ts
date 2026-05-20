import type { ProductSpec } from "./index";

// Units: 1 scene unit = 1m. Supercharger V4 pillar ~2.3 m tall, slim profile.
export const superchargerV4: ProductSpec = {
  slug: "supercharger-v4",
  name: "Tesla Supercharger V4",
  aka: "500 kW NACS DC fast charger",
  category: "charging",
  description:
    "Fourth-generation Supercharger pillar: 500 kW peak capable (current rollout ~325 kW per stall), 1,000 VDC bus, native NACS plug, extra-long ~3 m liquid-cooled cable so non-Tesla EVs with side or rear charge ports can reach the stall. Powered from off-board 1.5 MW V4 cabinets shared across 4-8 stalls.",
  cameraPosition: [3.4, 2.8, 5.0],
  cameraTarget: [-0.8, 1.2, 0.1],
  cameraMinDistance: 1.5,
  cameraMaxDistance: 18,
  background: "#0a0a0f",
  photoCredit: {
    author: "Gamesyns",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tesla_V4_Supercharger_(cropped).jpg",
  },
  parts: [
    {
      id: "pillar",
      name: "Pillar Body",
      description:
        "Slim stainless / powder-coated steel pillar, ~2.3 m tall, IK10 vandal-rated. No power electronics inside the stall — V4 moves them to a shared ground cabinet, so the pillar is just signaling, contactor, and cable management. Service swaps in ~20 minutes.",
      position: [0, 1.15, 0],
      geometry: "box",
      args: [0.35, 2.3, 0.18],
      color: "#1c1c20",
      metalness: 0.55,
      roughness: 0.45,
      hotspot: { points: "0.3581,0.0556 0.2733,0.0714 0.2850,0.7363 0.3180,0.8034 0.3687,0.8430 0.4393,0.8668 0.5253,0.8677 0.5854,0.8510 0.6372,0.8175 0.6879,0.7046 0.6949,0.0750 0.5866,0.0538" },
    },
    {
      id: "top-status",
      name: "Top Status Indicator",
      description:
        "RGB light bar visible across the parking lot. Green = available, blue = charging, red = fault. Brightness auto-adjusts so drivers can spot an open stall at 50 m at night without blinding pedestrians at close range.",
      position: [0, 2.27, 0.091],
      geometry: "box",
      args: [0.3, 0.04, 0.005],
      color: "#1a1a1f",
      emissive: "#3a9ad9",
      metalness: 0.3,
      roughness: 0.3,
    },
    {
      id: "t-logo",
      name: "Tesla T Plate",
      description:
        "Brushed aluminum Tesla T emblem. Functions as the stall number anchor — the white reflective stall number is silkscreened directly below it for high-contrast wayfinding from inside a vehicle.",
      position: [0, 1.95, 0.091],
      geometry: "box",
      args: [0.12, 0.12, 0.003],
      color: "#d8d8dc",
      metalness: 0.9,
      roughness: 0.3,
    },
    {
      id: "holster",
      name: "Cable Holster",
      description:
        "Magnetic cradle holding the NACS connector when not in use. Spring-loaded retraction takes up cable slack so the ~3 m cable does not drag on the asphalt — a major durability fix vs the V3 holster, which was the #1 mechanical failure point.",
      position: [-0.22, 1.4, 0.05],
      geometry: "torus",
      args: [0.07, 0.018, 12, 24],
      rotation: [Math.PI / 2, 0, 0],
      color: "#3a3a3f",
      metalness: 0.7,
      roughness: 0.4,
    },
    {
      id: "cable",
      name: "Charging Cable",
      description:
        "~3 m liquid-cooled DC cable. V4 lengthened the cable vs V3 (~1.5 m) specifically to reach non-Tesla EVs with charge ports on the driver-side front (Ford Mach-E) or passenger rear (Hyundai Ioniq 5).",
      position: [-0.55, 1.4, 0.05],
      geometry: "cylinder",
      args: [0.022, 0.022, 0.7, 16, 1],
      rotation: [0, 0, Math.PI / 2],
      color: "#202024",
      metalness: 0.4,
      roughness: 0.55,
      hotspot: { points: "0.3581,0.0556 0.2827,0.0653 0.2721,0.0794 0.2850,0.7372 0.3180,0.8034 0.3640,0.8404 0.4382,0.8668 0.5112,0.8695 0.5724,0.8563 0.6360,0.8192 0.6879,0.7055 0.6949,0.0732 0.5748,0.0529" },
    },
    {
      id: "connector",
      name: "NACS Connector Head",
      description:
        "North American Charging Standard plug — single 5-pin assembly handling both AC and DC. Spec was open-sourced and adopted as SAE J3400; Ford, GM, Rivian, Hyundai, BMW, and others have shipped or committed to NACS-native vehicles for 2025-2026.",
      position: [-0.92, 1.4, 0.05],
      geometry: "box",
      args: [0.13, 0.1, 0.09],
      color: "#2a2a2f",
      metalness: 0.6,
      roughness: 0.4,
    },
    {
      id: "screen",
      name: "Driver Display",
      description:
        "5-inch sunlight-readable LCD showing kW, kWh delivered, SOC estimate, and session cost. New in V4: shows pricing per kWh up-front (PlugShare / J3400 transparency requirement) and accepts contactless credit/debit per CALGreen and NEVI rules.",
      position: [0, 1.75, 0.091],
      geometry: "box",
      args: [0.18, 0.12, 0.005],
      color: "#0a0a0f",
      emissive: "#1a1a1f",
      metalness: 0.3,
      roughness: 0.3,
    },
    {
      id: "rfid",
      name: "RFID Tap Zone",
      description:
        "ISO 14443 NFC reader for Plug & Charge ISO 15118-20 authentication. Non-Tesla EVs can tap a payment card or phone here; Teslas authenticate over PLC on the pilot pin and never touch this surface.",
      position: [0, 1.55, 0.091],
      geometry: "box",
      args: [0.1, 0.08, 0.003],
      color: "#1a1a1f",
      metalness: 0.4,
      roughness: 0.5,
    },
    {
      id: "led-ring",
      name: "Connector LED Ring",
      description:
        "Ring on the connector head body pulses while session is live and goes solid when charge complete. Helps drivers spot a finished session from inside their cabin at a glance — reduces idle-fee triggering by ~30% in Tesla's field data.",
      position: [-0.92, 1.4, 0.10],
      geometry: "ring",
      args: [0.045, 0.058, 24],
      rotation: [0, Math.PI / 2, 0],
      color: "#3a9ad9",
      emissive: "#3a9ad9",
      metalness: 0.3,
      roughness: 0.3,
    },
    {
      id: "base",
      name: "Mounting Base Plate",
      description:
        "Cast steel base plate anchored with 4x M16 wedge anchors into the concrete pad. Designed for 30 kN side-impact (low-speed vehicle bump) without uprooting; bollards optional per host-site spec.",
      position: [0, 0.025, 0],
      geometry: "box",
      args: [0.5, 0.05, 0.4],
      color: "#3a3a3f",
      metalness: 0.7,
      roughness: 0.5,
    },
    {
      id: "coolant-strand",
      name: "Liquid Coolant Strand",
      description:
        "Two-circuit dielectric coolant loop running coaxially inside the cable. High-current DC charging (500+ A) would otherwise need ~50 mm copper or active fan cooling; the liquid loop keeps the connector grip surface <50 C even at full 500 kW and lets the cable stay flexible and light.",
      position: [-0.55, 1.4, 0.05],
      geometry: "cylinder",
      args: [0.008, 0.008, 0.7, 12, 1],
      rotation: [0, 0, Math.PI / 2],
      color: "#4a90c2",
      metalness: 0.5,
      roughness: 0.4,
    },
  ],
  relatedSites: ["fremont", "giga-buffalo", "giga-texas"],
  galleryPhotos: [
    {
      src: "/products/photos/supercharger-v4/1.jpg",
      label: "Stall",
      credit: {
        author: "Gamesyns",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATesla_V4_Supercharger.jpg",
      },
    },
    {
      src: "/products/photos/supercharger-v4/2.jpg",
      label: "Station",
      credit: {
        author: "Dietmar Rabich",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AMissoula_%28MT%2C_USA%29%2C_Tesla_Supercharger_--_2022_--_194228.jpg",
      },
    },
    {
      src: "/products/photos/supercharger-v4/3.jpg",
      label: "Cable",
      credit: {
        author: "Paul Sladen",
        license: "CC0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AEu-tesla-supercharger-dual-cable-outlet-iec-type-2-notched-ccs-combo-2-artistic.jpg",
      },
    },
  ],
};

export default superchargerV4;
