import type { ProductSpec } from "./index";

/**
 * SpaceX Raptor v2/v3 — full-flow staged combustion methalox engine.
 * Procedural layout (engine bell points down +Y origin at throat):
 *   - Nozzle bell:   y ≈ -1.6 (cone, wide end down)
 *   - Throat:        y ≈  0.05
 *   - Combustion ch: y ≈  0.55
 *   - Injector:      y ≈  1.1
 *   - Preburners:    y ≈  1.6  (two, flanking)
 *   - Turbopumps:    y ≈  2.1  (two, flanking, larger)
 *   - Plumbing/sens: y ≈  2.4+
 *   - Mount/gimbal:  y ≈  2.9
 */
export const raptor: ProductSpec = {
  slug: "raptor",
  name: "Raptor",
  aka: "SpaceX Raptor v2 / v3",
  category: "engine",
  description:
    "Raptor is SpaceX's full-flow staged combustion (FFSC) methalox engine that powers Starship and Super Heavy. It's the only FFSC engine ever to fly (the Soviet RD-270 was tested but cancelled). Both propellants enter the main chamber as hot gas, enabling ~330 bar chamber pressure — the highest of any operational engine. v3 targets 280+ tonnes of thrust with radically simplified plumbing.",
  cameraPosition: [5.5, 1.8, 6.5],
  cameraTarget: [0, 0.2, 0],
  background: "#0a0a0c",
  relatedSites: ["starbase", "spacex-hawthorne"],
  parts: [
    {
      id: "nozzle",
      name: "Nozzle (regen-cooled bell)",
      description:
        "Expands exhaust from ~330 bar in the chamber down to near-vacuum, converting pressure to velocity. Inner wall is a single copper-alloy piece with milled regen channels — methane flows through them before injection, cooling the wall and preheating the fuel.",
      position: [0, -1.0, 0],
      rotation: [Math.PI, 0, 0],
      geometry: "cone",
      args: [1.35, 2.2, 64, 1, true],
      color: "#5a5d66",
      metalness: 0.92,
      roughness: 0.28,
      hotspot: { points: "0.4967,0.5975 0.4800,0.6069 0.5100,0.6694 0.6211,0.8100 0.7089,0.9019 0.7444,0.8975 0.7756,0.8869 0.7833,0.8788 0.7744,0.8231 0.7200,0.7081 0.6433,0.6025 0.5922,0.5962 0.5778,0.6038 0.5311,0.6062" },
    },
    {
      id: "regen-channels",
      name: "Regenerative cooling channels",
      description:
        "Hundreds of milled channels running the length of the nozzle. Cold liquid methane absorbs heat from the wall (which would otherwise melt at 3500 K exhaust temps), then enters the fuel preburner already partially gasified.",
      position: [0, -0.75, 0],
      geometry: "torus",
      args: [1.05, 0.04, 12, 96],
      color: "#c97a3a",
      emissive: "#3a1500",
      metalness: 0.85,
      roughness: 0.4,
    },
    {
      id: "throat",
      name: "Throat",
      description:
        "The narrowest cross-section of the engine. Gas accelerates to Mach 1 exactly here; downstream it goes supersonic. Throat diameter sets the engine's mass flow and is the single most thermally-stressed component — heat flux exceeds 100 MW/m².",
      position: [0, 0.05, 0],
      geometry: "cylinder",
      args: [0.42, 0.42, 0.12, 48],
      color: "#8a3a1a",
      emissive: "#220500",
      metalness: 0.8,
      roughness: 0.35,
      hotspot: { points: "0.4278,0.1494 0.3811,0.2075 0.2822,0.2244 0.3022,0.2519 0.2256,0.4294 0.2511,0.4244 0.2600,0.4550 0.2011,0.4775 0.3878,0.5544 0.2222,0.8681 0.2800,0.9050 0.3378,0.8981 0.3511,0.9413 0.3856,0.8925 0.4311,0.9187 0.5944,0.9050 0.4200,0.5794 0.5078,0.5994 0.5022,0.6613 0.7000,0.8888 0.7756,0.8788 0.7467,0.7669 0.6356,0.6062 0.6378,0.5619 0.7033,0.5600 0.7422,0.5288 0.7056,0.4606 0.7378,0.3900 0.7189,0.3319 0.5878,0.2081 0.5944,0.1744" },
    },
    {
      id: "chamber",
      name: "Combustion chamber",
      description:
        "Full-flow staged combustion: both methane and oxygen arrive here already as hot gas (not liquid), enabling ~330 bar pressure and ~5% more Isp than gas-generator engines. Only Raptor and the Soviet RD-270 have ever flown this cycle.",
      position: [0, 0.55, 0],
      geometry: "cylinder",
      args: [0.55, 0.45, 0.85, 48],
      color: "#6b6e76",
      metalness: 0.9,
      roughness: 0.3,
      hotspot: { points: "0.4311,0.1500 0.3789,0.2075 0.2822,0.2231 0.2822,0.3231 0.2167,0.4350 0.2511,0.4225 0.2622,0.4525 0.2000,0.4813 0.3889,0.5544 0.2222,0.8675 0.2811,0.9056 0.3378,0.9031 0.3511,0.9437 0.3767,0.9131 0.5956,0.9081 0.4367,0.6106 0.3822,0.6038 0.4556,0.5919 0.4044,0.5931 0.4211,0.5787 0.5111,0.5988 0.5022,0.6625 0.7000,0.8888 0.7756,0.8781 0.6933,0.6737 0.5933,0.6000 0.6467,0.5981 0.6367,0.5619 0.7033,0.5594 0.7400,0.5294 0.7056,0.4625 0.7189,0.3312 0.5878,0.2081 0.5978,0.1806" },
    },
    {
      id: "injector",
      name: "Coaxial injector plate",
      description:
        "Hundreds of coaxial elements meter oxidizer-rich and fuel-rich gas streams into the chamber and shear them together. Because both streams are already gas, mixing is fast and complete — that's what enables FFSC's combustion efficiency.",
      position: [0, 1.1, 0],
      geometry: "cylinder",
      args: [0.6, 0.6, 0.18, 48],
      color: "#3d3f45",
      metalness: 0.75,
      roughness: 0.45,
    },
    {
      id: "preburner-ox",
      name: "Oxidizer preburner (ox-rich)",
      description:
        "Burns most of the LOX with a small slug of methane to produce hot oxygen-rich gas. This drives the LOX turbopump turbine, then enters the main chamber. Ox-rich hot gas is famously corrosive — Soviet metallurgy solved this with the RD-180; SpaceX with Inconel + thin films.",
      position: [0.95, 1.65, 0],
      geometry: "sphere",
      args: [0.36, 32, 24],
      color: "#5d8a5d",
      emissive: "#0a2a0a",
      metalness: 0.85,
      roughness: 0.35,
      hotspot: { points: "0.9978,0.1450 0.9889,0.1381 0.8900,0.1113 0.7100,0.1394 0.5567,0.1700 0.5800,0.1744 0.5922,0.1706 0.6156,0.1731 0.6167,0.1819 0.6011,0.1862 0.5933,0.2069 0.6100,0.2100 0.6278,0.2219 0.8022,0.1881 0.8144,0.1819 0.8567,0.1750 0.8633,0.1694 0.8933,0.1650 0.9278,0.1656 0.9944,0.1875" },
    },
    {
      id: "preburner-fuel",
      name: "Fuel preburner (fuel-rich)",
      description:
        "Burns most of the methane with a small slug of LOX to produce hot fuel-rich gas. This drives the methane turbopump turbine, then enters the main chamber. The two preburners run in parallel — that's the 'full flow' in FFSC.",
      position: [-0.95, 1.65, 0],
      geometry: "sphere",
      args: [0.36, 32, 24],
      color: "#8a5d3d",
      emissive: "#2a1500",
      metalness: 0.85,
      roughness: 0.35,
      hotspot: { points: "0.4311,0.1506 0.3822,0.1775 0.3856,0.2094 0.3367,0.2025 0.2833,0.2250 0.2789,0.3262 0.2078,0.4425 0.2567,0.4544 0.1989,0.4813 0.3878,0.5550 0.2222,0.8625 0.2344,0.8888 0.3367,0.9075 0.3489,0.9494 0.3822,0.9125 0.5944,0.9113 0.4444,0.6388 0.4622,0.5900 0.5044,0.5994 0.5156,0.6781 0.7000,0.8888 0.7767,0.8781 0.7467,0.7656 0.6356,0.6069 0.6378,0.5613 0.7022,0.5600 0.7400,0.5288 0.7056,0.4631 0.7367,0.4269 0.7189,0.3337 0.5856,0.2081 0.5944,0.1812" },
    },
    {
      id: "turbopump-ox",
      name: "Oxidizer turbopump",
      description:
        "Driven by the ox preburner, this turbine spins a pump impeller that boosts LOX pressure from tank ~6 bar to ~600+ bar before injection. Spins at ~20,000 rpm. The shaft seal between hot ox gas and liquid ox is one of the hardest seals in rocketry.",
      position: [1.4, 2.15, 0],
      geometry: "cylinder",
      args: [0.42, 0.42, 0.55, 32],
      color: "#7a9ec2",
      metalness: 0.9,
      roughness: 0.25,
    },
    {
      id: "turbopump-fuel",
      name: "Methane turbopump",
      description:
        "Driven by the fuel preburner. Smaller than the LOX pump because methane is less dense (~420 kg/m³ vs LOX 1140 kg/m³), so less mass to move per unit thrust. Boosts methane from tank pressure to ~550+ bar.",
      position: [-1.4, 2.15, 0],
      geometry: "cylinder",
      args: [0.36, 0.36, 0.5, 32],
      color: "#c2a878",
      metalness: 0.9,
      roughness: 0.25,
    },
    {
      id: "manifold",
      name: "Hot-gas manifold",
      description:
        "Routes hot gas from each preburner outlet down to the injector plate. v3 famously deletes most external piping by integrating manifolds directly into the powerhead casting — fewer flanges, fewer leak paths, lower mass.",
      position: [0, 2.05, 0],
      geometry: "box",
      args: [1.2, 0.25, 0.45],
      color: "#46484e",
      metalness: 0.85,
      roughness: 0.4,
    },
    {
      id: "sensors",
      name: "Pressure & temperature sensors",
      description:
        "Raptor instruments every preburner, pump bearing, and chamber port. Telemetry feeds a closed-loop controller that throttles 40-100% and can shut down within milliseconds of an off-nominal reading — critical for crew-rated flight.",
      position: [0, 2.5, 0.4],
      geometry: "box",
      args: [0.6, 0.15, 0.15],
      color: "#2a2c30",
      emissive: "#001a33",
      metalness: 0.6,
      roughness: 0.5,
    },
    {
      id: "ignition",
      name: "Spark torch igniters",
      description:
        "Methalox is not hypergolic, so each preburner and the main chamber need an ignition source. Raptor uses electric spark torches — no toxic TEA/TEB cartridges (like Merlin), enabling unlimited relights for Starship landing burns.",
      position: [0, 0.85, 0.5],
      geometry: "cylinder",
      args: [0.06, 0.06, 0.3, 16],
      color: "#d4b020",
      emissive: "#3a2800",
      metalness: 0.7,
      roughness: 0.4,
    },
    {
      id: "gimbal",
      name: "Gimbal mount",
      description:
        "Center-mount Raptors gimbal up to ~15° for thrust-vector control during ascent and landing. Hydraulic actuators were replaced by electric ones on v2+ — fewer fluids, faster response, lighter.",
      position: [0, 2.85, 0],
      geometry: "torus",
      args: [0.55, 0.08, 16, 48],
      color: "#9a9da5",
      metalness: 0.9,
      roughness: 0.3,
      hotspot: { points: "0.3644,0.0169 0.3600,0.1406 0.4033,0.1512 0.4356,0.1481 0.5300,0.1663 0.5333,0.1375 0.5289,0.0600 0.3756,0.0169" },
    },
    {
      id: "mount",
      name: "Vehicle interface (thrust puck)",
      description:
        "Transfers the engine's 230+ tonnes of thrust into the vehicle thrust structure. Super Heavy clusters 33 of these; the central 13 gimbal. Loads here exceed 2 MN per engine during ascent.",
      position: [0, 3.1, 0],
      geometry: "cylinder",
      args: [0.7, 0.85, 0.2, 32],
      color: "#3a3c42",
      metalness: 0.85,
      roughness: 0.45,
      hotspot: { points: "0.3656,0.0169 0.3622,0.0325 0.3622,0.0881 0.4922,0.1206 0.5300,0.1275 0.5278,0.0600 0.3822,0.0194" },
    },
  ],
  photoCredit: {
    author: "Brandon De Young",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:SpaceX_sea-level_Raptor_at_Hawthorne_-_2.jpg",
  },
  galleryPhotos: [
    {
      src: "/products/photos/raptor/1.jpg",
      label: "Engine",
      credit: {
        author: "Brandon De Young  @brandondeyoung_",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ASpaceX_Merlin_and_sea-level_Raptor_at_Hawthorne.jpg",
      },
    },
    {
      src: "/products/photos/raptor/2.jpg",
      label: "Turbopump",
      credit: {
        author: "Brandon De Young, with the Twitter handle @brandondeyoung_",
        license: "CC BY-SA 4.0",
        sourceUrl: "https://commons.wikimedia.org/wiki/File%3ASpaceX_sea-level_Raptor_at_Hawthorne_-_1.jpg",
      },
    },
  ],
};
