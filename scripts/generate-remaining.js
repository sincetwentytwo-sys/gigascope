import { stitch } from "@google/stitch-sdk";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { config } from "dotenv";

config({ path: ".env.local" });

const DESIGNS_DIR = "designs";
const PROJECT_ID = "16248735415247781285";

const screens = [
  {
    name: "factory-card",
    prompt: `Dark glassmorphism card for a factory tracker. Semi-transparent bg, cyan border glow on hover. Shows: flag+name, location, status badge, thin progress bar, 3 monospace data points. Sci-fi HUD style. Colors: cyan #00d4ff, dark #0f1117. Font: Inter + JetBrains Mono.`,
    device: "DESKTOP",
  },
  {
    name: "factory-detail",
    prompt: `Factory detail dashboard page. Dark command-center style. Header with name+progress%. 4 stat cards in a row. Left 2/3: satellite map placeholder with dark bg and grid. Right 1/3: vertical milestone timeline with dots. Below: year-by-year bar chart. Colors: pink #ff006e, dark #08090c. Monospace data.`,
    device: "DESKTOP",
  },
  {
    name: "compare-page",
    prompt: `Satellite imagery comparison page. Dark sci-fi UI. Factory dropdown selector at top. Main area: split view with glowing cyan vertical divider line and circular drag handle. Left label "Sentinel-2 2023", right label "ESRI Latest". Bottom info strip with coordinates. Military satellite analysis aesthetic.`,
    device: "DESKTOP",
  },
];

async function main() {
  if (!existsSync(DESIGNS_DIR)) await mkdir(DESIGNS_DIR);

  const project = stitch.project(PROJECT_ID);

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
        console.log(`   ✅ HTML: ${screen.name}.html`);
      }
      if (imageUrl) {
        const resp = await fetch(imageUrl);
        const buf = Buffer.from(await resp.arrayBuffer());
        await writeFile(`${DESIGNS_DIR}/${screen.name}.png`, buf);
        console.log(`   ✅ Image: ${screen.name}.png`);
      }
    } catch (err) {
      console.error(`   ❌ Failed: ${err.message}`);
    }
    console.log();
  }
  console.log("Done!");
}

main().catch(console.error);
