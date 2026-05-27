import type { ProductSpec, PartSpec } from "./index";

// Starship + Super Heavy full stack. ~121m tall, 9m diameter. 1 unit = 1m.
// Booster base at y=0. Ship stacks on top of hot-stage ring.

const STEEL = "#c5c9cf";
const STEEL_DARK = "#8a8f95";
const SOOT = "#1a1a1a";
const TILE = "#2c2c2c";
const COPPER = "#b87333";

const BOOSTER_R = 4.5; // 9m / 2
const BOOSTER_H = 71;
const SHIP_H = 50;
const HOT_STAGE_H = 1.8;

// 33 Raptors: 3 center, 10 inner ring, 20 outer ring
const raptor33 = (): PartSpec[] => {
  const parts: PartSpec[] = [];
  const place = (
    n: number,
    radius: number,
    group: string,
    label: string,
    desc: string,
    /** Optional cutaway hotspot — only the very first engine in the
     *  first group gets one, so we don't render 33 overlapping dots
     *  on a single cluster cross-section. */
    cutawayHotspot?: { x: number; y: number },
  ) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = radius === 0 ? (i - 1) * 0.9 : Math.cos(a) * radius;
      const z = radius === 0 ? 0 : Math.sin(a) * radius;
      parts.push({
        id: `${group}-${i + 1}`,
        name: `${label} #${i + 1}`,
        description: desc,
        position: [x, 1.0, z],
        geometry: "cone",
        args: [0.65, 1.8, 20],
        color: SOOT,
        metalness: 0.6,
        roughness: 0.45,
        ...(i === 0 && cutawayHotspot ? { cutawayHotspot } : {}),
      });
    }
  };
  // Only one hotspot for the whole 33-engine cluster — points to the
  // row of small bell cross-sections at the bottom of the cutaway.
  place(
    3,
    0,
    "raptor-center",
    "Raptor 2 (center, gimbaled)",
    "Raptor 2: full-flow staged-combustion methalox engine, ~230 tf sea-level thrust at ~300 bar chamber pressure, Isp ~327s. Center 3 (with 10 inner) gimbal for thrust vector control. Reusable, deep-throttle to 40%.",
    { x: 0.50, y: 0.94 },
  );
  place(
    10,
    1.7,
    "raptor-inner",
    "Raptor 2 (inner ring, gimbaled)",
    "Inner-ring Raptor 2, gimbaled ±15° via electric TVC actuators (replaced hydraulics for mass and reliability). Full-flow staged combustion eliminates turbine soot, enabling rapid reuse.",
  );
  place(
    20,
    3.5,
    "raptor-outer",
    "Raptor 2 (outer ring, fixed)",
    "Outer-ring Raptor, fixed-mount (no gimbal). 20 of these provide the bulk of liftoff thrust (~7,590 tf total stack), giving Super Heavy ~1.5 T/W ratio at liftoff with a fully fueled ship.",
  );
  return parts;
};

