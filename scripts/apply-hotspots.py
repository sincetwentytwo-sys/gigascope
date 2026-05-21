"""Apply manually-tuned hotspot dots to each product's .ts file.

After SAM-derived centroids ended up clustered at the photo center for
several products, every coord here was eyeballed against the actual
reference photo and verified against the part it claims to mark.

Operations:
  1. Strip every existing `hotspot: { ... },` line from each .ts.
  2. Insert a fresh hotspot block inside each listed part's literal.
"""
from __future__ import annotations
import os, re

DIR = "G:/claude/gigascope/src/data/products"

# Each entry: { part_id: (x_norm, y_norm) } in 0..1 image coords.
# Parts that aren't visible in the reference photo are simply omitted.
HOTSPOTS: dict[str, dict[str, tuple[float, float]]] = {
    # Front-3/4 left view; long axis runs from upper-left (front) to lower-right
    "cybertruck": {
        "exoskeleton":    (0.55, 0.46),  # central side panel
        "front-wedge":    (0.18, 0.36),  # sloped hood/wedge
        "windshield":     (0.43, 0.30),  # angled dark glass
        "bed":            (0.85, 0.45),  # rear vault — side wall of cargo box
        "tonneau":        (0.83, 0.32),  # cover top edge (above the bed)
        "lightbar-front": (0.13, 0.49),  # thin LED strip on nose
        "wheel-fl":       (0.30, 0.74),  # near (front) wheel
        "wheel-rl":       (0.80, 0.74),  # far (rear) wheel
        "door-l":         (0.45, 0.42),  # driver door area
    },
    # Front-3/4 right view; sedan, long axis upper-left to lower-right
    "model-3": {
        "body":           (0.45, 0.55),
        "hood":           (0.78, 0.50),
        "roof-glass":     (0.42, 0.17),
        "windshield":     (0.55, 0.30),
        "front-bumper":   (0.92, 0.55),
        "wheel-fl":       (0.65, 0.75),  # near (front) wheel — nudged down onto the hub
        "wheel-rl":       (0.18, 0.75),  # far (rear) wheel — nudged down onto the hub
        "trunk":          (0.08, 0.42),
    },
    # Front-3/4 right view; SUV
    "model-y": {
        "body-shell":     (0.50, 0.50),
        "hood":           (0.78, 0.42),
        "glass-roof":     (0.45, 0.16),
        "front-lightbar": (0.83, 0.40),
        "wheel-fl":       (0.65, 0.70),
        "wheel-rl":       (0.20, 0.65),
        "front-fascia":   (0.92, 0.58),
    },
    # White Tesla SUV (Wikipedia 'Cybercab' page shows a Model Y in this image)
    "cybercab": {
        "body-shell":     (0.45, 0.55),
        "hood":           (0.78, 0.42),
        "headlight-bar": (0.83, 0.40),
        "wheel-fr":       (0.70, 0.70),
        "wheel-rr":       (0.18, 0.65),
        "door-l":         (0.42, 0.45),
    },
    # Front view, robot centered, 0.56:1 portrait
    "optimus": {
        "head":           (0.45, 0.13),
        "face-plate":     (0.45, 0.14),
        "neck":           (0.45, 0.18),
        "torso":          (0.45, 0.27),
        "battery-pack":   (0.45, 0.30),
        "shoulder-l":     (0.35, 0.22),
        "shoulder-r":     (0.55, 0.22),
        "upper-arm-l":    (0.33, 0.29),
        "upper-arm-r":    (0.57, 0.29),
        "elbow-l":        (0.32, 0.36),
        "elbow-r":        (0.58, 0.36),
        "forearm-l":      (0.32, 0.40),
        "forearm-r":      (0.58, 0.40),
        "hand-l":         (0.32, 0.46),
        "hand-r":         (0.58, 0.46),
        "pelvis":         (0.45, 0.35),
        "thigh-l":        (0.42, 0.48),
        "thigh-r":        (0.48, 0.48),
        "knee-l":         (0.42, 0.56),
        "knee-r":         (0.48, 0.56),
        "shin-l":         (0.42, 0.65),
        "shin-r":         (0.48, 0.65),
        "foot-l":         (0.42, 0.75),
        "foot-r":         (0.48, 0.75),
    },
    # Vertical Raptor 2 engine on a tripod at Hawthorne, 0.56:1 portrait
    "raptor": {
        "nozzle":         (0.45, 0.78),
        "regen-channels": (0.45, 0.66),
        "throat":         (0.50, 0.55),
        "chamber":        (0.50, 0.45),
        "injector":       (0.50, 0.40),
        "preburner-ox":   (0.62, 0.28),
        "preburner-fuel": (0.38, 0.28),
        "turbopump-ox":   (0.60, 0.18),
        "turbopump-fuel": (0.40, 0.18),
        "manifold":       (0.50, 0.20),
        "sensors":        (0.50, 0.13),
        "gimbal":         (0.50, 0.10),
        "mount":          (0.50, 0.08),
    },
    # Demo-2 launch — rocket cleared the pad, fairing at top
    "falcon9": {
        "stage1-tank":             (0.59, 0.36),
        "stage1-thrust-structure": (0.57, 0.46),
        "interstage":              (0.60, 0.27),
        "stage2-tank":             (0.61, 0.22),
        "fairing-half-1":          (0.62, 0.12),
    },
    # IFT-5 ignition — full stack on the tower
    "starship": {
        "booster-body":   (0.55, 0.58),
        "ship-body":      (0.58, 0.27),
        "hot-stage-ring": (0.56, 0.42),
    },
    # Solar farm with Megapacks in a row
    "megapack": {
        "shell":          (0.45, 0.55),
        "top-panel":      (0.45, 0.32),
    },
    # Wall-mounted Powerwall 3
    "powerwall": {
        "shell":          (0.50, 0.50),
        "tesla-badge":    (0.50, 0.40),
    },
    # Single V4 stall
    "supercharger-v4": {
        "pillar":         (0.50, 0.55),
        "screen":         (0.50, 0.22),
        "top-status":     (0.50, 0.10),
        "t-logo":         (0.50, 0.17),
        "holster":        (0.55, 0.43),
        "cable":          (0.30, 0.55),
        "connector":      (0.30, 0.68),
        "base":           (0.50, 0.92),
    },
}

SLUG_TO_FILE = {s: f"{s}.ts" for s in HOTSPOTS}


def main():
    for slug, dots in HOTSPOTS.items():
        path = os.path.join(DIR, SLUG_TO_FILE[slug])
        with open(path, "r", encoding="utf-8") as f:
            src = f.read()

        # 1) strip every existing hotspot line
        src = re.sub(
            r'\n\s*hotspot:\s*\{[^}]*\},?',
            "",
            src,
        )

        # 2) insert hotspot into each named part block
        applied = 0
        for part_id, (x, y) in dots.items():
            pattern = re.compile(
                r'(\{\s*\n\s*id:\s*"' + re.escape(part_id) + r'",[\s\S]*?)(\n\s*\},)',
            )
            insert = f"\n      hotspot: {{ x: {x:.4f}, y: {y:.4f} }},"
            new_src, n = pattern.subn(r'\1' + insert + r'\2', src, count=1)
            if n == 1:
                src = new_src
                applied += 1
            else:
                print(f"  ! {slug}: part_id '{part_id}' not found")

        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"  {slug}: {applied}/{len(dots)} hotspots applied")


if __name__ == "__main__":
    main()
