"""Optimize ref/<slug>.{jpg,webp,svg} -> public/products/photos/<slug>.jpg
Resize to max 1600px on longest side, JPEG quality 86. SVGs are rasterized.
"""
import os, sys, subprocess
from PIL import Image

REF = "G:/claude/gigascope/scripts/refs"
OUT = "G:/claude/gigascope/public/products/photos"
MAX = 1600
Q = 86

os.makedirs(OUT, exist_ok=True)

slugs = [f.rsplit(".", 1)[0] for f in os.listdir(REF) if not f.startswith(".")]
seen = set()
for f in sorted(os.listdir(REF)):
    slug, _, ext = f.rpartition(".")
    if slug in seen:
        continue
    seen.add(slug)
    src = os.path.join(REF, f)
    dst = os.path.join(OUT, f"{slug}.jpg")
    try:
        if ext.lower() == "svg":
            # Rasterize SVG via Pillow's cairo backend if available, else
            # skip with note (we'll just keep the SVG and serve it directly).
            try:
                from cairosvg import svg2png
                png_bytes = svg2png(url=src, output_width=MAX)
                from io import BytesIO
                im = Image.open(BytesIO(png_bytes)).convert("RGB")
            except Exception:
                print(f"  {slug}: SVG, no cairosvg — copying as-is")
                import shutil
                shutil.copy(src, os.path.join(OUT, f"{slug}.svg"))
                continue
        else:
            im = Image.open(src).convert("RGB")

        w, h = im.size
        if max(w, h) > MAX:
            if w >= h:
                nw, nh = MAX, round(h * MAX / w)
            else:
                nw, nh = round(w * MAX / h), MAX
            im = im.resize((nw, nh), Image.LANCZOS)

        im.save(dst, "JPEG", quality=Q, optimize=True)
        size = os.path.getsize(dst) / 1024
        print(f"  {slug}: {im.size[0]}x{im.size[1]}  {size:.0f} KB")
    except Exception as e:
        print(f"  {slug}: FAIL {e}")