const parts: PartSpec[] = [
  ...raptor33(),
  {
    id: "booster-body",
    name: "Super Heavy Body (304L stainless)",
    description:
      "Booster tank section, 304L stainless steel skin ~4mm thick. Stainless chosen over Al-Li for cryogenic strength, hot-side reentry tolerance (~870°C), and orders-of-magnitude lower per-kg cost. Holds ~3,400t methalox.",
    position: [0, BOOSTER_H / 2 + 2, 0],
    geometry: "cylinder",
    args: [BOOSTER_R, BOOSTER_R, BOOSTER_H - 4, 48],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.25,
    hotspot: { x: 0.6000, y: 0.6500 },
    cutawayHotspot: { x: 0.50, y: 0.50 },
  },
  {
    id: "booster-chines",
    name: "Catch Pins (chopstick lift points)",
    description:
      "Forged steel pins near the booster forward dome that the Mechazilla 'chopstick' arms slot under for the tower catch. Removes need for landing legs — booster mass savings ~20t, enabling more payload margin.",
    position: [BOOSTER_R + 0.2, BOOSTER_H - 5, 0],
    geometry: "box",
    args: [0.6, 0.8, 0.6],
    color: STEEL_DARK,
    metalness: 0.9,
    roughness: 0.3,
    // Catch pins are small forged pins — invisible at this photo's
    // scale and too tight on the cutaway to give a separate dot
    // without overlapping the grid-fin / hot-stage cluster.
  },
  {
    id: "grid-fin-b1",
    name: "Booster Grid Fin (+X)",
    description:
      "Stainless steel grid fin, fixed (not retractable, unlike F9). 4 fins arranged 90° apart in upper-half clocking. Used only for entry attitude control; tower catch handles terminal phase.",
    position: [BOOSTER_R + 0.3, BOOSTER_H - 8, 0],
    geometry: "box",
    args: [0.2, 2.0, 1.8],
    color: STEEL_DARK,
    metalness: 0.85,
    roughness: 0.3,
    // Visible on the cutaway exterior side as the small lattice
    // sticking out from the booster. Other 3 fins are hidden behind
    // the booster body from this viewpoint.
    cutawayHotspot: { x: 0.24, y: 0.37 },
  },
  {
    id: "grid-fin-b2",
    name: "Booster Grid Fin (-X)",
    description:
      "Second of 4 booster grid fins. Replaced legacy retractable design after Booster 7 — fixed fins are simpler, lighter (~3t each), and avoid the hydraulic actuator failure mode.",
    position: [-(BOOSTER_R + 0.3), BOOSTER_H - 8, 0],
    geometry: "box",
    args: [0.2, 2.0, 1.8],
    color: STEEL_DARK,
    metalness: 0.85,
    roughness: 0.3,
  },
  {
    id: "grid-fin-b3",
    name: "Booster Grid Fin (+Z)",
    description:
      "Third grid fin. Hypersonic-rated stainless, no thermal coating required thanks to material choice. Asymmetric clocking (~50°/130°) optimizes for entry lift vector during boostback.",
    position: [0, BOOSTER_H - 8, BOOSTER_R + 0.3],
    geometry: "box",
    args: [1.8, 2.0, 0.2],
    color: STEEL_DARK,
    metalness: 0.85,
    roughness: 0.3,
  },
  {
    id: "grid-fin-b4",
    name: "Booster Grid Fin (-Z)",
    description:
      "Fourth grid fin. Combined fin authority guides the booster back to the launch tower with sub-meter terminal accuracy required for chopstick catch.",
    position: [0, BOOSTER_H - 8, -(BOOSTER_R + 0.3)],
    geometry: "box",
    args: [1.8, 2.0, 0.2],
    color: STEEL_DARK,
    metalness: 0.85,
    roughness: 0.3,
  },
  {
    id: "hot-stage-ring",
    name: "Hot Staging Ring",
    description:
      "Vented stainless ring atop the booster (~9t). Allows ship's 3 vacuum Raptors to ignite while still attached, blowing exhaust through ring vents — eliminates ullage burn mass penalty. Added after IFT-1; jettisoned post-sep on later flights to save reentry mass.",
    position: [0, BOOSTER_H + HOT_STAGE_H / 2, 0],
    geometry: "cylinder",
    args: [BOOSTER_R, BOOSTER_R, HOT_STAGE_H, 48],
    color: SOOT,
    metalness: 0.5,
    roughness: 0.5,
    hotspot: { x: 0.6000, y: 0.4800 },
    cutawayHotspot: { x: 0.55, y: 0.32 },
  },
  // ===== Starship (ship) =====
  {
    id: "ship-rvac-1",
    name: "Raptor Vacuum #1",
    description:
      "Raptor Vacuum (RVac): elongated regeneratively-cooled nozzle, expansion ratio ~80, Isp ~380s. 3 RVacs do not gimbal; vehicle steering in vacuum handled by the 3 sea-level Raptors at center.",
    position: [2.1, BOOSTER_H + HOT_STAGE_H + 2.0, 0],
    geometry: "cone",
    args: [1.1, 4.0, 28],
    color: COPPER,
    metalness: 0.75,
    roughness: 0.35,
    // One hotspot represents the 3-RVac cluster on the cutaway.
    // RVac #2 and #3 stay list-only to avoid stacking dots.
    cutawayHotspot: { x: 0.42, y: 0.30 },
  },
  {
    id: "ship-rvac-2",
    name: "Raptor Vacuum #2",
    description:
      "Second of 3 RVacs. Together with the sea-level trio they give Starship ~1,500 tf thrust in vacuum, sufficient for orbital insertion plus payload-to-LEO of 100-150t reusable.",
    position: [-1.05, BOOSTER_H + HOT_STAGE_H + 2.0, 1.82],
    geometry: "cone",
    args: [1.1, 4.0, 28],
    color: COPPER,
    metalness: 0.75,
    roughness: 0.35,
  },
  {
    id: "ship-rvac-3",
    name: "Raptor Vacuum #3",
    description:
      "Third RVac. Regen-cooled extended nozzle uses methane in the cooling channels, avoiding the niobium-coke buildup of MVac's RP-1 design and enabling cleaner reuse cycles.",
    position: [-1.05, BOOSTER_H + HOT_STAGE_H + 2.0, -1.82],
    geometry: "cone",
    args: [1.1, 4.0, 28],
    color: COPPER,
    metalness: 0.75,
    roughness: 0.35,
  },
  {
    id: "ship-rsl-1",
    name: "Raptor Sea-Level #1 (gimbaled)",
    description:
      "Center-cluster sea-level Raptor on the ship. These 3 gimbal for landing-flip control and provide the redundant landing burn (only 2 needed). Header-tank fed for stable cryo supply during bellyflop.",
    position: [0.8, BOOSTER_H + HOT_STAGE_H + 1.5, 0],
    geometry: "cone",
    args: [0.65, 2.0, 20],
    color: SOOT,
    metalness: 0.6,
    roughness: 0.45,
    // No cutawayHotspot: the SL engines sit right next to the RVacs
    // and the hot-stage ring on the cutaway — a third dot in that
    // band would crowd the hit-area. RSL stays list-only there.
  },
  {
    id: "ship-rsl-2",
    name: "Raptor Sea-Level #2 (gimbaled)",
    description:
      "Second SL Raptor. The three SL engines also handle the suicide-burn flip from horizontal bellyflop to vertical ~500m AGL, the same maneuver demonstrated by SN15.",
    position: [-0.4, BOOSTER_H + HOT_STAGE_H + 1.5, 0.7],
    geometry: "cone",
    args: [0.65, 2.0, 20],
    color: SOOT,
    metalness: 0.6,
    roughness: 0.45,
  },
  {
    id: "ship-rsl-3",
    name: "Raptor Sea-Level #3 (gimbaled)",
    description:
      "Third SL Raptor. Engine-out tolerance: ship can land on 2 of 3 SLs after one failure. SLs use shorter bell (expansion ratio ~34) optimized for atmospheric backpressure during landing.",
    position: [-0.4, BOOSTER_H + HOT_STAGE_H + 1.5, -0.7],
    geometry: "cone",
    args: [0.65, 2.0, 20],
    color: SOOT,
    metalness: 0.6,
    roughness: 0.45,
  },
  {
    id: "ship-body",
    name: "Starship Body (304L stainless)",
    description:
      "Upper-stage tank section, 304L stainless ~3-4mm. Hosts the 1,200t methalox main propellant plus the smaller header tanks (CH4 in nose, LOX inside main LOX dome) that feed the landing burn.",
    position: [0, BOOSTER_H + HOT_STAGE_H + 5 + (SHIP_H - 15) / 2, 0],
    geometry: "cylinder",
    args: [BOOSTER_R, BOOSTER_R, SHIP_H - 15, 48],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.25,
    hotspot: { x: 0.6200, y: 0.3200 },
    cutawayHotspot: { x: 0.50, y: 0.18 },
  },
  {
    id: "ship-tiles",
    name: "Heat Shield (windward hex tiles)",
    description:
      "~18,000 mechanically-pinned hexagonal ceramic tiles on the windward side, TUFROC-class material rated for ~1,400°C reentry heating. Hex pattern allows individual tile replacement; gaps backed by ablative felt.",
    position: [0, BOOSTER_H + HOT_STAGE_H + 5 + (SHIP_H - 15) / 2, BOOSTER_R - 0.05],
    rotation: [0, 0, 0],
    geometry: "cylinder",
    args: [BOOSTER_R + 0.06, BOOSTER_R + 0.06, SHIP_H - 18, 48],
    color: TILE,
    metalness: 0.2,
    roughness: 0.85,
    // Tiles are a windward-side strip on the exterior — drawn on the
    // cutaway as a dark hex band along the left ship body, but kept
    // list-only here to avoid overlapping the body / flap hotspots.
  },
  {
    id: "ship-fwd-flap-1",
    name: "Forward Flap (+Z)",
    description:
      "Hinged forward flap, repositioned leeward in V2 to reduce reentry plasma damage. Acts as a control surface during the bellyflop, modulating drag asymmetry to steer the vehicle to the catch tower.",
    position: [0, BOOSTER_H + HOT_STAGE_H + SHIP_H - 12, BOOSTER_R + 0.3],
    rotation: [0.3, 0, 0],
    geometry: "box",
    args: [3.5, 3.5, 0.3],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.3,
    hotspot: { x: 0.6600, y: 0.2100 },
    cutawayHotspot: { x: 0.25, y: 0.11 },
  },
  {
    id: "ship-fwd-flap-2",
    name: "Forward Flap (-Z)",
    description:
      "Mirror forward flap. The flap quartet (2 fwd + 2 aft) is the only aero-control during the ~70s bellyflop descent — no parachutes, no wings, just drag-vectoring with stainless flaps.",
    position: [0, BOOSTER_H + HOT_STAGE_H + SHIP_H - 12, -(BOOSTER_R + 0.3)],
    rotation: [-0.3, 0, 0],
    geometry: "box",
    args: [3.5, 3.5, 0.3],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.3,
  },
  {
    id: "ship-aft-flap-1",
    name: "Aft Flap (+Z)",
    description:
      "Larger aft flap providing the dominant pitch authority during bellyflop. Hinge mechanism uses stainless bearings inside a sealed compartment shielded from reentry plasma.",
    position: [0, BOOSTER_H + HOT_STAGE_H + 6, BOOSTER_R + 0.4],
    rotation: [-0.3, 0, 0],
    geometry: "box",
    args: [4.5, 4.5, 0.3],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.3,
    cutawayHotspot: { x: 0.24, y: 0.26 },
  },
  {
    id: "ship-aft-flap-2",
    name: "Aft Flap (-Z)",
    description:
      "Mirror aft flap. Together with the forward pair, generates the lift-to-drag ratio (~0.5) sufficient to control crossrange during reentry without thermal protection on the leeward stainless skin.",
    position: [0, BOOSTER_H + HOT_STAGE_H + 6, -(BOOSTER_R + 0.4)],
    rotation: [0.3, 0, 0],
    geometry: "box",
    args: [4.5, 4.5, 0.3],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.3,
  },
  {
    id: "ship-header-tank",
    name: "Methane Header Tank (nose)",
    description:
      "Small CH4 header tank in the nose, ~10t capacity. Separated from main tanks to guarantee bubble-free propellant delivery to the landing engines during the bellyflop's near-zero-g phase.",
    position: [0, BOOSTER_H + HOT_STAGE_H + SHIP_H - 6, 0],
    geometry: "sphere",
    args: [1.4, 24, 16],
    color: STEEL_DARK,
    metalness: 0.8,
    roughness: 0.35,
    // Internal tank in the nose — not visible on the exterior photo,
    // but exposed as the small amber sphere inside the cutaway nose
    // cone.
    cutawayHotspot: { x: 0.50, y: 0.06 },
  },
  {
    id: "ship-nosecone",
    name: "Nose Cone",
    description:
      "Stainless nose cone enclosing payload bay (Pez-dispenser door for Starlink V3 deployment) and the header tank. Cargo variants integrate a clamshell door; crew variants planned with dorsal docking port.",
    position: [0, BOOSTER_H + HOT_STAGE_H + SHIP_H - 1, 0],
    geometry: "cone",
    args: [BOOSTER_R, 9, 32],
    color: STEEL,
    metalness: 0.85,
    roughness: 0.25,
    hotspot: { x: 0.6200, y: 0.1600 },
    // No cutawayHotspot: the nose-cone outer shape is conceptually
    // the same view as the exterior photo and the header-tank dot
    // sits right under it — adding a second dot in the same nose
    // region would crowd the hit area.
  },
];

