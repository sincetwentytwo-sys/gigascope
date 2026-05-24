import type { ProductSpec } from "./index";

// Units: 1 scene unit ~ 1 meter. Optimus Gen 3 is ~1.73m tall, 57kg, 28 actuated DOFs.
// Stand pose, feet on ground at y=0, head crown near y=1.73. Arms slightly forward.
export const optimus: ProductSpec = {
  slug: "optimus",
  name: "Tesla Optimus Gen 3",
  aka: "Bumblebee successor",
  category: "robot",
  description:
    "1.73m tall, 57kg humanoid with 28 actuated body DOFs plus 22 DOFs per hand. Gen 3 swaps Gen 2's harmonic drives for Tesla-designed planetary actuators, drops mass ~10kg, and routes hand tendons through the forearm to cut end-effector inertia ~40%. Compute is a derivative HW4 SoC running the same vision-to-action policy pipeline as FSD — billions of video frames plus sim rollouts, ~50 Hz onboard inference inside a ~100 W envelope.",
  cameraPosition: [1.75, 1.45, 2.55],
  cameraTarget: [0, 0.87, 0.08],
  cameraMinDistance: 1,
  cameraMaxDistance: 12,
  background: "#1a1d24",
  photoCredit: {
    author: "Sikander Iqbal",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Optimus_bot_at_Tesla_showroom_-_20251118_-_01.jpg",
  },
  // Front cross-section drawn in-house — left half intact humanoid
  // silhouette (head/chest/arms/legs); right half cut down the spine to
  // expose the camera cluster, FSD-derivative compute board, 2.3 kWh
  // chest battery, coolant reservoir + lines, central serial-bus spine,
  // 3-DOF shoulder/hip actuator stacks, forearm tendon drum driving the
  // hand, high-torque knee, ankle actuator, foot load cells, and IMU at
  // the pelvis. CC0.
  cutawayImage: {
    src: "/products/photos/optimus/cutaway.svg",
    credit: {
      source: "Gigascope original SVG",
      url: "https://github.com/sincetwentytwo-sys/gigascope/blob/main/public/products/photos/optimus/cutaway.svg",
      license: "CC0",
    },
  },
  // Naming convention: -l / -r refer to the ROBOT'S own left / right, so
  // shoulder-l renders on the viewer's RIGHT side of the photo (and on the
  // cutaway side of the SVG, which is also rendered on the right). The R
  // limbs map to the viewer's LEFT (intact half of the SVG).
  parts: [
    {
      id: "head",
      name: "Head / Sensor Pod",
      description:
        "Dark glossy face plate hiding the camera array — no Lidar, vision-only stack mirroring FSD. Front shell is a single curved plate (no eyes/mouth) so users read intent from posture and audio rather than anthropomorphic features Tesla deliberately avoids.",
      position: [0, 1.62, 0],
      geometry: "sphere",
      args: [0.11, 32, 32],
      color: "#1a1a1f",
      metalness: 0.75,
      roughness: 0.2,
      // Exterior: glossy black dome of the robot's head (camera angle puts
      // the visible centerline slightly left of frame center).
      hotspot: { x: 0.4200, y: 0.1600 },
      // Cutaway: intact-side head dome.
      cutawayHotspot: { x: 0.2880, y: 0.0890 },
    },
    {
      id: "face-plate",
      name: "Glossy Face Plate",
      description:
        "Optically clear polymer shield over the forward camera cluster (3x wide + tele). Same supplier base as Model Y interior trim. Gen 3 added a thermal IR window inside the plate for low-light grasp planning in warehouses.",
      position: [0, 1.62, 0.085],
      geometry: "box",
      args: [0.14, 0.13, 0.02],
      color: "#0a0a10",
      metalness: 0.9,
      roughness: 0.15,
      // Exterior: visible camera-strip band across the face (deliberately
      // offset below the head dot so the two don't overlap).
      hotspot: { x: 0.4200, y: 0.2100 },
      // Cutaway: camera cluster shown through the cut head dome.
      cutawayHotspot: { x: 0.7130, y: 0.0890 },
    },
    {
      id: "neck",
      name: "Neck Actuator",
      description:
        "2-DOF neck (pitch + yaw) on a single coaxial actuator stack. Cable harness routes through a hollow output shaft so head can rotate ±90° without strain on the camera ribbon cables.",
      position: [0, 1.48, 0],
      geometry: "cylinder",
      args: [0.05, 0.05, 0.08, 24],
      color: "#3a3d44",
      metalness: 0.8,
      roughness: 0.35,
      // Neck is largely obscured by chest collar in the showroom photo,
      // so no exterior hotspot. Cutaway shows the sliced actuator drum.
      cutawayHotspot: { x: 0.7130, y: 0.1560 },
    },
    {
      id: "torso",
      name: "Torso Shell",
      description:
        "Glass-fiber composite chest shell over an aluminum subframe. Houses the compute, 2.3 kWh battery, and the central wiring spine. Mass-optimized vs Gen 2's stamped aluminum chest — saves ~3.5kg without losing torsional stiffness.",
      position: [0, 1.18, 0],
      geometry: "box",
      args: [0.42, 0.55, 0.24],
      color: "#e8e8ec",
      metalness: 0.3,
      roughness: 0.4,
      // Exterior: on the visible TESLA wordmark on the white chest.
      hotspot: { x: 0.4200, y: 0.3000 },
      // Cutaway: intact-side chest shell (TESLA wordmark area).
      cutawayHotspot: { x: 0.2880, y: 0.2570 },
    },
    {
      id: "battery-pack",
      name: "Chest Battery Pack (2.3 kWh)",
      description:
        "2.3 kWh Li-ion pack mounted forward in the torso. Targets a full work-shift of ~8 hours at typical warehouse duty cycle. Sits high in the chest to keep CoM near the hip joint, simplifying balance control.",
      position: [0, 1.20, 0.13],
      geometry: "cylinder",
      args: [0.10, 0.10, 0.04, 32],
      rotation: [Math.PI / 2, 0, 0],
      color: "#2a2d33",
      metalness: 0.7,
      roughness: 0.4,
      // Internal — no exterior hotspot. Cutaway: cell-array battery block
      // at the top of the open chest cavity.
      cutawayHotspot: { x: 0.7250, y: 0.2050 },
    },
    {
      id: "cooling-vents",
      name: "Rear Cooling Vents",
      description:
        "Thin parallel slots venting the compute and battery loop on the back of the torso. Liquid-cooled SoC; the air vents only dump the secondary heat exchanger. Total thermal budget ~150 W sustained, ~250 W peak.",
      position: [0, 1.18, -0.13],
      geometry: "box",
      args: [0.30, 0.18, 0.005],
      color: "#0e0f12",
      metalness: 0.4,
      roughness: 0.6,
      // Rear-facing only — no exterior hotspot on a front photo. Cutaway:
      // slotted vent grid in the chest cavity below the compute board.
      cutawayHotspot: { x: 0.6800, y: 0.3600 },
    },
    {
      id: "pelvis",
      name: "Pelvis Assembly",
      description:
        "Compact pelvis housing the hip yaw actuators and the central IMU. The IMU placement here (not the chest) minimizes lever-arm errors during dynamic walking — a Gen 3 change that improved stair-climb success rate to >95%.",
      position: [0, 0.88, 0],
      geometry: "box",
      args: [0.30, 0.16, 0.22],
      color: "#d0d0d4",
      metalness: 0.4,
      roughness: 0.45,
      // Exterior: visible gray pelvis block under the black abdomen belt.
      hotspot: { x: 0.4200, y: 0.4550 },
      // Cutaway: IMU chip rendered inside the pelvis bay.
      cutawayHotspot: { x: 0.7250, y: 0.4540 },
    },
    // Shoulders
    {
      id: "shoulder-l",
      name: "Left Shoulder (3-DOF)",
      description:
        "3-DOF shoulder: pitch, roll, yaw via three nested actuators. Each uses a Tesla-designed planetary gearbox replacing Gen 2's harmonic drives — ~30% cheaper, equally backdrivable for safe human contact.",
      position: [0.24, 1.40, 0],
      geometry: "sphere",
      args: [0.075, 24, 24],
      color: "#bfbfc4",
      metalness: 0.7,
      roughness: 0.35,
      // Robot's left = viewer's right side of the photo.
      hotspot: { x: 0.5100, y: 0.2700 },
      // Cutaway: actuator stack rendered with nested rings on the cut side.
      cutawayHotspot: { x: 0.8630, y: 0.1790 },
    },
    {
      id: "shoulder-r",
      name: "Right Shoulder (3-DOF)",
      description:
        "Mirror of left shoulder. Symmetric kinematics simplify policy training — the same neural net controls both arms with a left/right token rather than separate models.",
      position: [-0.24, 1.40, 0],
      geometry: "sphere",
      args: [0.075, 24, 24],
      color: "#bfbfc4",
      metalness: 0.7,
      roughness: 0.35,
      // Robot's right = viewer's left.
      hotspot: { x: 0.3200, y: 0.2700 },
      // Cutaway: smooth intact-side shoulder sphere.
      cutawayHotspot: { x: 0.1500, y: 0.1790 },
    },
    // Upper arms (slightly forward)
    {
      id: "upper-arm-l",
      name: "Left Upper Arm",
      description:
        "Carbon-wrapped aluminum tube. Houses no actuators — Gen 3 moved all elbow-down motors into the forearm. Result: arm inertia ~40% lower, enabling faster reach without overshoot.",
      position: [0.26, 1.20, 0.05],
      rotation: [0.2, 0, 0.05],
      geometry: "cylinder",
      args: [0.05, 0.045, 0.28, 24],
      color: "#e8e8ec",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.5300, y: 0.3500 },
      // Cutaway: hollow carbon tube on the cut side (slightly inset x to
      // avoid stacking with shoulder/elbow dots in the same column).
      cutawayHotspot: { x: 0.8400, y: 0.2800 },
    },
    {
      id: "upper-arm-r",
      name: "Right Upper Arm",
      description:
        "Mirror of left. Routing channel inside the tube carries power + a single high-speed serial bus to the forearm — daisy-chained sensor topology cuts the harness count by ~60% vs Gen 2.",
      position: [-0.26, 1.20, 0.05],
      rotation: [0.2, 0, -0.05],
      geometry: "cylinder",
      args: [0.05, 0.045, 0.28, 24],
      color: "#e8e8ec",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.3000, y: 0.3500 },
      cutawayHotspot: { x: 0.1650, y: 0.2800 },
    },
    // Elbows
    {
      id: "elbow-l",
      name: "Left Elbow Joint",
      description:
        "Single-DOF elbow flexion. Mechanical hard-stop at 5° to prevent hyperextension if a fall loads the joint. Joint stiffness is software-tunable from compliant (~5 Nm/rad) for collaboration to stiff (>200 Nm/rad) for lifting.",
      position: [0.32, 0.96, 0.12],
      geometry: "sphere",
      args: [0.055, 24, 24],
      color: "#a8a8ad",
      metalness: 0.75,
      roughness: 0.3,
      // Exterior: distinct black elbow pad on the photo.
      hotspot: { x: 0.5200, y: 0.4200 },
      cutawayHotspot: { x: 0.8700, y: 0.3450 },
    },
    {
      id: "elbow-r",
      name: "Right Elbow Joint",
      description:
        "Mirror of left. Position is encoded by dual-redundant magnetic encoders — single-fault-tolerant for safety-rated operation near humans.",
      position: [-0.32, 0.96, 0.12],
      geometry: "sphere",
      args: [0.055, 24, 24],
      color: "#a8a8ad",
      metalness: 0.75,
      roughness: 0.3,
      hotspot: { x: 0.3100, y: 0.4200 },
      cutawayHotspot: { x: 0.1480, y: 0.3450 },
    },
    // Forearms (house hand-tendon actuators)
    {
      id: "forearm-l",
      name: "Left Forearm (hand actuators inside)",
      description:
        "Houses 11 of the 22 hand actuators — Gen 3 moved them out of the palm into the forearm and drives the fingers via tendons. End-effector mass dropped from ~600g to ~360g, doubling safe collision speed.",
      position: [0.34, 0.78, 0.18],
      rotation: [0.3, 0, 0.04],
      geometry: "cylinder",
      args: [0.045, 0.04, 0.26, 24],
      color: "#dcdce0",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.5300, y: 0.4900 },
      // Cutaway: tendon drum is the orange disc visible on this segment.
      cutawayHotspot: { x: 0.8600, y: 0.4200 },
    },
    {
      id: "forearm-r",
      name: "Right Forearm (hand actuators inside)",
      description:
        "Mirror of left. The remaining 11 actuators per hand live here. Tendons exit through a polymer guide cuff at the wrist and route over routing pulleys at each finger joint.",
      position: [-0.34, 0.78, 0.18],
      rotation: [0.3, 0, -0.04],
      geometry: "cylinder",
      args: [0.045, 0.04, 0.26, 24],
      color: "#dcdce0",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.3100, y: 0.4900 },
      cutawayHotspot: { x: 0.1650, y: 0.4200 },
    },
    // Hands (flat boxes)
    {
      id: "hand-l",
      name: "Left Hand (22 DOFs)",
      description:
        "Gen 3 hand: 22 actuated DOFs per hand including a tendon-driven thumb opposition. Force-feedback at each fingertip enables ~half-egg grip without cracking and screwdriver torque control. Driven from the forearm via tendons.",
      position: [0.36, 0.60, 0.28],
      rotation: [0.4, 0, 0],
      geometry: "box",
      args: [0.085, 0.18, 0.04],
      color: "#1f1f24",
      metalness: 0.4,
      roughness: 0.5,
      hotspot: { x: 0.5000, y: 0.5700 },
      // Cutaway: cut hand box showing finger-linkage lines.
      cutawayHotspot: { x: 0.8680, y: 0.4900 },
    },
    {
      id: "hand-r",
      name: "Right Hand (22 DOFs)",
      description:
        "Mirror of left. Fingertip tactile sensors are MEMS pressure arrays — same family as the seat-occupant sensors in Model 3. The grasp policy is trained from teleop sessions recorded by Tesla operators in Fremont.",
      position: [-0.36, 0.60, 0.28],
      rotation: [0.4, 0, 0],
      geometry: "box",
      args: [0.085, 0.18, 0.04],
      color: "#1f1f24",
      metalness: 0.4,
      roughness: 0.5,
      hotspot: { x: 0.3300, y: 0.5700 },
      cutawayHotspot: { x: 0.1530, y: 0.4860 },
    },
    // Hips
    {
      id: "hip-l",
      name: "Left Hip (3-DOF)",
      description:
        "3-DOF hip: pitch, roll, yaw. Highest-torque joint in the robot (~200 Nm peak) — bears the impulsive load during heel strike. Liquid-cooled to sustain stair climbing without thermal throttling.",
      position: [0.10, 0.82, 0],
      geometry: "sphere",
      args: [0.085, 24, 24],
      color: "#bfbfc4",
      metalness: 0.75,
      roughness: 0.3,
      // Hip joints are largely concealed by chassis covers in the showroom
      // photo, so no exterior hotspot — anatomy is the cutaway story.
      // Cutaway: 3-DOF actuator stack visible in the open pelvis bay.
      cutawayHotspot: { x: 0.7800, y: 0.5200 },
    },
    {
      id: "hip-r",
      name: "Right Hip (3-DOF)",
      description:
        "Mirror of left. The hip-yaw axis is what lets Optimus pivot during a step without sliding the foot — Gen 2 lacked the bandwidth here, which is why early demos walked with a stiff toy-soldier gait.",
      position: [-0.10, 0.82, 0],
      geometry: "sphere",
      args: [0.085, 24, 24],
      color: "#bfbfc4",
      metalness: 0.75,
      roughness: 0.3,
      cutawayHotspot: { x: 0.2550, y: 0.5200 },
    },
    // Thighs
    {
      id: "thigh-l",
      name: "Left Thigh",
      description:
        "Forged aluminum thigh segment. Larger diameter than the arms because it carries 3-4x the dynamic load. Internal channel routes the cooling loop from the hip down to the knee.",
      position: [0.10, 0.58, 0],
      geometry: "cylinder",
      args: [0.07, 0.06, 0.40, 24],
      color: "#e8e8ec",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.4600, y: 0.6100 },
      // Cutaway: thigh tube with internal coolant line visible.
      cutawayHotspot: { x: 0.7830, y: 0.5800 },
    },
    {
      id: "thigh-r",
      name: "Right Thigh",
      description:
        "Mirror of left. The Q-axis (frontal-plane) compliance here is the single biggest contributor to walk stability — tuned via a Cartesian impedance loop running at 1 kHz on a dedicated motor-control MCU.",
      position: [-0.10, 0.58, 0],
      geometry: "cylinder",
      args: [0.07, 0.06, 0.40, 24],
      color: "#e8e8ec",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.3800, y: 0.6100 },
      cutawayHotspot: { x: 0.2500, y: 0.5800 },
    },
    // Knees
    {
      id: "knee-l",
      name: "Left Knee",
      description:
        "Single-DOF knee flexion driven by a high-ratio planetary actuator. Mechanical hard-stop at full extension. Same actuator family as the elbow but with a 3x larger output gear.",
      position: [0.10, 0.36, 0],
      geometry: "sphere",
      args: [0.065, 24, 24],
      color: "#a8a8ad",
      metalness: 0.75,
      roughness: 0.3,
      hotspot: { x: 0.4500, y: 0.6800 },
      cutawayHotspot: { x: 0.7830, y: 0.6360 },
    },
    {
      id: "knee-r",
      name: "Right Knee",
      description:
        "Mirror of left. Knee torque request is the most thermally limiting joint during squats / lifts — Gen 3 added a dedicated coolant branch direct from the chest reservoir.",
      position: [-0.10, 0.36, 0],
      geometry: "sphere",
      args: [0.065, 24, 24],
      color: "#a8a8ad",
      metalness: 0.75,
      roughness: 0.3,
      hotspot: { x: 0.3800, y: 0.6800 },
      cutawayHotspot: { x: 0.2500, y: 0.6360 },
    },
    // Shins
    {
      id: "shin-l",
      name: "Left Shin",
      description:
        "Aluminum shin tube. Houses the ankle actuators at the lower end — same forearm-style remote-actuation trick to reduce distal mass and improve foot swing speed.",
      position: [0.10, 0.18, 0],
      geometry: "cylinder",
      args: [0.055, 0.05, 0.30, 24],
      color: "#dcdce0",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.4500, y: 0.7400 },
      cutawayHotspot: { x: 0.7830, y: 0.7230 },
    },
    {
      id: "shin-r",
      name: "Right Shin",
      description:
        "Mirror of left. The shin's torsional stiffness sets the natural frequency of the swing leg — tuned to ~3 Hz to match the policy's preferred step cadence.",
      position: [-0.10, 0.18, 0],
      geometry: "cylinder",
      args: [0.055, 0.05, 0.30, 24],
      color: "#dcdce0",
      metalness: 0.5,
      roughness: 0.4,
      hotspot: { x: 0.3800, y: 0.7400 },
      cutawayHotspot: { x: 0.2500, y: 0.7230 },
    },
    // Feet
    {
      id: "foot-l",
      name: "Left Foot",
      description:
        "Flat composite foot with rubber sole. Two-piece sole with a passive heel-to-toe rocker reduces actuator energy during normal walking ~15%. Four ground-contact load cells per foot feed the balance controller.",
      position: [0.10, 0.025, 0.04],
      geometry: "box",
      args: [0.10, 0.05, 0.24],
      color: "#1a1a1f",
      metalness: 0.3,
      roughness: 0.7,
      hotspot: { x: 0.4500, y: 0.7900 },
      // Cutaway: foot box with copper load-cell dots visible.
      cutawayHotspot: { x: 0.7830, y: 0.8270 },
    },
    {
      id: "foot-r",
      name: "Right Foot",
      description:
        "Mirror of left. Foot length deliberately kept short (~24cm) — longer feet improve static stability but slow turning. Gen 3 picked the shortest length that still cleared the NHTSA-style tip-over test.",
      position: [-0.10, 0.025, 0.04],
      geometry: "box",
      args: [0.10, 0.05, 0.24],
      color: "#1a1a1f",
      metalness: 0.3,
      roughness: 0.7,
      hotspot: { x: 0.3800, y: 0.7900 },
      cutawayHotspot: { x: 0.2500, y: 0.8270 },
    },
  ],
  relatedSites: ["fremont", "giga-texas", "terafab"],
  galleryPhotos: [
    {
      src: "/products/photos/optimus/1.jpg",
      label: "Showroom",
      credit: {
        author: "Sikander",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AOptimus_bot_at_Tesla_showroom_-_20251118_-_02.jpg",
      },
    },
    {
      src: "/products/photos/optimus/2.jpg",
      label: "Bot",
      credit: {
        author: "Benjamin Ceci",
        license: "Public domain",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AOptimus_Tesla.jpg",
      },
    },
  ],
};

export default optimus;
