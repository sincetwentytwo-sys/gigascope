import type { ProductSpec } from "./index";

// Units: 1 scene unit = 1m. Powerwall 3: 1.10m tall x 0.61m wide x 0.19m deep.
export const powerwall: ProductSpec = {
  slug: "powerwall",
  name: "Tesla Powerwall 3",
  aka: "Home battery with integrated PV inverter",
  category: "battery",
  description:
    "Wall-mounted residential lithium iron phosphate battery: 13.5 kWh usable, 11.5 kW continuous output, 185 A LRA motor-starting capacity. Powerwall 3 collapses the solar inverter, battery inverter, and energy storage into a single 1.10 x 0.61 x 0.19 m enclosure, eliminating string/micro-inverters on new PV installs.",
  cameraPosition: [1.15, 0.94, 1.67],
  cameraTarget: [0, 0.55, 0],
  cameraMinDistance: 0.7,
  cameraMaxDistance: 8,
  background: "#0a0a0f",
  photoCredit: {
    author: "Wikimedia Commons contributors",
    license: "CC BY-SA (see source)",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Tesla_Powerwall",
  },
  parts: [
    {
      id: "shell",
      name: "Body Shell",
      description:
        "Powder-coated aluminum enclosure, IP67 indoor/outdoor rated -20 to +50 C. Convection-cooled — no exterior fans means no dust ingress, no service-life-limited bearings, and silent operation in living spaces.",
      position: [0, 0.55, 0],
      geometry: "box",
      args: [0.61, 1.1, 0.19],
      color: "#f0f0f0",
      metalness: 0.4,
      roughness: 0.5,
      hotspot: { x: 0.5337, y: 0.5262 },
    },
    {
      id: "led-bar",
      name: "LED Status Bar",
      description:
        "Light pipe across the front face indicates charge level, grid mode (on-grid / backup / off-grid), and fault state without requiring the app. Dims to 1% at night to avoid bedroom light pollution.",
      position: [0, 1.05, 0.097],
      geometry: "box",
      args: [0.5, 0.015, 0.005],
      color: "#1a1a1f",
      emissive: "#3a9ad9",
      metalness: 0.2,
      roughness: 0.3,
    },
    {
      id: "tesla-badge",
      name: "Tesla Badge",
      description:
        "Embossed Tesla wordmark — purely cosmetic but also the user-facing reference point: installers orient the unit with the badge upright so the integrated cooling channels run vertically as designed.",
      position: [0, 0.55, 0.097],
      geometry: "box",
      args: [0.12, 0.02, 0.003],
      color: "#222226",
      metalness: 0.6,
      roughness: 0.4,
      hotspot: { x: 0.5336, y: 0.5261 },
    },
    {
      id: "module-1",
      name: "LFP Battery Module 1",
      description:
        "Lithium iron phosphate cell pack. LFP chemistry: no nickel/cobalt, ~6,000 deep cycles, much safer thermal envelope than NMC (decomposition ~270 C vs ~150 C). Tradeoff is energy density, irrelevant for a wall-mounted home unit.",
      position: [-0.13, 0.30, 0],
      geometry: "box",
      args: [0.25, 0.32, 0.13],
      color: "#2c5f8d",
      metalness: 0.3,
      roughness: 0.6,
    },
    {
      id: "module-2",
      name: "LFP Battery Module 2",
      description:
        "Second of four parallel LFP modules summing to 13.5 kWh usable (96% DoD). Internal contactor isolates the module on cell-level fault while the remaining three keep the home backed up at reduced capacity.",
      position: [0.13, 0.30, 0],
      geometry: "box",
      args: [0.25, 0.32, 0.13],
      color: "#2c5f8d",
      metalness: 0.3,
      roughness: 0.6,
    },
    {
      id: "module-3",
      name: "LFP Battery Module 3",
      description:
        "Third LFP module. BMS monitors per-cell voltage at 4 mV resolution and per-module temperature at 0.5 C. Drift triggers passive balancing during the absorption phase of every charge cycle.",
      position: [-0.13, 0.62, 0],
      geometry: "box",
      args: [0.25, 0.32, 0.13],
      color: "#2c5f8d",
      metalness: 0.3,
      roughness: 0.6,
    },
    {
      id: "module-4",
      name: "LFP Battery Module 4",
      description:
        "Fourth LFP module. 10-year unlimited-cycle warranty at 70% retention. Up to four Powerwall 3s can be paralleled for 54 kWh / 46 kW, and Expansion Packs (battery-only, no inverter) chain to 13.5 kWh each beyond that.",
      position: [0.13, 0.62, 0],
      geometry: "box",
      args: [0.25, 0.32, 0.13],
      color: "#2c5f8d",
      metalness: 0.3,
      roughness: 0.6,
    },
    {
      id: "pv-inverter",
      name: "Integrated PV Inverter",
      description:
        "Built-in 11.5 kW solar inverter — the headline change from Powerwall 2. Accepts up to 6 PV strings (20 kW DC max), 60 A total, 200-600 V MPPT range, ~97.5% efficiency. DC-coupling captures ~3% more annual yield than AC-coupled designs by skipping a DC->AC->DC conversion.",
      position: [0, 1.0, -0.03],
      geometry: "box",
      args: [0.55, 0.15, 0.12],
      color: "#3a3a3f",
      metalness: 0.7,
      roughness: 0.4,
    },
    {
      id: "ac-output",
      name: "AC Output Panel",
      description:
        "Single-phase 240 V split-phase AC output, 48 A continuous (11.5 kW). Whole-home backup possible because the gateway transfers grid loads in <50 ms — fast enough that lights and PCs ride through without rebooting.",
      position: [-0.18, 0.05, -0.03],
      geometry: "box",
      args: [0.18, 0.08, 0.12],
      color: "#2a2a2f",
      metalness: 0.6,
      roughness: 0.5,
    },
    {
      id: "dc-input",
      name: "DC PV Input Panel",
      description:
        "Six DC PV string terminals plus integrated rapid shutdown initiator (NEC 2017 690.12 compliant). Each string fused at 20 A; reverse-polarity and ground-fault detection prevent the most common installer mistakes.",
      position: [0.18, 0.05, -0.03],
      geometry: "box",
      args: [0.18, 0.08, 0.12],
      color: "#2a2a2f",
      metalness: 0.6,
      roughness: 0.5,
    },
    {
      id: "fin-left",
      name: "Cooling Fin (Left)",
      description:
        "Cast aluminum cooling fin on the side edge. Passive convection sheds the ~150 W of inverter loss at full output. No moving parts means MTBF is dominated by capacitor life (>15 years at residential duty).",
      position: [-0.305, 0.55, -0.02],
      geometry: "box",
      args: [0.015, 0.9, 0.14],
      color: "#bcbcc0",
      metalness: 0.75,
      roughness: 0.4,
    },
    {
      id: "fin-right",
      name: "Cooling Fin (Right)",
      description:
        "Right-side cooling fin. Side-vented rather than rear-vented so the unit can sit flush against the wall — important in tight garages where the standard 50 mm rear clearance of competitors would not fit.",
      position: [0.305, 0.55, -0.02],
      geometry: "box",
      args: [0.015, 0.9, 0.14],
      color: "#bcbcc0",
      metalness: 0.75,
      roughness: 0.4,
    },
    {
      id: "wall-mount",
      name: "Wall Mount Bracket",
      description:
        "Steel bracket lag-bolted into wall studs. Powerwall 3 weighs 130 kg / 287 lb — the bracket transfers load into two vertical studs and a header plate, with shear capacity of 4x the unit weight per code.",
      position: [0, 0.55, -0.105],
      geometry: "box",
      args: [0.58, 1.0, 0.02],
      color: "#5a5a5f",
      metalness: 0.85,
      roughness: 0.4,
    },
    {
      id: "thermal",
      name: "Thermal Management Plate",
      description:
        "Aluminum cold plate sandwiched behind the battery modules with thermally conductive gap pad. Spreads inverter and cell heat across the full back face into the rear cooling fins, holding cell-to-cell temperature within 2 C.",
      position: [0, 0.45, -0.07],
      geometry: "box",
      args: [0.55, 0.7, 0.01],
      color: "#9aa0a6",
      metalness: 0.85,
      roughness: 0.3,
    },
  ],
  relatedSites: ["giga-nevada", "giga-buffalo"],
  galleryPhotos: [
    {
      src: "/products/photos/powerwall/1.jpg",
      label: "3",
      credit: {
        author: "Rsparks3",
        license: "CC0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATwo_Tesla_power_wall_3_devices_installed_inside_in_a_residential_home.jpg",
      },
    },
    {
      src: "/products/photos/powerwall/2.jpg",
      label: "Wall",
      credit: {
        author: "Photo by Greg Johnstone. – U.S. Department of Energy from United States",
        license: "Public domain",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AJohnstone_000178_172617_517894_4578_%2836736411886%29.jpg",
      },
    },
  ],
};

export default powerwall;