export const starship: ProductSpec = {
  slug: "starship",
  name: "Starship + Super Heavy",
  aka: "SH/SS",
  category: "rocket",
  description:
    "Fully reusable two-stage methalox super-heavy launch vehicle. Full stack ~121m tall, 9m diameter, ~5,000t wet mass. Targets 100-150t to LEO reusable, 200t+ expendable. Booster catches at tower via chopstick arms; ship reenters bellyflop-style and (eventually) catches at orbital launch site. Stainless 304L primary structure, 33+6 Raptor 2 full-flow staged-combustion engines, hot-staging ring between stages.",
  cameraPosition: [100, 60, 220],
  cameraMinDistance: 30,
  cameraMaxDistance: 800,
  cameraTarget: [0, 50, 0],
  background: "#08090d",
  parts,
  // Full-stack cutaway drawn in-house — left half intact stainless
  // silhouette (Super Heavy below, hot-stage ring, ship with flaps
  // and nose), right half sliced open to expose payload bay, CH4 +
  // LOX header tanks in the nose, ship LOX + CH4 (with common dome),
  // 3 RVac + 3 SL Raptor cluster, vented hot-stage ring, then the
  // much larger Super Heavy LOX + CH4 tanks with their common
  // bulkhead, and a slice of the 33-Raptor cluster at the base. CC0.
  cutawayImage: {
    src: "/products/photos/starship/cutaway.svg",
    credit: {
      source: "Gigascope original SVG",
      url: "https://github.com/sincetwentytwo-sys/gigascope/blob/main/public/products/photos/starship/cutaway.svg",
      license: "CC0",
    },
  },
  relatedSites: ["starbase-launch", "starbase-build", "cape-canaveral"],
  photoCredit: {
    author: "Steve Jurvetson",
    license: "CC BY 2.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:SpaceX_Starship_ignition_during_IFT-5.jpg",
  },
  galleryPhotos: [
    {
      src: "/products/photos/starship/1.jpg",
      label: "Ship",
      credit: {
        author: "National Weather Service in Puerto Rico",
        license: "Public domain",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ASpaceX_Starship_Ship_25_debris_re-entering_the_atmosphere.png",
      },
    },
    {
      src: "/products/photos/starship/2.jpg",
      label: "Booster",
      credit: {
        author: "NASA",
        license: "Public domain",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ASpaceX_workers_looking_at_Super_Heavy_booster.jpg",
      },
    },
    {
      src: "/products/photos/starship/3.jpg",
      label: "Launch",
      credit: {
        author: "Hotel Pika",
        license: "CC BY-SA 2.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AStarship_full_stack.jpg",
      },
    },
  ],
};

export default starship;
