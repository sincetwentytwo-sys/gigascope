"""Real-browser check for GIGASCOPE: things the HTTP smoke sweep can't see
(client-only Leaflet map, compare slider, hydration, console errors).

  py scripts/verify/browser_check.py                       # http://localhost:3010
  py scripts/verify/browser_check.py --base https://gigascope.xyz
  py scripts/verify/browser_check.py --site cortex --out G:/Temp/gs_verify

Uses Playwright with the installed Edge (channel="msedge"), headless, one
browser at a time. Screenshots go to --out (default G:/Temp/gs_verify) so the
reviewer can look at the actual pixels. Exit 0 = all checks passed.
"""
import argparse, json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("--base", default="http://localhost:3010")
ap.add_argument("--site", default="giga-texas")
ap.add_argument("--out", default="G:/Temp/gs_verify")
ap.add_argument("--timeout", type=int, default=30, help="seconds to wait for map tiles")
a = ap.parse_args()
base = a.base.rstrip("/")
out = Path(a.out); out.mkdir(parents=True, exist_ok=True)

results, console_errors = [], []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(f"{'ok  ' if ok else 'FAIL'} {name}{'  - ' + detail if detail else ''}")


with sync_playwright() as p:
    br = p.chromium.launch(channel="msedge", headless=True)
    pg = br.new_page(viewport={"width": 1366, "height": 900})
    def on_console(m):
        if m.type != "error":
            return
        t = m.text
        if "hydrat" in t:
            # keep React's +/- diff lines: that's the only part that says WHAT mismatched
            diff = [l for l in t.splitlines() if l.lstrip().startswith(("+", "-", ">"))]
            t = t.splitlines()[0][:160] + " | diff: " + " / ".join(x.strip() for x in diff[:12])
        console_errors.append(f"{pg.url}: {t[:1200]}")
    pg.on("console", on_console)
    pg.on("pageerror", lambda e: console_errors.append(f"{pg.url}: pageerror {str(e)[:200]}"))

    # 1. site page: Leaflet map mounts and satellite tiles actually load
    pg.goto(f"{base}/site/{a.site}", wait_until="domcontentloaded")
    pg.locator("h1").first.wait_for(timeout=20000)
    map_box = pg.locator(".leaflet-container").first
    try:
        map_box.scroll_into_view_if_needed(timeout=a.timeout * 1000)
    except Exception:
        pass
    t0 = time.time()
    tiles = 0
    while time.time() - t0 < a.timeout:
        tiles = pg.locator("img.leaflet-tile-loaded").count()
        if tiles:
            break
        pg.wait_for_timeout(500)
    check("site: leaflet map mounted", pg.locator(".leaflet-container").count() > 0)
    check("site: satellite tiles loaded", tiles > 0, f"{tiles} tiles in {time.time() - t0:.1f}s")
    check("site: attribution visible", pg.locator(".leaflet-control-attribution").count() > 0)
    pg.screenshot(path=str(out / f"site_{a.site}.png"), full_page=False, caret="initial")
    if pg.locator(".leaflet-container").count():
        pg.locator(".leaflet-container").first.screenshot(path=str(out / f"site_{a.site}_map.png"), caret="initial")

    # tile source toggle button cycles the label
    btn = pg.locator(".leaflet-container").locator("xpath=..").locator("button").first
    if btn.count():
        before = btn.inner_text()
        btn.click()
        pg.wait_for_timeout(800)
        check("site: tile source toggle", btn.inner_text() != before, f"{before!r} -> {btn.inner_text()!r}")

    # 2. compare page: slider renders both layers
    pg.goto(f"{base}/compare", wait_until="domcontentloaded")
    pg.get_by_text("Compare imagery").first.wait_for(timeout=20000)
    pg.wait_for_timeout(3000)
    imgs = pg.evaluate("[...document.images].filter(i => i.complete && i.naturalWidth > 0).length")
    check("compare: images rendered", imgs > 0, f"{imgs} loaded images")
    pg.screenshot(path=str(out / "compare.png"), caret="initial")

    # 3. home: hero + site grid links
    pg.goto(base + "/", wait_until="domcontentloaded")
    pg.locator("h1").first.wait_for(timeout=20000)
    links = pg.locator("a[href^='/site/']").count()
    check("home: site grid links", links >= 10, f"{links} links")
    # Let hydration finish first: screenshot(caret="hide") injects caret-color into the
    # DOM, and if React hasn't hydrated yet it reports a (fake) hydration mismatch.
    pg.wait_for_load_state("networkidle")
    pg.screenshot(path=str(out / "home.png"), caret="initial")

    br.close()

# Next dev overlay noise and 3rd-party tile 404s are not app bugs; everything else counts.
real_errors = [e for e in console_errors if "favicon" not in e and "Download the React DevTools" not in e]
check("no console/page errors", not real_errors, "; ".join(real_errors[:5]))

bad = [r for r in results if not r[1]]
print(f"\n{'PASSED' if not bad else 'FAILED'}: {len(results) - len(bad)}/{len(results)} checks. screenshots: {out}")
sys.exit(1 if bad else 0)
