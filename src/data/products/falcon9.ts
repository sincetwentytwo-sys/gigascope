import type { ProductSpec, PartSpec } from "./index";

// Falcon 9 Block 5 — 70m tall, 3.7m diameter core. 1 unit = 1m.
// Vertical stack from y=0 (engine bells) upward.

const WHITE = "#f2f2f2";
const SOOT = "#1a1a1a";
const DARK = "#2a2a2a";
const STEEL = "#8a8f95";
const COPPER = "#b87333";
const RADIUS = 1.85; // 3.7m / 2

// OctaWeb engine positions (1 center + 8 outer at ~1.3m radius)
const octaweb = (): PartSpec[] => {
  const parts: PartSpec[] = [];
  const ringR = 1.3;
  const positions: Array<[number, number]> = [[0, 0]];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    positions.push([Math.cos(a) * ringR, Math.sin(a) * ringR]);
  }
  positions.forEach(([x, z], i) => {
    parts.push({
      id: `merlin-${i + 1}`,
      name: `Merlin 1D #${i + 1}${i === 0 ? " (center)" : ""}`,
      description:
        "Merlin 1D: kerosene/LOX gas-generator engine, 845 kN sea-level thrust at 97 bar chamber pressure, Isp 282s. Pintle injector, throttleable 40-100%, gimbaled ±5° on 8 outer units for TVC. Reusable 10+ flights.",
      position: [x, 0.6, z],
      geometry: "cone",
      args: [0.45, 1.2, 24],
      color: SOOT,
      metalness: 0.6,
      roughness: 0.5,
    });
  });
  return parts;
};

