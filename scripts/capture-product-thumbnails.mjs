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

    // Locate the viewer canvas so we can poke it.
    const viewerHandle = await page.evaluateHandle(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("Cutaway"),
      );
      return btn?.closest("div.relative");
    });

    // r3f's frameloop sometimes stays idle until input arrives in dev mode.
    // Wiggle the mouse over the canvas to force OrbitControls + r3f invalidate.
    const box = await viewerHandle.evaluate((el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    });
    if (box) {
      await page.mouse.move(box.x - 40, box.y - 30);
      await page.mouse.move(box.x + 40, box.y + 30, { steps: 8 });
      await page.mouse.move(box.x, box.y, { steps: 4 });
    }

    // Wait until the canvas actually contains non-white pixels — that's our
    // proof that r3f has drawn at least one real frame.
    await page.waitForFunction(
      () => {
        const btn = Array.from(document.querySelectorAll("button")).find((b) =>
          (b.textContent || "").includes("Cutaway"),
        );
        const c = btn?.closest("div.relative")?.querySelector("canvas");
        if (!c) return false;
        const gl = c.getContext("webgl2") || c.getContext("webgl");
        if (!gl) return false;
        // Sample center pixel from the framebuffer.
        const px = new Uint8Array(4);
        gl.readPixels(c.width / 2 | 0, c.height / 2 | 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        // Reject white/black/transparent; require *some* color.
        const [r, g, b, a] = px;
        if (a < 8) return false;
        if (r > 240 && g > 240 && b > 240) return false;
        if (r < 16 && g < 16 && b < 16) return false;
        return true;
      },
      { timeout: 15000 },
    ).catch(() => {
      // Don't fail hard — capture whatever's there. Caller will see the size hint.
    });

    // Final settle.
    await page.waitForTimeout(800);

    // Pull pixels straight from the WebGL framebuffer via toDataURL — Playwright's
    // compositor-mediated page.screenshot frequently captures a white frame even
    // when the canvas has real content (Chromium DevTools quirk). The framebuffer
    // is preserved because Product3DViewer sets gl={{ preserveDrawingBuffer: true }}.
    const dataUrl = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        (b.textContent || "").includes("Cutaway"),
      );
      const c = btn?.closest("div.relative")?.querySelector("canvas");
      if (!c) return null;
      return c.toDataURL("image/jpeg", 0.88);
    });
    if (!dataUrl || !dataUrl.startsWith("data:image/jpeg")) {
      throw new Error("canvas.toDataURL returned empty");
    }
    const buf = Buffer.from(dataUrl.split(",")[1], "base64");

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
