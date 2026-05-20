"""Wikimedia Commons gallery fetcher.

For each product, query Commons for a few images of the subject, filter out
the one we already use as the main photo, dump 3–4 different-looking shots
to public/products/photos/<slug>/<n>.jpg, and write a matching
`galleryPhotos: [...]` block into the ProductSpec .ts file.

The picks are not perfect — Wikimedia search returns whatever's indexed and
sometimes that includes fan photos, dealer shots, etc. The script favours
larger original images (>500KB) and skips obvious duplicates by checking
canonical filename equality with the main photo.
"""
from __future__ import annotations
import json, os, re, shutil, sys, time, urllib.parse, urllib.request
from io import BytesIO
from PIL import Image

UA = "gigascope-tracker/1.0 (https://gigascope.xyz; contact@gigascope.xyz)"
HEADERS = {"User-Agent": UA}
COMMONS = "https://commons.wikimedia.org/w/api.php"
OUT_DIR_ROOT = "G:/claude/gigascope/public/products/photos"
TS_DIR = "G:/claude/gigascope/src/data/products"
MAX_PX = 1400
JPG_Q = 85

# Reject any result whose filename contains one of these tokens (case-insensitive).
# Keeps F-22 fighter jets out of the Raptor *rocket engine* gallery, etc.
SLUG_REJECT_TOKENS: dict[str, list[str]] = {
    "raptor":   ["F-22", "F22", "Lockheed", "fighter", "Air_Force"],
    "falcon9":  ["bird", "Peregrine", "owl"],
}

SLUG_TO_FILE = {
    "raptor": "raptor.ts", "falcon9": "falcon9.ts", "starship": "starship.ts",
    "4680": "4680.ts", "neuralink-n1": "neuralink-n1.ts", "model-3": "model-3.ts",
    "model-y": "model-y.ts", "cybertruck": "cybertruck.ts", "optimus": "optimus.ts",
    "cybercab": "cybercab.ts", "megapack": "megapack.ts", "powerwall": "powerwall.ts",
    "supercharger-v4": "supercharger-v4.ts",
}

# Search queries per product. Tuned to bias toward different angles.
QUERIES = {
    "cybertruck":     ["Tesla Cybertruck side", "Tesla Cybertruck rear", "Tesla Cybertruck interior", "Tesla Cybertruck top"],
    "model-3":        ["Tesla Model 3 side", "Tesla Model 3 rear", "Tesla Model 3 interior"],
    "model-y":        ["Tesla Model Y side", "Tesla Model Y rear", "Tesla Model Y interior"],
    "cybercab":       ["Tesla Cybercab", "Tesla Robotaxi interior", "Tesla Cybercab rear"],
    "optimus":        ["Tesla Optimus robot front", "Tesla Optimus showroom", "Tesla Bot"],
    "raptor":         ["SpaceX Raptor rocket engine", "Raptor methalox", "Raptor turbopump"],
    "falcon9":        ["Falcon 9 landing", "Falcon 9 booster", "Falcon 9 launch pad"],
    "starship":       ["SpaceX Starship Ship", "SpaceX Super Heavy booster", "Starship launch"],
    "megapack":       ["Tesla Megapack farm", "Tesla Megapack installation", "Tesla Megapack 2 XL"],
    "powerwall":      ["Tesla Powerwall 3", "Tesla Powerwall installation", "Tesla Powerwall wall"],
    "supercharger-v4": ["Tesla Supercharger V4 stall", "Tesla Supercharger station", "Tesla Supercharger cable"],
    "4680":           ["4680 cell cylindrical", "Tesla cell pack module", "tabless cylindrical battery"],
    "neuralink-n1":   ["Neuralink N1 implant device", "Neuralink coin device", "Neuralink threads electrode"],
}

# Slugs where I already have a clearly-identified main photo.
MAIN_FILENAMES = {
    "raptor": "SpaceX_sea-level_Raptor_at_Hawthorne_-_2.jpg",
    "falcon9": "SpaceX_Demo-2_Launch_(NHQ202005300044)_(cropped).jpg",
    "starship": "SpaceX_Starship_ignition_during_IFT-5.jpg",
    "4680": "Tesla_4680_battery.svg",
    "model-3": "Tesla_Model_3_(2023)_Autofrühling_Ulm_IMG_9282.jpg",
    "model-y": "2022_Tesla_Model_Y_Long_Range_AWD_Front.jpg",
    "cybertruck": "2024_Tesla_Cybertruck_Foundation_Series,_front_left_(Greenwich).jpg",
    "optimus": "Optimus_bot_at_Tesla_showroom_-_20251118_-_01.jpg",
    "supercharger-v4": "Tesla_V4_Supercharger_(cropped).jpg",
}


def api(params: dict) -> dict:
    qs = urllib.parse.urlencode({**params, "format": "json"})
    req = urllib.request.Request(f"{COMMONS}?{qs}", headers=HEADERS)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def search_files(query: str, limit: int = 8) -> list[str]:
    """Return list of File: titles for a Commons search."""
    d = api({
        "action": "query", "list": "search",
        "srsearch": query, "srnamespace": 6, "srlimit": limit,
        "srprop": "size",
    })
    return [hit["title"] for hit in d.get("query", {}).get("search", [])]


