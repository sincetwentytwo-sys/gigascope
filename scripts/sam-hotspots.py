"""SAM-based hotspot polygon generator.

For each product photo, take a list of (part_id, x_norm, y_norm) seed points
and run SAM point-prompt segmentation. The resulting mask is approximated as
a simplified polygon (cv2.approxPolyDP) and written into the corresponding
ProductSpec part as `hotspot: { points: "x,y x,y ..." }`.

The seed point only needs to land *somewhere inside* the visible part —
SAM grows the mask outward. No need to hand-author polygon vertices.

Usage:
    venv-python scripts/sam-hotspots.py cybertruck      # one
    venv-python scripts/sam-hotspots.py                  # everything in SEEDS
"""
from __future__ import annotations
import os, re, sys
import cv2
import numpy as np
import torch
from segment_anything import sam_model_registry, SamPredictor

SAM_CKPT = "G:/ComfyUI_windows_portable/ComfyUI/models/sams/sam_vit_h_4b8939.pth"
PHOTOS = "G:/claude/gigascope/public/products/photos"
PRODUCTS = "G:/claude/gigascope/src/data/products"
SLUG_TO_FILE = {
    "raptor": "raptor.ts", "falcon9": "falcon9.ts", "starship": "starship.ts",
    "4680": "4680.ts", "neuralink-n1": "neuralink-n1.ts", "model-3": "model-3.ts",
    "model-y": "model-y.ts", "cybertruck": "cybertruck.ts", "optimus": "optimus.ts",
    "cybercab": "cybercab.ts", "megapack": "megapack.ts", "powerwall": "powerwall.ts",
    "supercharger-v4": "supercharger-v4.ts",
}

# Seed points per product (x_norm, y_norm in 0..1 — origin top-left).
# Only the parts visible in the reference photo are listed; SAM handles
# the rest of the mask extent given a single point inside the part.
SEEDS = {
    "cybertruck": {  # front-3/4 view, 1600x949, sloped wedge on the left
        "exoskeleton":    (0.55, 0.45),  # central body panel
        "front-wedge":    (0.18, 0.35),  # sloped hood/wedge
        "windshield":     (0.40, 0.22),  # angled dark glass
        "bed":            (0.80, 0.50),  # rear vault behind cab
        "lightbar-front": (0.13, 0.52),  # thin LED strip on nose
        "wheel-fl":       (0.33, 0.78),  # front wheel — black + spokes
        "wheel-rl":       (0.82, 0.78),  # rear wheel
        "door-l":         (0.48, 0.40),  # driver side door
    },
    "raptor": {  # vertical engine, 900x1600
        "nozzle":         (0.50, 0.75),  # big black bell at the bottom
        "throat":         (0.50, 0.46),  # narrow junction above bell
        "chamber":        (0.50, 0.35),  # body between throat and turbopumps
        "preburner-ox":   (0.62, 0.22),  # right cluster
        "preburner-fuel": (0.36, 0.22),  # left cluster
        "mount":          (0.50, 0.10),  # top vehicle interface
        "gimbal":         (0.50, 0.13),  # ring near top mount
    },
    "model-3": {  # front 3/4 view, 1600x1065
        "body":           (0.50, 0.55),
        "hood":           (0.30, 0.50),
        "windshield":     (0.45, 0.40),
        "roof-glass":     (0.55, 0.30),
        "front-bumper":   (0.20, 0.65),
        "wheel-fl":       (0.30, 0.78),
        "wheel-rl":       (0.78, 0.78),
        "trunk":          (0.75, 0.55),
    },
    "model-y": {  # front 3/4, 1600x760
        "body-shell":     (0.50, 0.55),
        "hood":           (0.30, 0.50),
        "glass-roof":     (0.55, 0.30),
        "front-lightbar": (0.20, 0.55),
        "wheel-fl":       (0.30, 0.75),
        "wheel-rl":       (0.78, 0.75),
        "front-fascia":   (0.20, 0.65),
    },
    "cybercab": {  # 1600x912
        "body-shell":     (0.50, 0.50),
        "hood":           (0.25, 0.45),
        "headlight-bar":  (0.18, 0.55),
        "wheel-fl":       (0.28, 0.78),
        "wheel-rl":       (0.78, 0.78),
        "door-l":         (0.45, 0.40),
    },
    "optimus": {  # 900x1600 vertical humanoid
        "head":           (0.50, 0.12),
        "torso":          (0.50, 0.40),
        "arm-l":          (0.30, 0.40),
        "arm-r":          (0.70, 0.40),
        "leg-l":          (0.42, 0.75),
        "leg-r":          (0.58, 0.75),
    },
    "falcon9": {  # 1600x1339 launch photo
        "stage1":         (0.50, 0.60),
        "stage2":         (0.50, 0.35),
        "interstage":     (0.50, 0.50),
        "engines":        (0.50, 0.85),
        "fairing":        (0.50, 0.20),
    },
    "starship": {  # 1600x1495 launch ignition
        "booster":        (0.50, 0.60),
        "ship":           (0.50, 0.25),
        "hot-stage-ring": (0.50, 0.45),
        "engines":        (0.50, 0.85),
    },
    "megapack": {  # 1600x654 wide container
        "enclosure":      (0.50, 0.50),
        "ac-unit":        (0.50, 0.20),
        "service-door":   (0.85, 0.55),
    },
    "powerwall": {  # 1600x1600 wall unit
        "front-cover":    (0.50, 0.50),
        "tesla-logo":     (0.50, 0.30),
    },
    "supercharger-v4": {  # 849x1134
        "pillar":         (0.50, 0.50),
        "display":        (0.50, 0.25),
        "cable":          (0.30, 0.55),
    },
}


