"""Convert existing polygon hotspots to centroid-point hotspots.

Reads every src/data/products/*.ts file, finds blocks of the form
    hotspot: { points: "x1,y1 x2,y2 ..." },
computes the geometric centroid of each polygon, and rewrites the block as
    hotspot: { x: 0.NNNN, y: 0.NNNN },

Run once; the new tooling never authors `points` again.
"""
from __future__ import annotations
import os, re

DIR = "G:/claude/gigascope/src/data/products"

# polygon centroid via shoelace formula — robust against arbitrary point order
def centroid(points: list[tuple[float, float]]) -> tuple[float, float]:
    n = len(points)
    if n == 0:
        return 0.5, 0.5
    if n < 3:
        # degenerate — just average
        x = sum(p[0] for p in points) / n
        y = sum(p[1] for p in points) / n
        return x, y
    a = 0.0
    cx = 0.0
    cy = 0.0
    for i in range(n):
        x0, y0 = points[i]
        x1, y1 = points[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    a *= 0.5
    if abs(a) < 1e-9:
        # zero-area polygon — fall back to average
        x = sum(p[0] for p in points) / n
        y = sum(p[1] for p in points) / n
        return x, y
    cx /= (6 * a)
    cy /= (6 * a)
    return cx, cy


PATTERN = re.compile(
    r'hotspot:\s*\{\s*points:\s*"([^"]+)"\s*\},?',
)


def convert_file(path: str) -> int:
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    count = 0

    def repl(m: re.Match) -> str:
        nonlocal count
        raw = m.group(1).strip()
        coords: list[tuple[float, float]] = []
        for tok in raw.split():
            try:
                x_s, y_s = tok.split(",")
                coords.append((float(x_s), float(y_s)))
            except ValueError:
                continue
        cx, cy = centroid(coords)
        cx = max(0.0, min(1.0, cx))
        cy = max(0.0, min(1.0, cy))
        count += 1
        return f'hotspot: {{ x: {cx:.4f}, y: {cy:.4f} }},'

    new_src = PATTERN.sub(repl, src)
    if count:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_src)
    return count


if __name__ == "__main__":
    total = 0
    for fn in sorted(os.listdir(DIR)):
        if not fn.endswith(".ts") or fn == "index.ts":
            continue
        n = convert_file(os.path.join(DIR, fn))
        if n:
            print(f"  {fn}: converted {n} polygon hotspot(s)")
        total += n
    print(f"\nDone. {total} hotspot(s) migrated to centroid points.")
