import type { ProductSpec } from "./index";

// Units: 1 scene unit ~ 1mm. Implant is ~23mm diameter (radius 11.5) x 8mm thick.
export const neuralinkN1: ProductSpec = {
  slug: "neuralink-n1",
  name: "Neuralink N1 Implant",
  aka: "The Link",
  category: "chip",
  description:
    "Coin-sized brain-computer interface implanted flush with the skull. The N1 hosts 1,024 electrodes across 64 polymer threads, each thread inserted by the R1 surgical robot at sub-100 micron precision. On-device ASIC digitizes neural spikes at ~20 kHz per channel and streams compressed activity over Bluetooth to an external app. Inductive charging through the skin replaces the percutaneous connectors that limited prior BCIs.",
  cameraPosition: [20, 14, 22],
  cameraMinDistance: 10,
  cameraMaxDistance: 120,
  cameraTarget: [0, 1.5, 0],
  background: "#080810",
  photoCredit: {
    author: "Wikimedia Commons contributors",
    license: "CC BY-SA 4.0 (see source)",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Neuralink",
  },
  // Side cutaway drawn in-house. Left half shows the intact titanium
  // puck sitting flush in a skull recess (scalp lifted away). Right
  // half is the cut-open view — hermetic Ti lid + surgical-robot
  // fiducials, inductive charging coil, BLE antenna trace, N1 ASIC
  // die with wire bonds, small Li cell, glass-to-metal feedthrough
  // ring, polymer thread-relief block, and the 64-thread tassel
  // descending through the dura into layer V of motor cortex with
  // iridium-oxide electrode tips. CC0.
  //
  // Note: the existing main.jpg is the R1 surgical robot photographed
  // at the launch event — not the N1 implant itself — so the puck and
  // its parts are not visible on the exterior view. All hotspots live
  // on the cutaway image; parts stay list-only on exterior.
  cutawayImage: {
    src: "/products/photos/neuralink-n1/cutaway.svg",
    credit: {
      source: "Gigascope original SVG",
      url: "https://github.com/sincetwentytwo-sys/gigascope/blob/main/public/products/photos/neuralink-n1/cutaway.svg",
      license: "CC0",
    },
  },
  parts: [
    {
      id: "housing",
      name: "Titanium Housing",
      description:
        "Medical-grade titanium puck, ~23mm diameter x 8mm thick. Sits in a precision craniectomy with the top surface flush with the outer skull. Titanium is hermetic to helium and biocompatible — the implant is rated for decades in vivo without leakage.",
      position: [0, 0, 0],
      geometry: "cylinder",
      args: [11.5, 11.5, 8, 64],
      color: "#b8bcc2",
      metalness: 0.9,
      roughness: 0.35,
      // Cutaway: intact-left puck side wall (titanium shell visible flank).
      cutawayHotspot: { x: 0.10, y: 0.28 },
    },
    {
      id: "top-surface",
      name: "Top Hermetic Lid",
      description:
        "Laser-welded titanium lid sealing the electronics from cerebrospinal fluid. Helium leak-tested to under 1e-9 atm-cc/sec. The weld bead is ground flush so scalp closure leaves no palpable ridge through the skin.",
      position: [0, 4.05, 0],
      geometry: "cylinder",
      args: [11.5, 11.5, 0.3, 64],
      color: "#d0d4d9",
      metalness: 0.95,
      roughness: 0.25,
      // Cutaway: thin Ti lid layer at the top of the cut puck.
      cutawayHotspot: { x: 0.55, y: 0.22 },
    },
    {
      id: "charge-coil",
      name: "Inductive Charging Coil",
      description:
        "Wireless power receive coil tuned to ~13.56 MHz under the lid. Couples to an external charging puck worn over the implant site for ~1 hour daily. Eliminates the percutaneous connector that caused most infections in Utah-array era BCIs.",
      position: [0, 4.25, 0],
      geometry: "torus",
      args: [9.0, 0.35, 16, 64],
      rotation: [Math.PI / 2, 0, 0],
      color: "#c9a14a",
      metalness: 0.85,
      roughness: 0.3,
      // Cutaway: copper coil winding band under the lid (right side).
      cutawayHotspot: { x: 0.75, y: 0.235 },
    },
    {
      id: "hermetic-seal",
      name: "Feedthrough Ring",
      description:
        "Glass-to-metal feedthrough ring carrying the 1,024 hair-thin electrode traces from the inside of the housing to the external threads. Each feedthrough is hermetic — any breach lets CSF into the electronics and ends the implant life.",
      position: [0, -2.0, 0],
      geometry: "ring",
      args: [10.5, 11.4, 64],
      rotation: [Math.PI / 2, 0, 0],
      color: "#6a6e74",
      metalness: 0.7,
      roughness: 0.5,
      // Cutaway: feedthrough seal band with vertical pin pattern (left of band).
      cutawayHotspot: { x: 0.55, y: 0.32 },
    },
    {
      id: "asic",
      name: "N1 ASIC (1024-channel)",
      description:
        "Custom CMOS readout chip with 1,024 amplifier channels. Each channel: low-noise amp, 10-bit ADC sampled at ~19.3 kHz, on-chip spike detection. Total digitized data is compressed on-die before Bluetooth transmit to stay under ~10 mW power budget.",
      position: [0, 1.0, 0],
      geometry: "box",
      args: [8.0, 1.5, 8.0],
      color: "#1f2227",
      metalness: 0.6,
      roughness: 0.45,
      // Cutaway: dark ASIC die rectangle in the puck cavity.
      cutawayHotspot: { x: 0.65, y: 0.275 },
    },
    {
      id: "battery",
      name: "Lithium-ion Cell",
      description:
        "Small custom Li-ion cell powering the implant between inductive top-ups. Sized for ~24 hours of full-rate streaming. Charge/discharge limited by a dedicated BMS to keep cell skin temperature within 2 C of body temp; brain tissue heats above 38 C is unsafe.",
      position: [-3.5, -0.5, 0],
      geometry: "cylinder",
      args: [2.0, 2.0, 4.0, 32],
      color: "#4a4e54",
      metalness: 0.7,
      roughness: 0.4,
      // Cutaway: small grey Li cell block at far right of the puck cavity.
      cutawayHotspot: { x: 0.92, y: 0.275 },
    },
    {
      id: "bluetooth-antenna",
      name: "Bluetooth LE Antenna",
      description:
        "Curved trace antenna tuned to 2.4 GHz, routed around the inside perimeter of the housing for clearance from the metal lid. Streams spike-detect events (not raw waveforms) to the user app at ~1 Mbps. Range is short — typical link distance ~1 meter.",
      position: [0, 0.5, 0],
      geometry: "torus",
      args: [9.5, 0.15, 8, 48, Math.PI],
      rotation: [Math.PI / 2, 0, 0],
      color: "#c0c0c8",
      metalness: 0.85,
      roughness: 0.3,
      // Antenna is the thin silver curve under the coil — too crowded
      // to land a non-overlapping dot. List-only on cutaway as well.
    },
    {
      id: "skull-mount",
      name: "Skull Mount Flange",
      description:
        "Outer flange sits on the dura and the skull edge of the craniectomy. The titanium lip distributes implant weight and seats the device flush; mismatch here causes the bump that subjects feel through the scalp during the first weeks post-op.",
      position: [0, -3.8, 0],
      geometry: "torus",
      args: [11.5, 0.5, 16, 64],
      rotation: [Math.PI / 2, 0, 0],
      color: "#9ea3a9",
      metalness: 0.88,
      roughness: 0.4,
      // Cutaway: left-edge of the intact puck where it seats on the skull/dura.
      cutawayHotspot: { x: 0.20, y: 0.32 },
    },
    {
      id: "thread-relief",
      name: "Thread Tension Relief",
      description:
        "Polymer block at the housing base where the 64 threads exit. Provides strain relief so micro-motions of the brain relative to the skull (~100 microns per heartbeat) do not propagate up the threads and pull electrodes out of cortex.",
      position: [0, -4.0, 0],
      geometry: "box",
      args: [10.0, 0.6, 6.0],
      color: "#2a2d33",
      metalness: 0.2,
      roughness: 0.8,
      // Cutaway: dark polymer block under the feedthrough.
      cutawayHotspot: { x: 0.80, y: 0.34 },
    },
    {
      id: "thread-1",
      name: "Polymer Thread Bundle (cluster A)",
      description:
        "Polyimide threads ~4-6 micrometers wide — about 1/20 the diameter of a human hair. Thin enough to slip between brain capillaries without rupture, which is why Neuralink avoids the bleeding and gliosis that plague rigid Utah-array silicon shanks.",
      position: [-4.0, -7.0, -1.5],
      rotation: [0, 0, 0.15],
      geometry: "box",
      args: [0.3, 6.0, 0.05],
      color: "#d4af37",
      metalness: 0.7,
      roughness: 0.4,
      // Cutaway: leftmost cluster of the descending thread tassel.
      cutawayHotspot: { x: 0.55, y: 0.45 },
    },
    {
      id: "thread-2",
      name: "Polymer Thread Bundle (cluster B)",
      description:
        "Each thread carries 16 electrodes spaced along its length, for 1,024 total recording sites across the 64-thread array. The R1 robot inserts threads at roughly 6 per minute with sub-100 micron targeting, dodging visible surface vasculature in real time.",
      position: [-1.3, -7.0, -1.5],
      rotation: [0, 0, 0.05],
      geometry: "box",
      args: [0.3, 6.0, 0.05],
      color: "#d4af37",
      metalness: 0.7,
      roughness: 0.4,
      // Cutaway: left-center cluster of the thread tassel.
      cutawayHotspot: { x: 0.65, y: 0.50 },
    },
    {
      id: "thread-3",
      name: "Polymer Thread Bundle (cluster C)",
      description:
        "Threads target layer V of motor cortex at ~1.5-3mm depth, where pyramidal neurons project to spinal motor circuits. Decoders trained on this layer let participants control a cursor at ~8 bits per second — comparable to neurotypical trackpad speed.",
      position: [1.3, -7.0, -1.5],
      rotation: [0, 0, -0.05],
      geometry: "box",
      args: [0.3, 6.0, 0.05],
      color: "#d4af37",
      metalness: 0.7,
      roughness: 0.4,
      // Cutaway: right-center cluster of the thread tassel.
      cutawayHotspot: { x: 0.75, y: 0.45 },
    },
    {
      id: "thread-4",
      name: "Polymer Thread Bundle (cluster D)",
      description:
        "Thread flexibility lets them ride with brain micro-motion instead of slicing through tissue. Long-term recording yield (the fraction of channels still detecting spikes after months) is the metric that historically killed rigid BCIs; flex threads are the bet.",
      position: [4.0, -7.0, -1.5],
      rotation: [0, 0, -0.15],
      geometry: "box",
      args: [0.3, 6.0, 0.05],
      color: "#d4af37",
      metalness: 0.7,
      roughness: 0.4,
      // Cutaway: rightmost cluster of the thread tassel.
      cutawayHotspot: { x: 0.85, y: 0.50 },
    },
    {
      id: "electrode-tips",
      name: "Electrode Tip Cluster",
      description:
        "Iridium oxide electrode pads at thread tips. IrOx has a high charge-storage capacity, low impedance (~10-50 kOhm at 1 kHz), and tolerates the chronic ionic environment of cortex better than the bare platinum used in older arrays.",
      position: [0, -10.5, -1.5],
      geometry: "sphere",
      args: [0.4, 24, 24],
      color: "#7af7c4",
      emissive: "#1aa07a",
      metalness: 0.6,
      roughness: 0.3,
      // Cutaway: iridium-oxide electrode dots in layer V cortex.
      cutawayHotspot: { x: 0.65, y: 0.62 },
    },
  ],
  relatedSites: ["neuralink-fremont", "neuralink-austin"],
  galleryPhotos: [
    {
      src: "/products/photos/neuralink-n1/1.jpg",
      label: "Implant",
      credit: {
        author: "Steve Jurvetson",
        license: "CC BY 2.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3AElon_Musk_and_the_Neuralink_Future.jpg",
      },
    },
    {
      src: "/products/photos/neuralink-n1/2.jpg",
      label: "Chip",
      credit: {
        author: "Rational Optimist Society",
        license: "CC BY 3.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ANoland_Arbaugh_on_ROP.jpg",
      },
    },
  ],
};

export default neuralinkN1;
