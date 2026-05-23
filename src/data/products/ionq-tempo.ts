import type { ProductSpec } from "./index";

export const ionqTempo: ProductSpec = {
  slug: "ionq-tempo",
  name: "IonQ Tempo",
  aka: "Trapped-ion quantum computer",
  category: "quantum",
  description:
    "IonQ's next-generation trapped-ion quantum computer. Targets 64 algorithmic qubits (#AQ). Uses ytterbium-171 ions held in a Sandia-fabricated surface ion trap, manipulated by Doppler-cooling + Raman gate lasers. 99.97% two-qubit gate fidelity demonstrated on prior Forte system. Cloud-accessible via AWS Braket, Microsoft Azure Quantum, and Google Cloud.",
  cameraPosition: [0, 0, 5],
  mainCredit: {
    source: "IonQ press",
    url: "https://www.ionq.com/quantum-systems/tempo",
    license: "Press kit (editorial use)",
  },
  parts: [
    { id: "chamber", name: "Ultra-high vacuum chamber", description: "Vacuum chamber operating at 10⁻¹¹ Torr (a thousand-billionth of atmospheric pressure). Isolates the ions from environmental noise. Maintained by ion + getter pumps.", geometry: "box", args: [0,0,0], color: "#374151", hotspot: { x: 0.20, y: 0.46 } },
    { id: "ion-chain", name: "¹⁷¹Yb⁺ ion chain (qubit register)", description: "Linear chain of ytterbium-171 ions. Each ion is one qubit — the hyperfine ground states |F=0⟩ and |F=1⟩ encode the qubit. Ions are naturally identical (unlike superconducting qubits which require nano-precision fabrication), and have the longest coherence times of any qubit modality.", geometry: "sphere", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.20, y: 0.46 } },
    { id: "ion-trap", name: "Surface ion trap (Sandia-fabricated)", description: "Microfabricated surface ion trap. Electrodes patterned on a chip create the RF + DC fields that levitate the ions ~50 µm above the surface. Sandia National Labs builds these for IonQ — leveraging IC fabrication tooling for quantum hardware.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.20, y: 0.795 } },
    { id: "cooling-lasers", name: "Doppler cooling lasers (369.5 + 935 nm)", description: "Multiple stabilized lasers that Doppler-cool the ions to near absolute zero (~1 mK), removing thermal motion that would dephase the qubits. The 369.5 nm laser is the primary cooling transition.", geometry: "box", args: [0,0,0], color: "#ef4444", hotspot: { x: 0.49, y: 0.275 } },
    { id: "gate-lasers", name: "Gate lasers (Raman π/2 pulse)", description: "Stimulated-Raman lasers perform 1-qubit and 2-qubit gates by inducing transitions in the ion hyperfine levels. Two-qubit gates use the collective vibrational modes of the ion chain as a quantum bus.", geometry: "box", args: [0,0,0], color: "#22c55e", hotspot: { x: 0.49, y: 0.49 } },
    { id: "readout", name: "Readout PMT array", description: "Photomultiplier-tube array detects state-dependent fluorescence — bright = |1⟩, dark = |0⟩. State-preparation-and-measurement (SPAM) fidelity above 99.5%.", geometry: "box", args: [0,0,0], color: "#06b6d4", hotspot: { x: 0.49, y: 0.67 } },
    { id: "control", name: "Classical control system (FPGA)", description: "FPGA-based pulse sequencer + arbitrary-waveform-generator + DAC arrays drive the laser modulators in real time. The control electronics are conventional — the quantum advantage comes from the trapped ions, not the electronics.", geometry: "box", args: [0,0,0], color: "#0066cc", hotspot: { x: 0.785, y: 0.33 } },
    { id: "cryocooler", name: "Cryocooler (He liquefier)", description: "Closed-cycle helium liquefier maintains the trap chamber at cryogenic temperatures — improves coherence further by reducing thermal background radiation.", geometry: "box", args: [0,0,0], color: "#a855f7", hotspot: { x: 0.785, y: 0.555 } },
    { id: "cloud", name: "Cloud API gateway", description: "IonQ exposes the quantum computer via AWS Braket, Microsoft Azure Quantum, and Google Cloud quantum services. Customers submit Qiskit / Cirq circuits and get results back via REST API — no need to operate the hardware locally.", geometry: "box", args: [0,0,0], color: "#fbbf24", hotspot: { x: 0.785, y: 0.70 } },
  ],
  relatedSites: [],
};
