// Captures a thumbnail screenshot of each product's 3D viewer to public/products/<slug>.jpg.
//
// **IMPORTANT — must be run on a desktop with a real GPU, not in CI/headless.**
// react-three-fiber + Three.js clipping planes render as solid black/white under
// Playwright's pure-headless mode (no GPU pipeline). The script therefore launches
// a *headed* browser window for ~1 minute. Run it locally; don't bake it into CI.
//
// Quickstart:
//   1.  npm run dev                              # in one terminal
//   2.  npm run capture:thumbnails               # in another
//      (or)  ONLY_SLUG=cybertruck npm run capture:thumbnails
//      (or)  HEADLESS=1 npm run capture:thumbnails   # blank-canvas debug mode
//
// The script auto-toggles "Cutaway · Off" before capturing — the static
// thumbnail shows the full exterior, while the live viewer defaults to cutaway.

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ONLY = process.env.ONLY_SLUG;
const OUT_DIR = "public/products";

const SLUGS = [
  "raptor",
  "falcon9",
  "starship",
  "4680",
  "neuralink-n1",
  "model-3",
  "model-y",
  "cybertruck",
  "optimus",
  "cybercab",
  "megapack",
  "powerwall",
  "supercharger-v4",
];

const targets = ONLY ? SLUGS.filter((s) => s === ONLY) : SLUGS;
if (targets.length === 0) {
  console.error("No matching slug.");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// Default to headed Chromium — see file header for why.
const browser = await chromium.launch({
  headless: process.env.HEADLESS === "1",
  args: ["--enable-webgl", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

let okCount = 0;
let failCount = 0;

for (const slug of targets) {
  const url = `${BASE}/products/${slug}`;
  process.stdout.write(`→ ${slug.padEnd(18)} `);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Wait for the Cutaway toggle — that's only rendered inside Product3DViewer,
    // so its presence proves the viewer canvas (not the globe background) is mounted.
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("button")).some((b) =>
          (b.textContent || "").includes("Cutaway"),
        ),
      { timeout: 25000 },
    );
    // Turn off cutaway for the thumbnail — clipping planes render fine in browsers
    // but are unreliable in headless SwiftShader. Click "Cutaway · On" to disable.
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("Cutaway · On"),
      );
      if (btn) btn.click();
    });
    // Settle several frames so the WebGL framebuffer holds a real image.
    await page.waitForTimeout(5000);

    // Resolve the viewer container so we can clip the page screenshot to it.
    // Compositor-mediated screenshots tend to capture WebGL pixels reliably
    // even when canvas.toDataURL returns black under headless.
    const box = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("Cutaway"),
      );
      const viewer = btn?.closest("div.relative");
      const c = viewer?.querySelector("canvas");
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    if (!box) throw new Error("viewer canvas not found");

    const buf = await page.screenshot({
      type: "jpeg",
      quality: 86,
      clip: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
    });

    if (buf.length < 4000) {
      throw new Error(`suspiciously small (${buf.length} bytes) — likely blank canvas`);
    }

    fs.writeFileSync(path.join(OUT_DIR, `${slug}.jpg`), buf);
    console.log(`OK  ${(buf.length / 1024).toFixed(0)} KB`);
    okCount++;
  } catch (err) {
    console.log(`FAIL  ${err.message}`);
    failCount++;
  }
}

await browser.close();
console.log(`\nDone. ${okCount} ok, ${failCount} failed.`);
process.exit(failCount > 0 ? 1 : 0);
