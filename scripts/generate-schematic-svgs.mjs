#!/usr/bin/env node
/**
 * Generate stylized SVG schematic diagrams for products that don't have a
 * real reference photo. The schematics are abstract (rectangles + circles +
 * labels arranged spatially) but the hotspot coordinates referenced from
 * apply-hotspots.py / the ProductSpec correspond to anchor positions on
 * these diagrams so the numbered dots line up.
 *
 * Run: node scripts/generate-schematic-svgs.mjs
 * Writes to public/products/photos/<slug>/main.svg
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const OUT_ROOT = resolve(process.cwd(), "public", "products", "photos");

// Common SVG header — 1000×700 viewBox keeps a consistent aspect ratio.
// Background slightly darker than --surface to give the diagram contrast.
const W = 1000;
const H = 700;
const BG = "#0f1117";
const PANEL = "#1a1d24";
const STROKE = "#3a3f48";
const TEXT = "#e5e7eb";
const DIM = "#9ca3af";

function svgHeader(title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="-apple-system, system-ui, sans-serif">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <text x="32" y="40" font-size="20" font-weight="700" fill="${TEXT}">${title}</text>
  ${subtitle ? `<text x="32" y="62" font-size="13" fill="${DIM}">${subtitle}</text>` : ""}
  <line x1="32" y1="78" x2="${W - 32}" y2="78" stroke="${STROKE}" stroke-width="1"/>`;
}

function svgFooter(credit) {
  return `${credit ? `<text x="${W - 32}" y="${H - 12}" text-anchor="end" font-size="10" fill="${DIM}">${credit}</text>` : ""}
</svg>`;
}

function block({ x, y, w, h, color, label, sub }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.5"/>
    <text x="${cx}" y="${cy - (sub ? 8 : -4)}" text-anchor="middle" font-size="14" font-weight="600" fill="${TEXT}">${label}</text>
    ${sub ? `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="11" fill="${DIM}">${sub}</text>` : ""}
  </g>`;
}

function circle({ cx, cy, r, color, label, sub }) {
  return `
  <g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="1.5"/>
    <text x="${cx}" y="${cy + (sub ? -4 : 4)}" text-anchor="middle" font-size="13" font-weight="600" fill="${TEXT}">${label}</text>
    ${sub ? `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="${DIM}">${sub}</text>` : ""}
  </g>`;
}

function write(slug, content) {
  const path = resolve(OUT_ROOT, slug, "main.svg");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
  console.log("wrote", path);
}

// ────────────────────────────────────────────────────────────────────
// NVIDIA Blackwell B200 GPU package — 2 GPU dies + 8 HBM stacks on
// CoWoS-L interposer with NVLink-C2C between the dies.
// ────────────────────────────────────────────────────────────────────
write("nvda-blackwell", `${svgHeader("NVIDIA Blackwell B200", "2× GPU die · 8× HBM3E stack · CoWoS-L interposer")}
  ${block({ x: 80, y: 130, w: 840, h: 480, color: "#374151", label: "", sub: "" })}
  <text x="100" y="155" font-size="11" fill="${DIM}">Silicon interposer (CoWoS-L)</text>

  ${block({ x: 360, y: 250, w: 130, h: 240, color: "#76b900", label: "GPU die 1", sub: "104B transistors" })}
  ${block({ x: 510, y: 250, w: 130, h: 240, color: "#76b900", label: "GPU die 2", sub: "104B transistors" })}
  <line x1="490" y1="370" x2="510" y2="370" stroke="#fbbf24" stroke-width="3"/>
  <text x="500" y="395" text-anchor="middle" font-size="10" fill="#fbbf24">NVLink-C2C 10 TB/s</text>

  ${block({ x: 180, y: 200, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 1", sub: "192 GB total" })}
  ${block({ x: 180, y: 270, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 2", sub: "" })}
  ${block({ x: 180, y: 340, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 3", sub: "" })}
  ${block({ x: 180, y: 410, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 4", sub: "" })}

  ${block({ x: 670, y: 200, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 5", sub: "" })}
  ${block({ x: 670, y: 270, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 6", sub: "" })}
  ${block({ x: 670, y: 340, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 7", sub: "" })}
  ${block({ x: 670, y: 410, w: 150, h: 60, color: "#06b6d4", label: "HBM3E 8", sub: "" })}

  ${block({ x: 360, y: 510, w: 280, h: 55, color: "#a855f7", label: "PCIe 6.0 / 1.8 TB/s I/O", sub: "" })}
  ${block({ x: 80, y: 510, w: 270, h: 55, color: "#ef4444", label: "Power delivery", sub: "~1200 W TGP" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// HBM3E memory stack — 12-Hi die stack on logic base die
// ────────────────────────────────────────────────────────────────────
write("hbm3e", `${svgHeader("HBM3E 12-Hi stack", "12 DRAM dies + base die + TSV interconnect")}
  ${block({ x: 350, y: 110, w: 300, h: 38, color: "#06b6d4", label: "DRAM die 12 (top)", sub: "" })}
  ${block({ x: 350, y: 152, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 11", sub: "" })}
  ${block({ x: 350, y: 188, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 10", sub: "" })}
  ${block({ x: 350, y: 224, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 9", sub: "" })}
  ${block({ x: 350, y: 260, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 8", sub: "" })}
  ${block({ x: 350, y: 296, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 7", sub: "" })}
  ${block({ x: 350, y: 332, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 6", sub: "" })}
  ${block({ x: 350, y: 368, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 5", sub: "" })}
  ${block({ x: 350, y: 404, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 4", sub: "" })}
  ${block({ x: 350, y: 440, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 3", sub: "" })}
  ${block({ x: 350, y: 476, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 2", sub: "" })}
  ${block({ x: 350, y: 512, w: 300, h: 32, color: "#06b6d4", label: "DRAM die 1 (bottom)", sub: "" })}
  ${block({ x: 350, y: 548, w: 300, h: 45, color: "#a855f7", label: "Logic base die", sub: "1024-bit interface" })}
  <text x="50" y="320" font-size="11" fill="#fbbf24" transform="rotate(-90 50 320)">TSV through-silicon vias</text>
  <line x1="80" y1="120" x2="80" y2="580" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3"/>
  <line x1="940" y1="120" x2="940" y2="580" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,3"/>
  <text x="950" y="320" font-size="11" fill="#fbbf24" transform="rotate(90 950 320)">TSV through-silicon vias</text>
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// ASML EUV scanner (TWINSCAN EXE:5000 High-NA)
// ────────────────────────────────────────────────────────────────────
write("asml-euv", `${svgHeader("ASML TWINSCAN EXE:5000 (High-NA EUV)", "0.55 NA · 13.5 nm wavelength · ~$380M per system")}
  ${block({ x: 60, y: 150, w: 180, h: 100, color: "#ef4444", label: "CO₂ laser source", sub: "Cymer LPP" })}
  ${block({ x: 280, y: 150, w: 160, h: 100, color: "#fbbf24", label: "Tin droplet plasma", sub: "50,000/sec" })}
  ${block({ x: 480, y: 150, w: 160, h: 100, color: "#06b6d4", label: "Collector mirror", sub: "Mo/Si multilayer" })}

  ${block({ x: 680, y: 100, w: 260, h: 200, color: "#a855f7", label: "Illumination + projection", sub: "Zeiss SMT mirrors" })}

  ${block({ x: 280, y: 380, w: 250, h: 110, color: "#22c55e", label: "Reticle stage", sub: "EUV mask" })}
  ${block({ x: 570, y: 380, w: 320, h: 200, color: "#0066cc", label: "Wafer stage", sub: "300 mm wafer · dual-stage" })}

  <line x1="240" y1="200" x2="280" y2="200" stroke="${STROKE}" stroke-width="2"/>
  <line x1="440" y1="200" x2="480" y2="200" stroke="${STROKE}" stroke-width="2"/>
  <line x1="640" y1="200" x2="680" y2="200" stroke="${STROKE}" stroke-width="2"/>
  <line x1="810" y1="300" x2="810" y2="380" stroke="${STROKE}" stroke-width="2" stroke-dasharray="4,4"/>
  <text x="820" y="350" font-size="10" fill="${DIM}">EUV beam path</text>

  ${block({ x: 60, y: 380, w: 180, h: 200, color: "#9ca3af", label: "Vacuum chamber + frame", sub: "EUV requires vacuum" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// TSMC CoWoS-L packaging
// ────────────────────────────────────────────────────────────────────
write("tsmc-cowos", `${svgHeader("TSMC CoWoS-L advanced packaging", "Chiplets + HBM + LSI bridges on RDL fan-out interposer")}
  ${block({ x: 80, y: 540, w: 840, h: 60, color: "#9ca3af", label: "Organic substrate", sub: "" })}
  ${block({ x: 100, y: 460, w: 800, h: 60, color: "#a855f7", label: "RDL fan-out (redistribution layer)", sub: "" })}
  ${block({ x: 140, y: 380, w: 720, h: 60, color: "#06b6d4", label: "Local Si Interconnect (LSI) bridges", sub: "" })}

  ${block({ x: 180, y: 240, w: 140, h: 120, color: "#06b6d4", label: "HBM3E", sub: "stack" })}
  ${block({ x: 360, y: 200, w: 130, h: 160, color: "#76b900", label: "GPU die 1", sub: "N4P / N3" })}
  ${block({ x: 510, y: 200, w: 130, h: 160, color: "#76b900", label: "GPU die 2", sub: "N4P / N3" })}
  ${block({ x: 680, y: 240, w: 140, h: 120, color: "#06b6d4", label: "HBM3E", sub: "stack" })}

  ${block({ x: 80, y: 100, w: 840, h: 80, color: "#fbbf24", label: "Heat spreader / lid", sub: "TIM2 thermal interface" })}

  <text x="100" y="200" font-size="10" fill="${DIM}">Bumps (µ-bump 25 µm pitch)</text>
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// Hyundai IONIQ 5 — E-GMP platform side view
// ────────────────────────────────────────────────────────────────────
write("hyundai-ioniq5", `${svgHeader("Hyundai IONIQ 5 (E-GMP)", "800 V architecture · 77 kWh pack · dual motor AWD")}
  <path d="M 100 380 Q 100 280 250 250 L 500 220 Q 700 220 800 280 L 880 320 L 900 380 L 900 420 L 100 420 Z" fill="#1e293b" stroke="#475569" stroke-width="2"/>
  <path d="M 250 250 L 350 250 L 380 220 L 350 220 Z" fill="#475569" stroke="#374151"/>
  <text x="500" y="290" text-anchor="middle" font-size="14" font-weight="600" fill="${TEXT}">IONIQ 5 silhouette</text>

  ${circle({ cx: 210, cy: 430, r: 38, color: "#374151", label: "Front", sub: "wheel" })}
  ${circle({ cx: 790, cy: 430, r: 38, color: "#374151", label: "Rear", sub: "wheel" })}

  ${block({ x: 280, y: 460, w: 440, h: 50, color: "#0066cc", label: "77 kWh battery pack — E-GMP skateboard", sub: "" })}
  ${block({ x: 150, y: 300, w: 110, h: 50, color: "#22c55e", label: "Front motor", sub: "100 kW" })}
  ${block({ x: 720, y: 300, w: 130, h: 50, color: "#22c55e", label: "Rear motor", sub: "165 kW" })}
  ${block({ x: 400, y: 130, w: 200, h: 60, color: "#a855f7", label: "ADAS sensor stack", sub: "front + side LiDAR/radar" })}
  ${block({ x: 280, y: 540, w: 440, h: 35, color: "#fbbf24", label: "350 kW DC fast charge inlet", sub: "" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// Boston Dynamics Atlas humanoid
// ────────────────────────────────────────────────────────────────────
write("boston-dynamics-atlas", `${svgHeader("Boston Dynamics Atlas", "Fully electric humanoid · 28 hydraulic-to-electric DOF")}
  ${circle({ cx: 500, cy: 130, r: 45, color: "#a855f7", label: "Head", sub: "stereo camera" })}

  ${block({ x: 430, y: 180, w: 140, h: 120, color: "#06b6d4", label: "Torso", sub: "battery + compute" })}

  ${circle({ cx: 360, cy: 220, r: 28, color: "#22c55e", label: "L sho", sub: "" })}
  ${circle({ cx: 640, cy: 220, r: 28, color: "#22c55e", label: "R sho", sub: "" })}

  ${block({ x: 320, y: 248, w: 50, h: 130, color: "#22c55e", label: "L arm", sub: "" })}
  ${block({ x: 630, y: 248, w: 50, h: 130, color: "#22c55e", label: "R arm", sub: "" })}

  ${circle({ cx: 345, cy: 410, r: 22, color: "#fbbf24", label: "L hand", sub: "" })}
  ${circle({ cx: 655, cy: 410, r: 22, color: "#fbbf24", label: "R hand", sub: "" })}

  ${block({ x: 450, y: 300, w: 100, h: 60, color: "#06b6d4", label: "Pelvis", sub: "central CoG" })}

  ${block({ x: 440, y: 370, w: 50, h: 180, color: "#ef4444", label: "L leg", sub: "knee + ankle" })}
  ${block({ x: 510, y: 370, w: 50, h: 180, color: "#ef4444", label: "R leg", sub: "knee + ankle" })}

  ${block({ x: 425, y: 555, w: 80, h: 25, color: "#9ca3af", label: "L foot", sub: "" })}
  ${block({ x: 495, y: 555, w: 80, h: 25, color: "#9ca3af", label: "R foot", sub: "" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// LGES Ultium pouch cell
// ────────────────────────────────────────────────────────────────────
write("lges-ultium", `${svgHeader("LGES Ultium pouch cell (NCM 9.5)", "GM Ultium platform · ~100 Ah · 7.5 mm thick · stacked electrode")}
  ${block({ x: 80, y: 140, w: 840, h: 460, color: "#374151", label: "", sub: "" })}

  ${block({ x: 120, y: 180, w: 760, h: 40, color: "#fbbf24", label: "Positive tab (Al)", sub: "" })}

  ${block({ x: 120, y: 240, w: 760, h: 50, color: "#ef4444", label: "Cathode — Ni 90% / Co 5% / Mn 5%", sub: "" })}
  ${block({ x: 120, y: 300, w: 760, h: 30, color: "#a855f7", label: "Ceramic-coated separator", sub: "" })}
  ${block({ x: 120, y: 340, w: 760, h: 50, color: "#06b6d4", label: "Anode — graphite + Si-O composite", sub: "" })}
  ${block({ x: 120, y: 400, w: 760, h: 50, color: "#ef4444", label: "Cathode (next layer, 50+ stacks)", sub: "" })}

  ${block({ x: 120, y: 480, w: 760, h: 40, color: "#9ca3af", label: "Negative tab (Cu)", sub: "" })}

  ${block({ x: 120, y: 540, w: 760, h: 50, color: "#22c55e", label: "Aluminum pouch laminate + electrolyte", sub: "" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// BYD Blade battery (LFP, cell-to-pack)
// ────────────────────────────────────────────────────────────────────
write("byd-blade", `${svgHeader("BYD Blade battery", "LFP cell-to-pack · ~960 mm × 90 mm × 13 mm per blade")}
  ${block({ x: 80, y: 130, w: 840, h: 470, color: "#374151", label: "Pack tray (cell-to-pack, no module)", sub: "" })}
  ${Array.from({ length: 9 }).map((_, i) => block({
    x: 110,
    y: 170 + i * 45,
    w: 780,
    h: 35,
    color: i % 2 ? "#22c55e" : "#a855f7",
    label: `Blade cell ${i + 1} — LiFePO₄`,
    sub: ""
  })).join("")}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// Hanwha K9 self-propelled howitzer
// ────────────────────────────────────────────────────────────────────
write("hanwha-k9", `${svgHeader("Hanwha K9 Thunder self-propelled howitzer", "155 mm / L52 · 1,000 hp diesel · MTU MT 881")}
  <rect x="160" y="350" width="680" height="120" rx="8" fill="#374151" stroke="#475569" stroke-width="2"/>
  <text x="500" y="420" text-anchor="middle" font-size="13" fill="${TEXT}">Hull / chassis</text>

  ${circle({ cx: 230, cy: 510, r: 28, color: "#1e293b", label: "Track 1", sub: "" })}
  ${circle({ cx: 320, cy: 510, r: 28, color: "#1e293b", label: "Track 2", sub: "" })}
  ${circle({ cx: 410, cy: 510, r: 28, color: "#1e293b", label: "Track 3", sub: "" })}
  ${circle({ cx: 500, cy: 510, r: 28, color: "#1e293b", label: "Track 4", sub: "" })}
  ${circle({ cx: 590, cy: 510, r: 28, color: "#1e293b", label: "Track 5", sub: "" })}
  ${circle({ cx: 680, cy: 510, r: 28, color: "#1e293b", label: "Track 6", sub: "" })}
  ${circle({ cx: 770, cy: 510, r: 28, color: "#1e293b", label: "Track 7", sub: "" })}

  ${block({ x: 240, y: 240, w: 380, h: 100, color: "#fbbf24", label: "Turret + autoloader", sub: "burst 3 rounds / 15s" })}
  ${block({ x: 620, y: 250, w: 340, h: 30, color: "#ef4444", label: "155 mm L52 main gun (40 km range)", sub: "" })}
  ${block({ x: 200, y: 360, w: 110, h: 100, color: "#06b6d4", label: "Driver", sub: "compartment" })}
  ${block({ x: 700, y: 360, w: 130, h: 100, color: "#22c55e", label: "Powerpack", sub: "MT 881 1000 hp" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// Rocket Lab Neutron
// ────────────────────────────────────────────────────────────────────
write("rklb-neutron", `${svgHeader("Rocket Lab Neutron", "Medium-lift reusable · 13 tonnes to LEO · Archimedes engines")}
  ${block({ x: 410, y: 80, w: 180, h: 60, color: "#a855f7", label: "Payload fairing", sub: "Hungry Hippo (stays attached)" })}
  ${block({ x: 410, y: 145, w: 180, h: 60, color: "#06b6d4", label: "2nd stage", sub: "1× Archimedes vacuum" })}
  ${block({ x: 380, y: 210, w: 240, h: 290, color: "#374151", label: "1st stage tank", sub: "methalox · carbon composite" })}
  ${block({ x: 410, y: 510, w: 180, h: 50, color: "#22c55e", label: "Interstage / propellant feed", sub: "" })}
  ${block({ x: 360, y: 565, w: 280, h: 55, color: "#ef4444", label: "7× Archimedes engines", sub: "165 tf liftoff thrust" })}
  ${block({ x: 280, y: 540, w: 60, h: 60, color: "#fbbf24", label: "Fin 1", sub: "" })}
  ${block({ x: 660, y: 540, w: 60, h: 60, color: "#fbbf24", label: "Fin 2", sub: "" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// IonQ Tempo trapped-ion quantum computer
// ────────────────────────────────────────────────────────────────────
write("ionq-tempo", `${svgHeader("IonQ Tempo (trapped-ion quantum)", "64 algorithmic qubits target · 99.97% 2-qubit gate fidelity")}
  ${block({ x: 60, y: 130, w: 280, h: 380, color: "#374151", label: "Vacuum chamber", sub: "10⁻¹¹ Torr" })}
  ${Array.from({ length: 8 }).map((_, i) => circle({
    cx: 110 + i * 28,
    cy: 320,
    r: 9,
    color: "#fbbf24",
    label: "",
    sub: ""
  })).join("")}
  <text x="200" y="280" text-anchor="middle" font-size="11" fill="${DIM}">¹⁷¹Yb⁺ ion chain (qubit register)</text>

  ${block({ x: 60, y: 530, w: 280, h: 50, color: "#a855f7", label: "Surface ion trap (Sandia)", sub: "" })}

  ${block({ x: 380, y: 130, w: 220, h: 130, color: "#ef4444", label: "Doppler cooling lasers", sub: "369.5 nm / 935 nm" })}
  ${block({ x: 380, y: 280, w: 220, h: 130, color: "#22c55e", label: "Gate lasers", sub: "Raman π/2 pulse" })}
  ${block({ x: 380, y: 430, w: 220, h: 80, color: "#06b6d4", label: "Readout PMT array", sub: "fluorescence detection" })}

  ${block({ x: 640, y: 130, w: 290, h: 200, color: "#0066cc", label: "Classical control system", sub: "FPGA pulse sequencer + DAC" })}
  ${block({ x: 640, y: 350, w: 290, h: 80, color: "#a855f7", label: "Cryocooler", sub: "He liquefier" })}
  ${block({ x: 640, y: 450, w: 290, h: 80, color: "#fbbf24", label: "Cloud API gateway", sub: "AWS Braket / Azure / GCP" })}
${svgFooter("Schematic — gigascope.xyz")}`);

// ────────────────────────────────────────────────────────────────────
// Oklo Aurora micro-reactor
// ────────────────────────────────────────────────────────────────────
write("oklo-aurora", `${svgHeader("Oklo Aurora micro-reactor", "Liquid-metal-cooled fast spectrum · 15-50 MWe per unit · HALEU fuel")}
  ${block({ x: 350, y: 110, w: 300, h: 50, color: "#22c55e", label: "Roof / A-frame structure", sub: "site-built shelter" })}

  ${block({ x: 380, y: 170, w: 240, h: 220, color: "#374151", label: "Reactor vessel", sub: "" })}
  ${circle({ cx: 500, cy: 270, r: 60, color: "#ef4444", label: "Core", sub: "HALEU 19.75%" })}
  ${block({ x: 400, y: 350, w: 200, h: 20, color: "#fbbf24", label: "Control rods", sub: "" })}

  ${block({ x: 200, y: 400, w: 600, h: 50, color: "#06b6d4", label: "Liquid-metal primary loop (Na or Pb)", sub: "" })}
  ${block({ x: 200, y: 460, w: 280, h: 60, color: "#a855f7", label: "Steam generator", sub: "secondary loop" })}
  ${block({ x: 520, y: 460, w: 280, h: 60, color: "#0066cc", label: "Turbine + generator", sub: "Brayton or Rankine" })}
  ${block({ x: 350, y: 540, w: 300, h: 50, color: "#9ca3af", label: "Grid interconnect", sub: "to data center PPA" })}
${svgFooter("Schematic — gigascope.xyz")}`);

console.log("\nAll schematics generated.");
