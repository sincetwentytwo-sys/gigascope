// Approximates bounding box of each product from its part positions + args.
// Run: node scripts/analyze-product-bounds.mjs
import fs from "node:fs";
import path from "node:path";

const dir = "src/data/products";
const slugs = [
  "model-3",
  "model-y",
  "cybertruck",
  "optimus",
  "cybercab",
  "megapack",
  "powerwall",
  "supercharger-v4",
];

function extentFromArgs(geometry, args) {
  // returns approx half-extents [hx, hy, hz] in object local frame (before rotation)
  if (!args) return [1, 1, 1];
  switch (geometry) {
    case "box":
      return [args[0] / 2, args[1] / 2, args[2] / 2];
    case "sphere":
      return [args[0], args[0], args[0]];
    case "cylinder": {
      // [radiusTop, radiusBottom, height]
      const r = Math.max(args[0], args[1]);
      return [r, args[2] / 2, r];
    }
    case "cone": {
      // [radius, height]
      return [args[0], args[1] / 2, args[0]];
    }
    case "torus": {
      // [radius, tube]
      const R = args[0] + args[1];
      return [R, args[1], R];
    }
    default:
      return [1, 1, 1];
  }
}

for (const slug of slugs) {
  const file = path.join(dir, slug + ".ts");
  const src = fs.readFileSync(file, "utf8");
  // crude part extractor — relies on the consistent shape of these files
  const partRe = /position:\s*\[([-\d.,\s]+)\][\s\S]*?geometry:\s*"([a-z]+)"[\s\S]*?args:\s*\[([-\d.,\s]+)\]/g;
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  let count = 0;
  let m;
  while ((m = partRe.exec(src))) {
    const pos = m[1].split(",").map((s) => parseFloat(s.trim()));
    const geo = m[2];
    const args = m[3].split(",").map((s) => parseFloat(s.trim()));
    const half = extentFromArgs(geo, args);
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], pos[i] - half[i]);
      max[i] = Math.max(max[i], pos[i] + half[i]);
    }
    count++;
  }
  const size = max.map((v, i) => v - min[i]);
  const center = max.map((v, i) => (v + min[i]) / 2);
  const radius = Math.sqrt(size.reduce((a, s) => a + (s / 2) ** 2, 0));
  // Camera distance so the model fits at fov 42, with 25% padding.
  const fov = 42;
  const dist = (radius * 1.25) / Math.tan((fov / 2) * Math.PI / 180);
  // Suggest position offset (right, up, forward) keeping ratio similar to current ~ (0.55, 0.45, 0.8) of dist
  const pos = [
    +(dist * 0.55).toFixed(2),
    +(dist * 0.45).toFixed(2),
    +(dist * 0.80).toFixed(2),
  ];
  const tgt = center.map((v) => +v.toFixed(2));
  const minD = +(radius * 0.9).toFixed(2);
  const maxD = +(dist * 3).toFixed(2);
  console.log(
    `${slug.padEnd(18)} parts=${String(count).padStart(3)}  size=[${size.map((s) => s.toFixed(2)).join(", ")}]  center=[${tgt.join(", ")}]  radius=${radius.toFixed(2)}`,
  );
  console.log(
    `  →  cameraPosition: [${pos.join(", ")}],  cameraTarget: [${tgt.join(", ")}],  min=${minD},  max=${maxD}`,
  );
}