const parts: PartSpec[] = [
  ...octaweb(),
  {
    id: "stage1-thrust-structure",
    name: "Stage 1 Thrust Structure",
    description:
      "Aluminum-lithium 2195 octagonal thrust structure transmitting 7,607 kN combined thrust from 9 Merlins into the tank skin. Houses TEA-TEB pyrophoric igniters and helium COPV pressurization bottles for tank repress.",
    position: [0, 1.8, 0],
    geometry: "cylinder",
    args: [RADIUS, RADIUS, 1.2, 32],
    color: SOOT,
    metalness: 0.7,
    roughness: 0.4,
  },
  {
    id: "stage1-tank",
    name: "Stage 1 Tank (RP-1 + LOX)",
    description:
      "Friction-stir-welded 2195 Al-Li monocoque holding 287t LOX (upper) and 123t RP-1 (lower) separated by a common bulkhead. Autogenous pressurization via heated helium. Subcooled propellants densify load by ~12%.",
    position: [0, 22, 0],
    geometry: "cylinder",
    args: [RADIUS, RADIUS, 39, 32],
    color: WHITE,
    metalness: 0.2,
    roughness: 0.6,
  },
  {
    id: "grid-fin-1",
    name: "Titanium Grid Fin (+X)",
    description:
      "Forged + machined titanium grid fin, hypersonic-capable, replaces aluminum originals after Iridium-4 burn-through. Deploys post-MECO, provides reentry roll/pitch/yaw control with ~10x more surface authority than solid fins.",
    position: [RADIUS + 0.4, 40, 0],
    rotation: [0, 0, 0],
    geometry: "box",
    args: [0.15, 1.4, 1.2],
    color: STEEL,
    metalness: 0.8,
    roughness: 0.35,
  },
  {
    id: "grid-fin-2",
    name: "Titanium Grid Fin (-X)",
    description:
      "One of four hypersonic Ti grid fins (~50 kg each). Survives Mach 5+ reentry heating without ablative coating, unlike legacy Al fins which required replacement every flight.",
    position: [-(RADIUS + 0.4), 40, 0],
    geometry: "box",
    args: [0.15, 1.4, 1.2],
    color: STEEL,
    metalness: 0.8,
    roughness: 0.35,
  },
  {
    id: "grid-fin-3",
    name: "Titanium Grid Fin (+Z)",
    description:
      "Grid fin actuated by hydraulic system fed from the stage 1 RP-1 tank via an open-loop hydraulic accumulator — propellant doubles as hydraulic fluid, dumped overboard after landing.",
    position: [0, 40, RADIUS + 0.4],
    geometry: "box",
    args: [1.2, 1.4, 0.15],
    color: STEEL,
    metalness: 0.8,
    roughness: 0.35,
  },
  {
    id: "grid-fin-4",
    name: "Titanium Grid Fin (-Z)",
    description:
      "Fourth grid fin. The four fins together provide controlled lift during the entry burn corridor, steering the booster toward ASDS droneship or RTLS landing zone within ~10m CEP.",
    position: [0, 40, -(RADIUS + 0.4)],
    geometry: "box",
    args: [1.2, 1.4, 0.15],
    color: STEEL,
    metalness: 0.8,
    roughness: 0.35,
  },
  {
    id: "cold-gas-thrusters",
    name: "Cold Gas N2 Thrusters",
    description:
      "Cluster of nitrogen cold-gas RCS thrusters at the forward bulkhead. Provides attitude control above the atmosphere where grid fins are useless, including the boostback flip maneuver after stage separation.",
    position: [0, 41.5, 0],
    geometry: "sphere",
    args: [0.35, 16, 12],
    color: STEEL,
    metalness: 0.7,
    roughness: 0.4,
  },
  {
    id: "landing-leg-1",
    name: "Landing Leg (carbon-fiber, +X)",
    description:
      "Carbon-fiber/aluminum-honeycomb telescoping leg, ~9m deployed span. Deployed by high-pressure helium just before touchdown. Crush cores in the foot pad absorb residual vertical velocity (~1-2 m/s).",
    position: [RADIUS + 0.5, 2.2, 0],
    rotation: [0, 0, -0.15],
    geometry: "cylinder",
    args: [0.2, 0.25, 3.5, 12],
    color: WHITE,
    metalness: 0.3,
    roughness: 0.6,
  },
  {
    id: "landing-leg-2",
    name: "Landing Leg (-X)",
    description:
      "One of four landing legs. Mass ~2,100 kg each. Folded against booster during ascent to minimize drag; deployed pneumatically ~T-10s before touchdown.",
    position: [-(RADIUS + 0.5), 2.2, 0],
    rotation: [0, 0, 0.15],
    geometry: "cylinder",
    args: [0.2, 0.25, 3.5, 12],
    color: WHITE,
    metalness: 0.3,
    roughness: 0.6,
  },
  {
    id: "landing-leg-3",
    name: "Landing Leg (+Z)",
    description:
      "Carbon-fiber leg, replaces single-use aluminum predecessor. Block 5 legs are now retracted in place on the droneship rather than removed for reflight.",
    position: [0, 2.2, RADIUS + 0.5],
    rotation: [0.15, 0, 0],
    geometry: "cylinder",
    args: [0.2, 0.25, 3.5, 12],
    color: WHITE,
    metalness: 0.3,
    roughness: 0.6,
  },
  {
    id: "landing-leg-4",
    name: "Landing Leg (-Z)",
    description:
      "Fourth leg. With all four deployed the booster has a ~18m stance — wider than the booster is tall in landed configuration, giving stability against droneship roll in heavy seas.",
    position: [0, 2.2, -(RADIUS + 0.5)],
    rotation: [-0.15, 0, 0],
    geometry: "cylinder",
    args: [0.2, 0.25, 3.5, 12],
    color: WHITE,
    metalness: 0.3,
    roughness: 0.6,
  },
  {
    id: "interstage",
    name: "Interstage",
    description:
      "Composite carbon-fiber/aluminum-honeycomb structure connecting stages, painted black to reduce thermal cycling. Houses pneumatic pusher separation system — no pyrotechnics; collet locks release and N2 piston pushes stage 2 free.",
    position: [0, 43, 0],
    geometry: "cylinder",
    args: [RADIUS, RADIUS, 6, 32],
    color: SOOT,
    metalness: 0.4,
    roughness: 0.5,
  },
  {
    id: "stage2-tank",
    name: "Stage 2 Tank",
    description:
      "Shorter Al-Li tank carrying ~108t propellant. Single common bulkhead, autogenously pressurized. Includes a long-coast kit with extra TEA-TEB and battery for direct-GEO insertions (~6hr coasts).",
    position: [0, 53, 0],
    geometry: "cylinder",
    args: [RADIUS, RADIUS, 14, 32],
    color: WHITE,
    metalness: 0.2,
    roughness: 0.6,
  },
  {
    id: "mvac",
    name: "Merlin 1D Vacuum (MVac)",
    description:
      "Stage 2 engine with niobium-alloy radiatively-cooled nozzle extension, expansion ratio ~165, Isp 348s in vacuum. Throttleable 39-100%, single-engine gimbal ±5° for orbital insertion precision and deorbit burns.",
    position: [0, 44.5, 0],
    geometry: "cone",
    args: [1.2, 3.2, 32],
    color: COPPER,
    metalness: 0.7,
    roughness: 0.4,
  },
  {
    id: "fairing-half-1",
    name: "Payload Fairing (half +X)",
    description:
      "5.2m carbon-fiber/aluminum-honeycomb fairing half, jettisoned at ~T+3min once dynamic pressure permits. Pneumatic separation; Block 5 halves are parafoil-recovered and reflown, saving ~$3M per pair.",
    position: [0.9, 66, 0],
    rotation: [0, 0, -0.05],
    geometry: "cone",
    args: [2.0, 13, 32],
    color: WHITE,
    metalness: 0.2,
    roughness: 0.55,
  },
  {
    id: "fairing-half-2",
    name: "Payload Fairing (half -X)",
    description:
      "Mirror fairing half. Internal acoustic blankets keep payload SPL below 140 dB during transonic. Encloses customer satellite during ascent through atmosphere.",
    position: [-0.9, 66, 0],
    rotation: [0, Math.PI, 0.05],
    geometry: "cone",
    args: [2.0, 13, 32],
    color: WHITE,
    metalness: 0.2,
    roughness: 0.55,
  },
];

export const falcon9: ProductSpec = {
  slug: "falcon-9",
  name: "Falcon 9 Block 5",
  aka: "F9",
  category: "rocket",
  description:
    "Two-stage partially reusable orbital launch vehicle. 70m tall, 3.7m diameter, ~549t wet mass. LEO payload 22.8t expendable / 17.4t reusable. Block 5 is the final iteration: titanium grid fins, retractable legs, composite-overwrapped pressure vessels rated for 10 flights without refurbishment and 100+ with inspections. As of 2025 individual boosters have flown 20+ missions.",
  cameraPosition: [40, 35, 60],
  cameraTarget: [0, 35, 0],
  background: "#0a0e14",
  parts,
  relatedSites: ["spacex-hawthorne", "cape-canaveral", "vandenberg", "starbase"],
};

export default falcon9;