def simplify_mask(mask: np.ndarray, w: int, h: int) -> str | None:
    """Convert a boolean mask to a normalized polygon point string."""
    mask_u8 = mask.astype(np.uint8) * 255
    contours, _ = cv2.findContours(mask_u8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None
    cnt = max(contours, key=cv2.contourArea)
    if cv2.contourArea(cnt) < (w * h * 0.001):
        return None  # tiny noise mask
    epsilon = 0.004 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    # cap vertex count to keep DOM/JSON lean
    if len(approx) > 40:
        epsilon = 0.01 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
    return " ".join(f"{p[0][0]/w:.4f},{p[0][1]/h:.4f}" for p in approx)


def update_part(src: str, part_id: str, points: str) -> str:
    """Insert or replace the hotspot field on a part block by id."""
    # Find the matching part block. A part block starts with `id: "<id>",`
    # and ends with the next `\n    },` at the same indent level.
    pattern = re.compile(
        r'(\{\s*\n\s*id: "' + re.escape(part_id) + r'",[\s\S]*?\n\s*\},)',
        re.MULTILINE,
    )
    m = pattern.search(src)
    if not m:
        print(f"    ! part_id '{part_id}' not found")
        return src
    block = m.group(1)
    hotspot_line = f'      hotspot: {{ points: "{points}" }},\n'
    # Remove existing hotspot line if present
    new_block = re.sub(r'      hotspot: \{[^}]*\},\n', "", block)
    # Insert hotspot before the closing `},`
    new_block = re.sub(r'(\n\s*\},)$', "\n" + hotspot_line.rstrip("\n") + r"\1", new_block)
    return src.replace(block, new_block, 1)


def main():
    targets = sys.argv[1:] or list(SEEDS.keys())
    targets = [t for t in targets if t in SEEDS]
    if not targets:
        print("no matching slug"); sys.exit(1)

    print("Loading SAM ViT-H...")
    sam = sam_model_registry["vit_h"](checkpoint=SAM_CKPT)
    sam.to("cuda")
    predictor = SamPredictor(sam)

    for slug in targets:
        path = f"{PHOTOS}/{slug}.jpg"
        if not os.path.exists(path):
            print(f"  {slug}: photo missing"); continue
        img_bgr = cv2.imread(path)
        img = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        h, w = img.shape[:2]
        predictor.set_image(img)
        print(f"\n[{slug}] {w}x{h}")

        seeds = SEEDS[slug]
        polys: dict[str, str] = {}
        for part_id, (xn, yn) in seeds.items():
            px, py = int(xn * w), int(yn * h)
            masks, scores, _ = predictor.predict(
                point_coords=np.array([[px, py]]),
                point_labels=np.array([1]),
                multimask_output=True,
            )
            # Pick the highest-scoring mask whose bbox contains the seed point
            # and isn't almost-the-whole-image (which usually means SAM grabbed
            # the background).
            best_idx, best_score = -1, -1.0
            for i, mask in enumerate(masks):
                area = mask.sum()
                if area < (w * h * 0.001) or area > (w * h * 0.85):
                    continue
                if scores[i] > best_score:
                    best_score = scores[i]; best_idx = i
            if best_idx < 0:
                print(f"    ! {part_id}: no usable mask")
                continue
            poly = simplify_mask(masks[best_idx], w, h)
            if poly:
                polys[part_id] = poly
                v = len(poly.split()) // 2
                print(f"    OK {part_id}  ({v} pts, score={scores[best_idx]:.2f})")
            else:
                print(f"    ! {part_id}: empty polygon")

        if not polys:
            continue

        # Update the TS file
        fpath = f"{PRODUCTS}/{SLUG_TO_FILE[slug]}"
        with open(fpath, "r", encoding="utf-8") as f:
            src = f.read()
        for part_id, points in polys.items():
            src = update_part(src, part_id, points)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"  -> wrote {len(polys)} hotspots to {SLUG_TO_FILE[slug]}")


if __name__ == "__main__":
    main()
