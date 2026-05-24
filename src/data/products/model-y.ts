import type { ProductSpec } from "./index";

// Units: 1 scene unit = 1m. Tesla Model Y Juniper (2025+ refresh).
// Vehicle envelope: 4.79m L x 1.92m W x 1.62m H. Wheelbase ~2.89m.
export const modelY: ProductSpec = {
  slug: "model-y",
  name: "Tesla Model Y",
  aka: "Juniper (2025+ refresh)",
  category: "vehicle",
  description:
    "Compact crossover SUV (4.79 x 1.92 x 1.62 m) built on a shared platform with Model 3. World's best-selling EV by volume and the platform for Tesla's mass-market autonomy, with 4M+ units delivered globally since 2020. The first production car with front + rear megacastings plus a 4680 structural battery pack. Juniper refresh (2025) adds a Cybertruck-inspired front fascia, full-width front + rear lightbars, an 8\" rear-passenger touchscreen, soft-close doors, and an acoustic-laminated cabin that drops interior noise ~30%.",
  cameraPosition: [4.9, 4.0, 7.1],
  cameraTarget: [0, 0.73, 0],
  cameraMinDistance: 3,
  cameraMaxDistance: 27,
  background: "#0a0a0f",
  photoCredit: {
    author: "Ethan Llamas",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tesla_Model_Y_Juniper_Performance_White_Pearl_01.jpg",
  },
  // Top-down cutaway with panoramic glass roof removed: front + rear
  // megacastings wrapping the drive units, 4680 structural pack, full-width
  // light bars at nose/tail. Front of car at left. CC0.
  cutawayImage: {
    src: "/products/photos/model-y/cutaway.svg",
    credit: {
      source: "Gigascope original SVG",
      url: "https://github.com/sincetwentytwo-sys/gigascope/blob/main/public/products/photos/model-y/cutaway.svg",
      license: "CC0",
    },
  },
  parts: [
    {
      id: "body-shell",
      name: "Body Shell (Aluminum + HSLA Steel)",
      description:
        "Mixed aluminum + boron-steel monocoque, 4.79 x 1.92 x 1.62 m. SUV proportions sit ~30mm higher than Model 3 with 167mm ground clearance. Body-in-white mass dropped ~10% vs equivalent steel SUVs thanks to giga-cast subframes. Drag coefficient ~0.23 (Juniper) — class-leading for an SUV.",
      position: [0, 0.85, 0],
      geometry: "box",
      args: [4.4, 1.0, 1.85],
      color: "#1e2228",
      metalness: 0.6,
      roughness: 0.35,
      // Center mass of the body in the Juniper 3/4 front-left photo.
      hotspot: { x: 0.50, y: 0.42 },
      // Body silhouette outline — bottom-rear panel between wheels.
      cutawayHotspot: { x: 0.65, y: 0.93 },
    },
    {
      id: "hood",
      name: "Sloped Aluminum Hood",
      description:
        "Single-piece stamped aluminum hood angled ~12 deg for pedestrian impact compliance and to feed air into the front HVAC intake. Hides the 117L frunk above the front drive unit. Active hood hinges deform on impact (Euro NCAP requirement).",
      position: [1.55, 1.15, 0],
      rotation: [0, 0, -0.08],
      geometry: "box",
      args: [1.3, 0.08, 1.7],
      color: "#22272f",
      metalness: 0.7,
      roughness: 0.3,
      // Sloped hood between the lightbar and windshield.
      hotspot: { x: 0.36, y: 0.46 },
      // Hood / frunk area at front of car on cutaway.
      cutawayHotspot: { x: 0.13, y: 0.30 },
    },
    {
      id: "glass-roof",
      name: "Continuous Laminated Glass Roof",
      description:
        "Single 2.1 m^2 panel of laminated glass with UV/IR coating spanning windshield to tailgate — no B-pillar break. Blocks ~99% UV and ~81% IR. Cabin-temperature delta vs steel roof drops ~50% under direct sun. Juniper version adds dual-pane acoustic interlayer.",
      position: [-0.2, 1.45, 0],
      geometry: "box",
      args: [2.6, 0.04, 1.5],
      color: "#0a0d12",
      metalness: 0.2,
      roughness: 0.05,
      // Glass roof visible over the cabin behind the windshield.
      hotspot: { x: 0.62, y: 0.10 },
      // Glass roof spans cabin on top-down — pick a clear cabin-glass spot.
      cutawayHotspot: { x: 0.60, y: 0.20 },
    },
    {
      id: "wheel-fl",
      name: "Front-Left Wheel (19\" Crossflow)",
      description:
        "19-inch Crossflow aero wheel with removable plastic cover (8% drag reduction vs open 19\" wheels). Michelin Primacy Tour A/S 255/45R19. Hub-centric mounting with 5x114.3 bolt pattern shared with Model 3.",
      position: [1.4, 0.4, 0.85],
      rotation: [Math.PI / 2, 0, 0],
      geometry: "cylinder",
      args: [0.37, 0.37, 0.25, 48, 1],
      color: "#16181c",
      metalness: 0.5,
      roughness: 0.7,
      // FL = lower-left wheel in driver-perspective (bottom of canvas = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.250, y: 0.944 },
      // Front-left (driver-side, LHD) wheel — the photo is shot from the
      // car's front-right corner so the driver-side face is what's toward
      // the viewer; the prominent wheel on the photo's right is FL.
      hotspot: { x: 0.73, y: 0.69 },
    },
    {
      id: "wheel-fr",
      name: "Front-Right Wheel",
      description:
        "Mirror of front-left. Each wheel carries a TPMS sensor sampled at 1 Hz; pressures appear directly on the 15\" touchscreen rather than as a warning lamp. Juniper sport variant offers 20\" Helix 2.0 wheels (range cost ~7%).",
      position: [1.4, 0.4, -0.85],
      rotation: [Math.PI / 2, 0, 0],
      geometry: "cylinder",
      args: [0.37, 0.37, 0.25, 48, 1],
      color: "#16181c",
      metalness: 0.5,
      roughness: 0.7,
      // Passenger-side wheel is occluded in this front 3/4 driver-side view —
      // cutaway only.
      // FR = upper-left wheel in driver-perspective (top of canvas = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.250, y: 0.056 },
    },
    {
      id: "wheel-rl",
      name: "Rear-Left Wheel",
      description:
        "Driven by the rear PMSM unit in RWD trims; both axles driven in AWD/Performance trims via torque-vectoring at the motor controller (no mechanical diff). Wheelbase from front axle: 2.89m.",
      position: [-1.5, 0.4, 0.85],
      rotation: [Math.PI / 2, 0, 0],
      geometry: "cylinder",
      args: [0.37, 0.37, 0.25, 48, 1],
      color: "#16181c",
      metalness: 0.5,
      roughness: 0.7,
      // RL = lower-right wheel in driver-perspective.
      cutawayHotspot: { x: 0.750, y: 0.944 },
    },
    {
      id: "wheel-rr",
      name: "Rear-Right Wheel",
      description:
        "Mirror of rear-left. Regen braking recaptures up to ~70 kW into the 4680 pack on a single-pedal lift; mechanical pads only engage below ~7 km/h or under hard stops.",
      position: [-1.5, 0.4, -0.85],
      rotation: [Math.PI / 2, 0, 0],
      geometry: "cylinder",
      args: [0.37, 0.37, 0.25, 48, 1],
      color: "#16181c",
      metalness: 0.5,
      roughness: 0.7,
      // Rear-right wheel is occluded by the FR wheel in this 3/4 front view —
      // visible on the cutaway only.
      cutawayHotspot: { x: 0.750, y: 0.056 },
    },
    {
      id: "front-lightbar",
      name: "Full-Width Front Lightbar (Juniper)",
      description:
        "Continuous LED daytime-running-light strip spanning the full vehicle width — the most visible Juniper exterior change. Adaptive matrix LEDs (region-dependent) replace the discrete headlights of the 2020-2024 Model Y. ~120 individually-addressable pixels per side enable selective high-beam masking.",
      position: [2.2, 0.95, 0],
      geometry: "box",
      args: [0.06, 0.08, 1.85],
      color: "#e8eef8",
      emissive: "#88aaff",
      metalness: 0.3,
      roughness: 0.2,
      // Center of the continuous front lightbar across the Juniper fascia.
      hotspot: { x: 0.32, y: 0.54 },
      // Blue LED bar across front fascia on cutaway.
      cutawayHotspot: { x: 0.10, y: 0.50 },
    },
    {
      id: "tail-lightbar",
      name: "Reflective Rear Lightbar",
      description:
        "Juniper rear signature: an indirect lightbar that reflects red LEDs off the inside of the tailgate cutline rather than emitting directly — gives a gapless glow when lit and stays clean visually when off. Spans 1.85m across the hatch.",
      position: [-2.2, 1.05, 0],
      geometry: "box",
      args: [0.05, 0.07, 1.85],
      color: "#3a0a0a",
      emissive: "#ff2222",
      metalness: 0.4,
      roughness: 0.3,
      // Rear tail bar isn't visible from this front 3/4 shot — cutaway only.
      cutawayHotspot: { x: 0.90, y: 0.50 },
    },
    {
      id: "front-fascia",
      name: "Front Fascia & Bumper",
      description:
        "Reshaped Juniper bumper with smoother lower diffuser; closes the upper grille entirely (cabin HVAC pulls air through the lower duct only). Honeycomb crash-can structure absorbs up to ~40 kJ in a 56 km/h frontal impact.",
      position: [2.25, 0.5, 0],
      geometry: "box",
      args: [0.18, 0.55, 1.88],
      color: "#1a1d22",
      metalness: 0.4,
      roughness: 0.55,
      // Lower bumper below the license plate.
      hotspot: { x: 0.30, y: 0.80 },
      // Front fascia just inside front bumper line on cutaway.
      cutawayHotspot: { x: 0.10, y: 0.80 },
    },
    {
      id: "rear-hatch",
      name: "Power Liftgate (Rear Hatch)",
      description:
        "Power liftgate opens to 854L (seats up) / 2,041L (seats folded) — the biggest cargo volume in the Tesla lineup. Foot-sensor kick-open is standard. Tailgate skin is a single aluminum stamping; Juniper adds soft-close electric latch.",
      position: [-2.25, 1.0, 0],
      rotation: [0, 0, 0.05],
      geometry: "box",
      args: [0.12, 0.95, 1.8],
      color: "#1e2228",
      metalness: 0.6,
      roughness: 0.35,
      // Tailgate isn't visible from this front 3/4 shot — cutaway only.
      cutawayHotspot: { x: 0.86, y: 0.80 },
    },
    {
      id: "structural-battery",
      name: "4680 Structural Battery Pack",
      description:
        "Cell-to-vehicle pack: 828 4680 cells bonded into a single load-bearing element that doubles as the cabin floor. Saves ~10% mass and eliminates ~370 components vs legacy pack-on-floor designs. Long Range AWD ships ~78.4 kWh usable. Model Y (Austin/Berlin) was the first production car to use this architecture.",
      position: [0, 0.25, 0],
      geometry: "box",
      args: [3.2, 0.13, 1.6],
      color: "#2a2f3a",
      metalness: 0.4,
      roughness: 0.6,
      // 4680 cell-grid rectangle on the cabin floor — bottom-mid clear cell.
      cutawayHotspot: { x: 0.55, y: 0.78 },
    },
    {
      id: "front-drive-unit",
      name: "Front Drive Unit (Induction)",
      description:
        "Asynchronous induction motor on the front axle (AWD trims). Drops to zero magnetic drag when not torque-commanded, letting the rear PMSM handle cruise alone for efficiency — combined system delivers ~378 kW (507 hp) in Long Range, 0-100 km/h in ~4.8s.",
      position: [1.55, 0.3, 0],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.18, 0.18, 0.6, 24, 1],
      color: "#6a7280",
      metalness: 0.85,
      roughness: 0.3,
      // Mid-gray motor box inside front megacast.
      cutawayHotspot: { x: 0.234, y: 0.50 },
    },
    {
      id: "rear-drive-unit",
      name: "Rear Drive Unit (PMSM)",
      description:
        "Permanent-magnet synchronous reluctance motor — the primary drive in every Model Y trim. Carbon-sleeved rotor handles ~18,000 rpm. Single-speed reduction gear (~9:1). Continuous power ~220 kW, peak ~250 kW; uses ~500g of rare-earth magnets per unit.",
      position: [-1.5, 0.3, 0],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.22, 0.22, 0.65, 24, 1],
      color: "#8a939e",
      metalness: 0.9,
      roughness: 0.25,
      // Lighter motor box inside rear megacast.
      cutawayHotspot: { x: 0.771, y: 0.50 },
    },
    {
      id: "megacast-front",
      name: "Front Megacasting",
      description:
        "Single aluminum giga-press casting (~6,100-ton clamping force at Giga Texas) that replaces ~70 stamped + welded parts with one piece. Cuts ~30% body mass at the front structure and eliminates ~1,600 robot welds. Recyclable Al-Si alloy designed by Tesla in-house.",
      position: [1.6, 0.55, 0],
      geometry: "box",
      args: [0.55, 0.35, 1.6],
      color: "#9aa2ad",
      metalness: 0.8,
      roughness: 0.45,
      // Light-gray rectangle wrapping front motor/subframe — upper edge.
      cutawayHotspot: { x: 0.27, y: 0.20 },
    },
    {
      id: "megacast-rear",
      name: "Rear Megacasting",
      description:
        "Single-piece rear underbody casting replacing 171 stamped components with 2 then 1 piece across iterations. Combined with the front cast, the body factory floor footprint drops ~30%. The casting integrates rear shock towers and bumper-beam mounts.",
      position: [-1.55, 0.55, 0],
      geometry: "box",
      args: [0.6, 0.35, 1.6],
      color: "#9aa2ad",
      metalness: 0.8,
      roughness: 0.45,
      // Light-gray rectangle wrapping rear motor/subframe — upper edge.
      cutawayHotspot: { x: 0.74, y: 0.20 },
    },
    {
      id: "bpillar-cam-l",
      name: "B-Pillar Camera (Left)",
      description:
        "1.2 MP HW4 side camera (one of 8) monitoring blind spot, lane-change traffic, and Autopark. ~120 deg horizontal FOV. Heated lens; auto-clean wiper jet behind the trim panel.",
      position: [0.2, 1.2, 0.93],
      geometry: "sphere",
      args: [0.04, 16, 16],
      color: "#0a0a0c",
      metalness: 0.2,
      roughness: 0.3,
      // Driver-side (LEFT) B-pillar is the one facing the viewer in this
      // front 3/4 shot — pillar is at the back edge of the visible door.
      hotspot: { x: 0.83, y: 0.28 },
      // L = lower edge of cabin in driver-perspective (bottom = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.475, y: 0.88 },
    },
    {
      id: "bpillar-cam-r",
      name: "B-Pillar Camera (Right)",
      description:
        "Mirror of left B-pillar camera. HW4 doubled the resolution of HW3's cameras and added a front bumper camera (5MP at center). Cameras run at 36 fps into a ~50 TOPS inference accelerator on the FSD computer.",
      position: [0.2, 1.2, -0.93],
      geometry: "sphere",
      args: [0.04, 16, 16],
      color: "#0a0a0c",
      metalness: 0.2,
      roughness: 0.3,
      // Passenger-side B-pillar is on the far side of the car, not visible
      // in this driver-side 3/4 shot — cutaway only.
      // R = upper edge of cabin in driver-perspective (top = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.475, y: 0.118 },
    },
    {
      id: "front-cam-main",
      name: "Front Main Camera (HW4)",
      description:
        "5 MP forward camera behind the windshield — center of the trifocal. Sees ~150m for traffic-light/sign reading. Fed into Tesla's FSD computer at ~36 fps alongside narrow + wide front cameras.",
      position: [0.6, 1.42, 0],
      geometry: "sphere",
      args: [0.045, 16, 16],
      color: "#0a0a0c",
      metalness: 0.2,
      roughness: 0.3,
      // Trifocal cluster behind the upper windshield, just below the glass-roof line.
      hotspot: { x: 0.50, y: 0.27 },
      // Trifocal cluster behind windshield — three dots stacked at A-pillar.
      cutawayHotspot: { x: 0.36, y: 0.40 },
    },
    {
      id: "front-cam-narrow",
      name: "Front Narrow Camera",
      description:
        "Telephoto camera (~35 deg FOV) for ~250m highway detection of stopped vehicles and lane markings. Part of the HW4 trifocal stack — Tesla removed the radar and ultrasonics, leaving cameras as the sole exteroceptive sensor.",
      position: [0.6, 1.42, 0.05],
      geometry: "sphere",
      args: [0.04, 16, 16],
      color: "#0a0a0c",
      metalness: 0.2,
      roughness: 0.3,
      cutawayHotspot: { x: 0.36, y: 0.50 },
    },
    {
      id: "front-cam-wide",
      name: "Front Wide Camera (Fisheye)",
      description:
        "~150 deg fisheye for intersections, cross-traffic, and close-in obstacles. Tesla Vision uses the wide camera as the primary input for occupancy-network reconstruction at urban speeds.",
      position: [0.6, 1.42, -0.05],
      geometry: "sphere",
      args: [0.04, 16, 16],
      color: "#0a0a0c",
      metalness: 0.2,
      roughness: 0.3,
      cutawayHotspot: { x: 0.36, y: 0.60 },
    },
    {
      id: "main-touchscreen",
      name: "15.4\" Center Touchscreen",
      description:
        "15.4-inch 2200x1300 IPS touchscreen running Tesla's QNX-derived UI on an AMD Ryzen embedded APU (~10 TFLOPS GPU). Sole control surface for HVAC, drive mode, media, and FSD configuration. Juniper bumps screen brightness ~40% and adds an ambient-light sensor behind the bezel.",
      position: [0.45, 1.0, 0],
      geometry: "box",
      args: [0.02, 0.22, 0.38],
      color: "#0a0a0e",
      emissive: "#1a1f2e",
      metalness: 0.3,
      roughness: 0.2,
      // 15" landscape screen between front seats on cutaway.
      cutawayHotspot: { x: 0.46, y: 0.50 },
    },
    {
      id: "rear-screen",
      name: "8\" Rear Passenger Screen (Juniper-only)",
      description:
        "New for Juniper: 8-inch 1280x720 touchscreen mounted on the rear of the center console. Lets rear passengers control HVAC zone, seat heaters, and stream video (Bluetooth headphones required). Reduces driver-distraction taps for kids' comfort adjustments — a long-requested feature.",
      position: [-0.5, 1.0, 0],
      rotation: [0, Math.PI, 0],
      geometry: "box",
      args: [0.02, 0.14, 0.22],
      color: "#0a0a0e",
      emissive: "#1a1f2e",
      metalness: 0.3,
      roughness: 0.2,
      // 8" rear-facing screen behind center console — between rear bench rows.
      cutawayHotspot: { x: 0.59, y: 0.50 },
    },
  ],
  relatedSites: ["giga-texas", "giga-shanghai", "giga-berlin", "fremont"],
  galleryPhotos: [
    {
      src: "/products/photos/model-y/1.jpg",
      label: "Side",
      credit: {
        author: "Daniel.Cardenas",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATesla_Model_Y_passenger_side_view.jpg",
      },
    },
    {
      src: "/products/photos/model-y/2.jpg",
      label: "Rear",
      credit: {
        author: "Alexander Migl",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATesla_Model_Y_%282025%29_MYLE_Festival_2025_DSC_9570.jpg",
      },
    },
    {
      src: "/products/photos/model-y/3.jpg",
      label: "Interior",
      credit: {
        author: "Ethan Llamas",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATesla_Model_Y_2025_interior.jpg",
      },
    },
  ],
};

export default modelY;
