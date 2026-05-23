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
    "Raptor is SpaceX's full-flow staged combustion (FFSC) methalox engine that powers Starship and Super Heavy. It's the only FFSC engine ever to fly (the Soviet RD-270 was tested but cancelled). Both propellants enter the main chamber as hot gas, enabling industry-leading chamber pressure and ~5% more specific impulse than a gas-generator engine at the same expansion ratio. Headline numbers (Raptor 2 baseline per SpaceX briefings; Raptor 3 figures Musk-stated targets): Isp ~330s sea-level / ~380s vacuum (est., vacuum variant); chamber pressure 300 bar (R2) → 350 bar target (R3); O/F mixture ratio ~3.6 (methalox-rich-on-the-LOX-side vs stoichiometric 4.0, run slightly fuel-rich to cap chamber temperature); thrust ~230 tf sea-level (R2) → 280+ tf target (R3); thrust-to-weight ~200:1 (R2) → ~250:1 target (R3, ~1500 kg dry); throttling 40-100% (deep-throttle for Starship landing). Throat diameter ~0.2m. Sources: spacex.com/vehicles/starship, Eric Berger / Ars Technica reporting, NASASpaceflight forum technical analysis.",
  cameraPosition: [5.5, 1.8, 6.5],
  cameraTarget: [0, 0.2, 0],
  background: "#0a0a0c",
  relatedSites: ["starbase", "spacex-hawthorne"],
  parts: [
    {
      id: "nozzle",
      name: "Nozzle (regen-cooled bell)",
      description:
        "Expands exhaust from chamber pressure (300 bar on R2, 350 bar target on R3) down to near-vacuum, converting pressure to velocity. Sea-level Raptor runs an expansion ratio ~35:1 (bell sized so exit pressure roughly matches sea-level atmospheric — bigger and it would flow-separate at lift-off); the RVac vacuum variant uses a much larger ~80:1 (est., per NSF analysis) niobium-alloy skirt added below the regen-cooled section. Inner wall is a single copper-alloy piece (SX300 proprietary CuCrZr-class alloy per SpaceX briefings) with milled regen channels — methane flows through them before injection, cooling the wall and preheating the fuel.",
      position: [0, -1.0, 0],
      rotation: [Math.PI, 0, 0],
      geometry: "cone",
      args: [1.35, 2.2, 64, 1, true],
      color: "#5a5d66",
      metalness: 0.92,
      roughness: 0.28,
      hotspot: { x: 0.4500, y: 0.7800 },
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
      hotspot: { x: 0.4500, y: 0.6600 },
    },
    {
      id: "throat",
      name: "Throat",
      description:
        "The narrowest cross-section of the engine, ~0.2m diameter (est., scaled from published bell dimensions). Gas accelerates to Mach 1 exactly here; downstream it goes supersonic through the diverging bell. Throat area sets the engine's mass flow at a given chamber pressure (m_dot ∝ P_c · A_t / sqrt(T_c)) and is the single most thermally-stressed component — heat flux exceeds 100 MW/m², the highest of any operational engine. Wall survives only because methane in the regen channels is roughly ~1 mm away on the cold side, pulling heat fast enough to keep the SX300 copper alloy well below its softening point.",
      position: [0, 0.05, 0],
      geometry: "cylinder",
      args: [0.42, 0.42, 0.12, 48],
      color: "#8a3a1a",
      emissive: "#220500",
      metalness: 0.8,
      roughness: 0.35,
      hotspot: { x: 0.5000, y: 0.5500 },
    },
    {
      id: "chamber",
      name: "Combustion chamber",
      description:
        "Full-flow staged combustion: both methane and oxygen arrive here already as hot gas (not liquid), enabling 300 bar pressure on Raptor 2 (350 bar target on Raptor 3) and ~5% more Isp than gas-generator engines like Merlin. Only Raptor and the Soviet RD-270 have ever flown this cycle. Inner liner is SX300 — SpaceX's proprietary copper-chromium-zirconium-class alloy, picked for its high thermal conductivity (pulls heat into the regen channels fast enough that the wall never reaches the methane combustion temp of ~3500 K). Hundreds of axial cooling slots are wire-EDM'd into the liner; cold methane runs through them before injection, soaking up megawatts of wall heat in a single pass — that recovered enthalpy goes right back into the chamber as hotter inlet gas.",
      position: [0, 0.55, 0],
      geometry: "cylinder",
      args: [0.55, 0.45, 0.85, 48],
      color: "#6b6e76",
      metalness: 0.9,
      roughness: 0.3,
      hotspot: { x: 0.5000, y: 0.4500 },
    },
    {
      id: "injector",
      name: "Coaxial injector plate",
      description:
        "Hundreds of coaxial-shear elements (LOX-rich gas down the inner post, methane-rich gas in the surrounding annulus) meter the two preburner exhaust streams into the chamber and shear them together. Because both streams are already gas, mixing is fast and complete — that's what enables FFSC's combustion efficiency and what gives Raptor its ~40-100% throttling range (gas-gas injection stays stable down to ~40% mass flow, where liquid coaxial elements would atomize unevenly). No pintle — pintle injectors are a Merlin / lunar-lander pattern, fine for kerolox but a poor fit for FFSC's twin-gas inlet. Mixture ratio held near O/F ~3.6 by tuning preburner valves on closed-loop telemetry.",
      position: [0, 1.1, 0],
      geometry: "cylinder",
      args: [0.6, 0.6, 0.18, 48],
      color: "#3d3f45",
      metalness: 0.75,
      roughness: 0.45,
      hotspot: { x: 0.5000, y: 0.4000 },
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
      hotspot: { x: 0.6200, y: 0.2800 },
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
      hotspot: { x: 0.3800, y: 0.2800 },
    },
    {
      id: "turbopump-ox",
      name: "Oxidizer turbopump",
      description:
        "Driven by the ox preburner, this turbine spins a pump impeller that boosts LOX pressure from tank ~6 bar to ~600+ bar before injection — well above the 300-bar chamber pressure to overcome injector pressure drop and combustion dynamics. Spins at ~20,000 rpm (est., scaled from Merlin published figures); the LOX turbine is on its own shaft, driven only by the ox-rich preburner — this is the 'full' in full-flow staged combustion, distinct from RS-25 / RD-180 cycles that drive both pumps off a single preburner stream. The shaft seal between hot oxygen-rich gas (~700 K) and cryogenic liquid oxygen (~90 K) is one of the hardest seals in rocketry; SpaceX uses Inconel components with proprietary thin-film coatings to survive the ox-rich environment that destroyed early Soviet attempts.",
      position: [1.4, 2.15, 0],
      geometry: "cylinder",
      args: [0.42, 0.42, 0.55, 32],
      color: "#7a9ec2",
      metalness: 0.9,
      roughness: 0.25,
      hotspot: { x: 0.6000, y: 0.1800 },
    },
    {
      id: "turbopump-fuel",
      name: "Methane turbopump",
      description:
        "Driven by the fuel preburner on a fully separate shaft from the LOX pump — the two preburners and two pumps run in parallel, hence 'full-flow staged combustion'. Smaller than the LOX pump because methane is less dense (~420 kg/m³ vs LOX 1140 kg/m³) and the engine runs at O/F ~3.6 (so ~3.6× more LOX mass than CH4 mass per second). Boosts methane from tank pressure to ~550+ bar; the methane is already partially gasified by the time it reaches the pump inlet, having absorbed regen-cooling heat from the nozzle and chamber walls. Pump bearings ride on the propellant itself — no separate lube system.",
      position: [-1.4, 2.15, 0],
      geometry: "cylinder",
      args: [0.36, 0.36, 0.5, 32],
      color: "#c2a878",
      metalness: 0.9,
      roughness: 0.25,
      hotspot: { x: 0.4000, y: 0.1800 },
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
      hotspot: { x: 0.5000, y: 0.2000 },
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
      hotspot: { x: 0.5000, y: 0.1300 },
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
      hotspot: { x: 0.5000, y: 0.1000 },
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
      hotspot: { x: 0.5000, y: 0.0800 },
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