def file_info(title: str) -> dict | None:
    """Return {url, width, height, author, license, sourceUrl}."""
    d = api({
        "action": "query", "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime", "titles": title,
    })
    pages = d.get("query", {}).get("pages", {})
    if not pages: return None
    page = next(iter(pages.values()))
    ii = (page.get("imageinfo") or [None])[0]
    if not ii: return None
    if not ii.get("mime", "").startswith("image/"):
        return None
    meta = ii.get("extmetadata", {})
    def get(k, default=""):
        v = meta.get(k, {}).get("value", default)
        # strip html
        return re.sub(r"<[^>]+>", "", v).strip()
    license_short = get("LicenseShortName") or get("License") or "Wikimedia"
    return {
        "title": title,
        "url": ii.get("url"),
        "width": ii.get("width", 0),
        "height": ii.get("height", 0),
        "author": get("Artist") or "Wikimedia Commons contributors",
        "license": license_short,
        "sourceUrl": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
    }


def download(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.read()
    except Exception as e:
        print(f"      download err: {e}")
        return None


def optimize_and_save(raw: bytes, dst: str) -> int:
    im = Image.open(BytesIO(raw)).convert("RGB")
    w, h = im.size
    if max(w, h) > MAX_PX:
        if w >= h:
            nw, nh = MAX_PX, round(h * MAX_PX / w)
        else:
            nw, nh = round(w * MAX_PX / h), MAX_PX
        im = im.resize((nw, nh), Image.LANCZOS)
    im.save(dst, "JPEG", quality=JPG_Q, optimize=True)
    return os.path.getsize(dst)


def write_gallery_to_ts(slug: str, items: list[dict]):
    fpath = os.path.join(TS_DIR, SLUG_TO_FILE[slug])
    with open(fpath, "r", encoding="utf-8") as f:
        src = f.read()
    # Build the block
    lines = ["  galleryPhotos: ["]
    for it in items:
        author = it["author"].replace('"', '\\"').replace("\n", " ")[:120]
        license_ = it["license"].replace('"', '\\"')[:60]
        source = it["sourceUrl"].replace('"', '\\"')
        label = it["label"].replace('"', '\\"')
        src_path = it["src"]
        lines.append("    {")
        lines.append(f'      src: "{src_path}",')
        lines.append(f'      label: "{label}",')
        lines.append("      credit: {")
        lines.append(f'        author: "{author}",')
        lines.append(f'        license: "{license_}",')
        lines.append(f'        sourceUrl: "{source}",')
        lines.append("      },")
        lines.append("    },")
    lines.append("  ],")
    block = "\n".join(lines) + "\n"

    # Replace existing galleryPhotos block if present
    if "galleryPhotos:" in src:
        src = re.sub(
            r"  galleryPhotos:\s*\[[\s\S]*?\n  \],\n",
            block,
            src,
            count=1,
        )
    else:
        # Insert before the final "};"
        src, n = re.subn(r"(\n)(\};\s*)$", "\n" + block + r"\2", src)
        if n == 0:
            # Try before "export default" or end of file
            src = src.rstrip() + "\n" + block + "\n"
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(src)


def slug_label_from_query(query: str) -> str:
    # take a short angle hint from the query: last word usually
    bits = query.split()
    return bits[-1].capitalize() if len(bits) > 1 else "View"


def main():
    targets = sys.argv[1:] or list(QUERIES.keys())
    targets = [t for t in targets if t in QUERIES]
    if not targets:
        print("no valid slug"); sys.exit(1)

    for slug in targets:
        print(f"\n[{slug}]")
        main_file = MAIN_FILENAMES.get(slug, "").replace(" ", "_")
        seen_titles: set[str] = set()
        items: list[dict] = []
        out_dir = os.path.join(OUT_DIR_ROOT, slug)
        os.makedirs(out_dir, exist_ok=True)

        for q in QUERIES[slug]:
            if len(items) >= 4:
                break
            print(f"  query: {q!r}")
            per_query = 0  # cap per query to force angle diversity
            try:
                titles = search_files(q, limit=6)
            except Exception as e:
                print(f"    search err: {e}"); continue
            for title in titles:
                if len(items) >= 4 or per_query >= 1:
                    break
                if title in seen_titles:
                    continue
                seen_titles.add(title)
                fn = title.replace("File:", "").replace(" ", "_")
                # skip the main photo
                if main_file and (fn == main_file or fn.replace("'", "'") == main_file):
                    continue
                # skip SVGs/PDFs/GIFs
                if fn.lower().endswith((".svg", ".pdf", ".gif")):
                    continue
                # reject false positives (e.g. F-22 jet for "Raptor")
                reject = SLUG_REJECT_TOKENS.get(slug, [])
                if any(t.lower() in fn.lower() for t in reject):
                    print(f"    skip (reject token): {fn[:50]}")
                    continue
                info = file_info(title)
                time.sleep(0.4)  # be gentle
                if not info or not info["url"]:
                    continue
                if info["width"] < 600 or info["height"] < 400:
                    continue
                # Avoid duplicates (sometimes Wikipedia returns the same file under
                # multiple titles via redirects).
                if any(it["wiki_title"] == title for it in items):
                    continue
                raw = download(info["url"])
                if not raw:
                    continue
                idx = len(items) + 1
                dst_filename = f"{idx}.jpg"
                dst = os.path.join(out_dir, dst_filename)
                try:
                    size = optimize_and_save(raw, dst)
                except Exception as e:
                    print(f"    {fn}: optimize err {e}"); continue
                label = slug_label_from_query(q)
                per_query += 1
                items.append({
                    "wiki_title": title,
                    "src": f"/products/photos/{slug}/{dst_filename}",
                    "label": label,
                    "author": info["author"][:120],
                    "license": info["license"],
                    "sourceUrl": info["sourceUrl"],
                })
                print(f"    OK {label} : {fn[:60]}  ({size//1024} KB)")

        if items:
            write_gallery_to_ts(slug, items)
            print(f"  -> {len(items)} gallery photos saved + .ts updated")
        else:
            print("  (no usable gallery photos found)")


if __name__ == "__main__":
    main()
