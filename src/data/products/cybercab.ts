import type { ProductSpec } from "./index";

// Units: 1 scene unit ~ 1 meter. Cybercab ~3.9m long, ~1.95m wide, ~1.4m tall.
// 2-seater, no steering wheel, no pedals, butterfly doors, inductive charging only.
export const cybercab: ProductSpec = {
  slug: "cybercab",
  name: "Tesla Cybercab",
  aka: "Robotaxi",
  category: "vehicle",
  description:
    "~3.9m, two-seat purpose-built autonomous robotaxi. No steering wheel, no pedals, no charge port — the cabin is pure occupant space and charging happens inductively from a floor pad. Built on a simplified unboxed-process chassis at Giga Texas with a single rear drive unit and the next-gen FSD compute stack. Mission: $0.30/mile fleet economics by deleting everything a human driver needs.",
  cameraPosition: [4.5, 3.7, 6.6],
  cameraTarget: [0, 0.6, 0],
  cameraMinDistance: 2.5,
  cameraMaxDistance: 25,
  // Cybercab is the one product where the long axis runs along Z (length 3.84m
  // vs width 2.40m). Cut on X so the slice runs along the length (left/right
  // halves) instead of chopping the car in half across its width.
  cutawayAxis: "x",
  background: "#15171c",
  photoCredit: {
    author: "Dllu (Wikimedia Commons)",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tesla_Cybercab_at_Santana_Row_oblique_view_dllu.jpg",
  },
  // Top-down cutaway with roof removed: 2-up bench seats (no driver seat),
  // single rear drive unit, structural 4680 pack, central inductive
  // charging coil, butterfly door L drawn open. Note "no wheel / no
  // pedals" mark replaces where the steering column would be. Public
  // dimensions are estimated. Front of car at left. CC0.
  cutawayImage: {
    src: "/products/photos/cybercab/cutaway.svg",
    credit: {
      source: "Gigascope original SVG",
      url: "https://github.com/sincetwentytwo-sys/gigascope/blob/main/public/products/photos/cybercab/cutaway.svg",
      license: "CC0",
    },
  },
  parts: [
    {
      id: "body-shell",
      name: "Body Shell",
      description:
        "Low-slung 2-box silhouette — no engine compartment up front, so the hood is short and the cabin pushed forward. Painted gold-silver in reveal builds; production color will likely be a stamped-aluminum/composite mix to keep paint optional for fleet operators.",
      position: [0, 0.75, 0],
      geometry: "box",
      args: [1.9, 0.9, 3.8],
      color: "#c9b27a",
      metalness: 0.85,
      roughness: 0.25,
      hotspot: { x: 0.42, y: 0.44 },
      // Body silhouette outline on cutaway — sit dot on lower-edge clear zone.
      cutawayHotspot: { x: 0.50, y: 0.93 },
    },
    {
      id: "hood",
      name: "Sloped Hood Wedge",
      description:
        "Short sloping hood — no engine, just a shallow frunk and the front HW5 sensor cradle. The slope is set by pedestrian-impact head-form geometry, not aero, since the cab spends most of its life at urban speeds.",
      position: [0, 1.05, 1.35],
      rotation: [-0.25, 0, 0],
      geometry: "box",
      args: [1.85, 0.08, 1.1],
      color: "#c9b27a",
      metalness: 0.85,
      roughness: 0.25,
      hotspot: { x: 0.22, y: 0.41 },
      // Hood at front of car on cutaway.
      cutawayHotspot: { x: 0.16, y: 0.65 },
    },
    {
      id: "trunk",
      name: "Rear Trunk",
      description:
        "Small rear trunk over the drive unit — sized for a folded stroller or two carry-on bags. Fleet operators get a separate undertray cargo compartment accessible from a service door for cleaning and battery swap.",
      position: [0, 1.05, -1.45],
      rotation: [0.20, 0, 0],
      geometry: "box",
      args: [1.85, 0.08, 0.9],
      color: "#c9b27a",
      metalness: 0.85,
      roughness: 0.25,
      // Rear-trunk area at right of canvas.
      cutawayHotspot: { x: 0.84, y: 0.50 },
    },
    {
      id: "door-l",
      name: "Left Butterfly Door",
      description:
        "Upward-swinging butterfly door — opens ~80° on a single forward hinge. Eliminates the side-step a regular door forces during boarding, which matters in dense urban pickups where the cab is parked tight to the curb.",
      position: [0.97, 0.75, 0],
      rotation: [0, 0, 0.45],
      geometry: "box",
      args: [0.04, 0.85, 1.6],
      color: "#b8a26d",
      metalness: 0.85,
      roughness: 0.25,
      hotspot: { x: 0.62, y: 0.30 },
      // Door-L (driver-LEFT in LHD) = bottom of canvas — labeled "door L (closed)" in SVG.
      cutawayHotspot: { x: 0.50, y: 0.83 },
    },
    {
      id: "door-r",
      name: "Right Butterfly Door",
      description:
        "Mirror of left. Door open/close is fully automated — passengers never touch a handle. Anti-pinch is camera-vision based (same network as FSD's open-door detector) rather than IR sensors.",
      position: [-0.97, 0.75, 0],
      rotation: [0, 0, -0.45],
      geometry: "box",
      args: [0.04, 0.85, 1.6],
      color: "#b8a26d",
      metalness: 0.85,
      roughness: 0.25,
      // Door-R (driver-RIGHT in LHD) = top of canvas — labeled "door R (open ~80°)" in SVG.
      cutawayHotspot: { x: 0.50, y: 0.18 },
    },
    // Wheels (4)
    {
      id: "wheel-fl",
      name: "Front-Left Wheel (aero cover)",
      description:
        "Aero-optimized wheel cover — flush face cuts drag ~5% vs an open spoke. Cybercab targets a sub-0.20 Cd for fleet range. Tire is a low-rolling-resistance compound spec'd for >120k km between changes at fleet duty cycle.",
      position: [0.85, 0.35, 1.25],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.35, 0.35, 0.22, 32],
      color: "#1a1a1f",
      metalness: 0.5,
      roughness: 0.6,
      hotspot: { x: 0.27, y: 0.66 },
      // FL = lower-left wheel in driver-perspective (bottom = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.279, y: 0.775 },
    },
    {
      id: "wheel-fr",
      name: "Front-Right Wheel (aero cover)",
      description:
        "Mirror of FL. Steer-by-wire — there's no mechanical column. Each front wheel has an independent steer actuator allowing curb-side parallel-park geometry impossible with a tie-rod.",
      position: [-0.85, 0.35, 1.25],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.35, 0.35, 0.22, 32],
      color: "#1a1a1f",
      metalness: 0.5,
      roughness: 0.6,
      // FR = upper-left wheel in driver-perspective (top = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.279, y: 0.225 },
    },
    {
      id: "wheel-rl",
      name: "Rear-Left Wheel (aero cover)",
      description:
        "Driven via the single rear drive unit through a conventional half-shaft. Regen tuned soft — robotaxi passengers don't get a pedal to anticipate decel, so jerk has to stay below ~0.5 m/s³ to avoid motion sickness.",
      position: [0.85, 0.35, -1.25],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.35, 0.35, 0.22, 32],
      color: "#1a1a1f",
      metalness: 0.5,
      roughness: 0.6,
      hotspot: { x: 0.73, y: 0.60 },
      // RL = lower-right wheel in driver-perspective.
      cutawayHotspot: { x: 0.743, y: 0.775 },
    },
    {
      id: "wheel-rr",
      name: "Rear-Right Wheel (aero cover)",
      description:
        "Mirror of RL. Brake-by-wire blends with regen for service braking; mechanical friction brakes are sized only for the emergency-stop case, saving ~15kg vs a conventional caliper system.",
      position: [-0.85, 0.35, -1.25],
      rotation: [0, 0, Math.PI / 2],
      geometry: "cylinder",
      args: [0.35, 0.35, 0.22, 32],
      color: "#1a1a1f",
      metalness: 0.5,
      roughness: 0.6,
      // RR = upper-right wheel in driver-perspective.
      cutawayHotspot: { x: 0.743, y: 0.225 },
    },
    {
      id: "headlight-bar",
      name: "Front Lightbar",
      description:
        "Thin LED matrix bar across the full front fascia. Doubles as an external HMI — patterns indicate 'waiting for you', 'about to pull away', 'yielding to pedestrian'. NHTSA-pending standard for autonomous external signaling.",
      position: [0, 0.85, 1.92],
      geometry: "box",
      args: [1.6, 0.05, 0.04],
      color: "#f4f4f8",
      emissive: "#a0c8ff",
      metalness: 0.4,
      roughness: 0.2,
      hotspot: { x: 0.17, y: 0.50 },
      // Front lightbar at nose tip on cutaway.
      cutawayHotspot: { x: 0.08, y: 0.50 },
    },
    // HW5 cameras (front cluster x3)
    {
      id: "hw5-cam-c",
      name: "HW5 Front Camera (center)",
      description:
        "Center forward HW5 camera — higher dynamic range and ~4x the resolution of HW4. Cybercab carries the first HW5 deployment; the policy is the same FSD net retrained at the higher resolution.",
      position: [0, 1.15, 1.85],
      geometry: "sphere",
      args: [0.025, 16, 16],
      color: "#0a0a10",
      metalness: 0.3,
      roughness: 0.25,
      // Front stereo trio - center.
      cutawayHotspot: { x: 0.30, y: 0.07 },
    },
    {
      id: "hw5-cam-l",
      name: "HW5 Front Camera (left)",
      description:
        "Wide stereo pair with the right unit. Gives Cybercab metric depth without Lidar — Tesla's vision-only argument leans on this baseline being wide enough (~1.6m) for accurate range out to 200m.",
      position: [0.80, 1.15, 1.84],
      geometry: "sphere",
      args: [0.025, 16, 16],
      color: "#0a0a10",
      metalness: 0.3,
      roughness: 0.25,
      // HW5 Left in driver-perspective = lower-left front (bottom = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.42, y: 0.93 },
    },
    {
      id: "hw5-cam-r",
      name: "HW5 Front Camera (right)",
      description:
        "Stereo partner to the left camera. Mounted behind a heated glass aperture for ice/rain clearing — first Tesla vehicle to bake camera de-icing into the surround sensor suite by default.",
      position: [-0.80, 1.15, 1.84],
      geometry: "sphere",
      args: [0.025, 16, 16],
      color: "#0a0a10",
      metalness: 0.3,
      roughness: 0.25,
      // HW5 Right in driver-perspective = upper-left front (top = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.30, y: 0.07 },
    },
    {
      id: "side-cam-l",
      name: "Left Side Camera",
      description:
        "B-pillar rearward camera covering the left blind zone and curb. Replaces the mirror (no mirrors on Cybercab — saves drag and weight, and there's no driver to look at one anyway).",
      position: [0.99, 1.15, 0.4],
      geometry: "sphere",
      args: [0.025, 16, 16],
      color: "#0a0a10",
      metalness: 0.3,
      roughness: 0.25,
      // L side camera = lower edge of cabin in driver-perspective (bottom = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.53, y: 0.72 },
    },
    {
      id: "side-cam-r",
      name: "Right Side Camera",
      description:
        "Mirror of left. Critical for the curb-side pickup flow — the policy uses this view to align the door-open arc with the actual sidewalk geometry rather than the lane center.",
      position: [-0.99, 1.15, 0.4],
      geometry: "sphere",
      args: [0.025, 16, 16],
      color: "#0a0a10",
      metalness: 0.3,
      roughness: 0.25,
      // R side camera = upper edge of cabin in driver-perspective (top = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.53, y: 0.28 },
    },
    {
      id: "induction-coil",
      name: "Inductive Charging Coil (underbody)",
      description:
        "Underbody receive coil aligning with a floor-installed pad at the depot. ~25 kW Qi-style coupling at ~92% end-to-end efficiency. Eliminates the plug entirely — no human ever connects a cable, which is the hard requirement for unmanned fleet operation.",
      position: [0, 0.04, 0],
      rotation: [Math.PI / 2, 0, 0],
      geometry: "ring",
      args: [0.35, 0.55, 48],
      color: "#d4a04a",
      emissive: "#3a2a08",
      metalness: 0.85,
      roughness: 0.3,
      // Concentric gold rings at center of underfloor on cutaway.
      cutawayHotspot: { x: 0.59, y: 0.50 },
    },
    {
      id: "battery",
      name: "Structural Battery Pack",
      description:
        "Flat skateboard pack — 4680 cells in a structural-pack layout shared with Cybertruck. Capacity sized small (~50 kWh) because fleet duty cycle favors many short charges over one big pack; smaller pack means cheaper cab and faster top-up between rides.",
      position: [0, 0.20, 0],
      geometry: "box",
      args: [1.7, 0.12, 2.6],
      color: "#2a2d33",
      metalness: 0.75,
      roughness: 0.4,
      // Cell-grid rectangle wrapping the cabin floor — right edge of pack.
      cutawayHotspot: { x: 0.65, y: 0.65 },
    },
    {
      id: "rear-drive-unit",
      name: "Single Rear Drive Unit",
      description:
        "One motor, rear-drive only. No front motor — saves cost, mass, and a whole second inverter. Sized for ~150 kW, plenty for a 1500kg cab that never drag-races. Same family as Model 3 RWD's permanent-magnet unit.",
      position: [0, 0.30, -1.55],
      geometry: "box",
      args: [0.9, 0.25, 0.35],
      color: "#3a3d44",
      metalness: 0.85,
      roughness: 0.35,
      // Dark-gray motor box between rear wheels on cutaway.
      cutawayHotspot: { x: 0.74, y: 0.50 },
    },
    {
      id: "seat-l",
      name: "Left Seat",
      description:
        "Forward-facing 2-up bench-style seat. Wipe-clean composite with replaceable cushion modules — fleet ops can swap a soiled seat in under 60 seconds at the depot rather than detail it.",
      position: [0.42, 0.95, -0.15],
      geometry: "box",
      args: [0.55, 0.6, 0.55],
      color: "#1f1f24",
      metalness: 0.2,
      roughness: 0.8,
      // Seat-L in driver-perspective = lower seat in 2-up bench (bottom = driver-LEFT in LHD).
      cutawayHotspot: { x: 0.436, y: 0.603 },
    },
    {
      id: "seat-r",
      name: "Right Seat",
      description:
        "Mirror of left. No driver seat — no steering wheel, no pedals — so the dashboard space is gone and both occupants get the same legroom as a Model S front-row passenger.",
      position: [-0.42, 0.95, -0.15],
      geometry: "box",
      args: [0.55, 0.6, 0.55],
      color: "#1f1f24",
      metalness: 0.2,
      roughness: 0.8,
      // Seat-R in driver-perspective = upper seat in 2-up bench (top = driver-RIGHT in LHD).
      cutawayHotspot: { x: 0.436, y: 0.398 },
    },
    {
      id: "cabin-screen",
      name: "Center Cabin Screen",
      description:
        "Single shared touchscreen between the seats — trip status, music, climate, emergency stop. No instrument cluster (nobody's driving) and no HUD. App-pair on entry so the cab inherits your music and destination from your phone.",
      position: [0, 1.05, 0.25],
      geometry: "box",
      args: [0.45, 0.28, 0.025],
      color: "#0a0a10",
      emissive: "#142036",
      metalness: 0.3,
      roughness: 0.2,
      // Small screen between seats on cutaway — central spine well clear of seats.
      cutawayHotspot: { x: 0.43, y: 0.50 },
    },
    {
      id: "no-wheel-marker",
      name: "Steering Column Delete",
      description:
        "Where the steering column would be — nothing. No wheel, no pedals, no column. Removes ~75kg and the NHTSA Federal Motor Vehicle Safety Standards path Tesla is filing exemption for. Forces Tesla's hand on FSD reliability: there's no fallback driver.",
      position: [0, 0.85, 0.6],
      geometry: "box",
      args: [0.02, 0.02, 0.02],
      color: "#15171c",
      metalness: 0.1,
      roughness: 0.9,
      // Red X marker ahead of seats on cutaway — further left.
      cutawayHotspot: { x: 0.30, y: 0.50 },
    },
  ],
  relatedSites: ["giga-texas"],
  galleryPhotos: [
    {
      src: "/products/photos/cybercab/1.jpg",
      label: "Cybercab",
      credit: {
        author: "Dllu",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ATesla_Cybercab_at_Santana_Row_side_view_dllu.jpg",
      },
    },
    {
      src: "/products/photos/cybercab/2.jpg",
      label: "Rear",
      credit: {
        author: "Steve Jurvetson from Los Altos, USA",
        license: "CC BY 2.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ARear_of_the_Tesla_Cybercab.jpg",
      },
    },
  ],
};

export default cybercab;
