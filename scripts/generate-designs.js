import { stitch } from "@google/stitch-sdk";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const DESIGNS_DIR = "designs";

const screens = [
  {
    name: "hero",
    prompt: `Design a stunning hero section for "GIGASCOPE" — a Tesla factory construction tracking dashboard.

Style: Futuristic sci-fi meets Tesla's minimal aesthetic. Think SpaceX mission control + Apple product page.

Layout:
- Full viewport height hero
- Large bold title "GIGASCOPE" with a subtle gradient (cyan to white)
- Subtitle: "Satellite-powered factory intelligence"
- A glowing orbital ring animation around a central element (like a radar scope)
- Floating data chips showing: "8 FACTORIES" "4 COUNTRIES" "$56B+ INVESTED" "LIVE TRACKING"
- Dark background (#08090c) with subtle grid lines and a blue atmospheric glow
- Scroll indicator at bottom with animated pulse

Typography: Ultra-modern, clean sans-serif. Large bold headings, monospace for data.
Colors: Primary #00d4ff (cyan), Accent #e63946 (red), Background #08090c, Text #e8ecf4
No images — pure CSS/SVG graphics only.
Make it feel like you're looking at Earth from a satellite command center.`,
    device: "DESKTOP",
  },
  {
    name: "factory-card",
    prompt: `Design a factory status card component for a Tesla Gigafactory tracker called "GIGASCOPE".

Style: Glassmorphism + sci-fi HUD aesthetic. Like a holographic data panel from a space station.

Card layout:
- Semi-transparent dark background with subtle border glow
- Top: Factory name "⚡ TERAFAB" with country flag emoji, location subtitle
- Status badge: "CONSTRUCTION" in amber with a subtle pulse animation
- Progress bar: thin line with gradient fill and percentage "5%"
- Three data points in monospace: Area "TBD" | Capacity "1 TW" | Investment "$20-25B"
- Bottom: Product tags as small pills: "AI5 CHIP" "2NM PROCESS"
- Hover state: border glows cyan, card lifts slightly
- A "NEW" indicator with animated glow for featured items

Grid context: This card sits in a 4-column grid on dark background.
Colors: Cyan #00d4ff, Pink #ff006e, Dark #0f1117, Border rgba(255,255,255,0.1)
Typography: Inter for labels, JetBrains Mono for data values.
Make each card feel like a live data feed from mission control.`,
    device: "DESKTOP",
  },
  {
    name: "factory-detail",
    prompt: `Design a factory detail page for "GIGASCOPE" — Tesla factory satellite tracker.

Page for "TERAFAB — Tesla x SpaceX x xAI Chip Fab" in Austin, TX.

Style: Command center dashboard. Dark, technical, but beautiful. SpaceX Starship tracker meets Bloomberg Terminal.

Layout (top to bottom):
1. HEADER BAR: Back arrow, Factory name large "⚡ TERAFAB", status badge "CONSTRUCTION", progress "5%" in large cyan text
2. STATS ROW: 4 glass cards — Area "TBD", Capacity "1 TW compute/yr", Investment "$20-25B", Employees "TBD". Each card has a tiny label above and large monospace value.
3. MAIN AREA (2/3 + 1/3 split):
   - Left: Satellite map placeholder (dark rectangle with grid overlay and a pulsing marker dot)
   - Right: Milestones timeline — vertical list with colored dots (filled=done, hollow=pending), dates in mono, descriptions
4. TIMELINE CHART: Horizontal bar chart showing progress by year (2020-2026), bars in factory color with increasing opacity
5. PRODUCTS: Row of pill-shaped tags

Colors: Factory color #ff006e (pink), Background #08090c, Surface #0f1117
Make it feel like viewing a classified facility from orbit.`,
    device: "DESKTOP",
  },
  {
    name: "compare-page",
    prompt: `Design a satellite imagery comparison page for "GIGASCOPE" — Tesla factory tracker.

Purpose: Before/After satellite view of factory construction sites.

Style: Like Google Earth Pro meets a sci-fi interface. Dark, technical, precise.

Layout:
1. TOP: Dropdown selector "Select Factory" with factory names, styled as a dark glass select
2. MAIN: Full-width satellite comparison viewer
   - Split view with a draggable vertical divider line (bright cyan line with a handle)
   - Left side label: "SENTINEL-2 — 2023 Annual Composite"
   - Right side label: "ESRI — Latest (updated ~3-6 months)"
   - The divider has a circular drag handle in the center with arrows
3. BOTTOM BAR: Factory info strip — name, coordinates, zoom level, tile source indicator
4. Corner overlay: Compass rose / orientation indicator

Colors: Cyan #00d4ff for UI elements, dark backgrounds
Make the divider line glow subtly. The overall feel should be like a military satellite analysis tool but beautifully designed.`,
    device: "DESKTOP",
  },
];

async function main() {
  console.log("🎨 GIGASCOPE — Stitch UI Design Generation\n");

  if (!existsSync(DESIGNS_DIR)) {
    await mkdir(DESIGNS_DIR);
  }

  // Create project
  console.log("📁 Creating Stitch project...");
  const result = await stitch.callTool("create_project", {
    title: "GIGASCOPE UI Designs",
  });

  let projectId = null;
  const resultStr = JSON.stringify(result);
  const match = resultStr.match(/projects\/(\d+)/);
  if (match) projectId = match[1];

  if (!projectId) {
    console.error("❌ Failed to create project:", resultStr.substring(0, 200));
    process.exit(1);
  }
  console.log(`✅ Project: ${projectId}\n`);

  const project = stitch.project(projectId);

  // Generate each screen
  for (const screen of screens) {
    console.log(`🎨 Generating: ${screen.name}...`);
    try {
      const generated = await project.generate(screen.prompt, screen.device);
      console.log(`   Screen ID: ${generated.id}`);

      const htmlUrl = await generated.getHtml();
      const imageUrl = await generated.getImage();

      if (htmlUrl) {
        const resp = await fetch(htmlUrl);
        const html = await resp.text();
        await writeFile(`${DESIGNS_DIR}/${screen.name}.html`, html, "utf-8");
        console.log(`   ✅ HTML saved: ${DESIGNS_DIR}/${screen.name}.html`);
      }

      if (imageUrl) {
        const resp = await fetch(imageUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        await writeFile(`${DESIGNS_DIR}/${screen.name}.png`, buf);
        console.log(`   ✅ Image saved: ${DESIGNS_DIR}/${screen.name}.png`);
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
    console.log();
  }

  console.log("─────────────────────────────────────");
  console.log("🎉 All designs generated!");
  console.log(`📂 Check: ${DESIGNS_DIR}/`);
  console.log(`🔗 Edit in Stitch: https://stitch.withgoogle.com/project/${projectId}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
