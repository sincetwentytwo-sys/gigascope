# Gigascope

**Tracking the Musk empire — factory by factory, part by part.**

Public dashboard for 16 Tesla / SpaceX / xAI / Neuralink / Boring construction sites,
13 interactive 3D product breakdowns, and 9-year Sentinel-2 timelapses of every site.

🌐 Live: **https://gigascope.xyz**

---

## What's in it

- **16 construction sites** with satellite maps (ESRI / Sentinel-2 toggle), milestones, news, related products
- **13 interactive 3D product breakdowns** — Raptor, Starship, Falcon 9, 4680, Powerwall, Megapack, Neuralink N1, Model 3/Y, Cybertruck, Cybercab, Optimus, Supercharger V4 — 230+ clickable parts with tech descriptions
- **9-year quarterly timelapses** (2018-Q1 → 2026-Q2) of all 16 sites, auto-built from Copernicus Sentinel-2
- **Before/after slider** + **global milestone timeline**
- **Live TSLA ticker** + SpaceX launch stats + community feed

---

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4
- Three.js + react-three-fiber + drei (3D product viewer)
- Leaflet (satellite map)
- Copernicus Sentinel-2 (timelapse source)
- Vercel (auto-deploy on push to `main`)
- GitHub Actions (daily marketing, hourly launch monitor, weekly timelapse rebuild)

All pages statically generated. No server cost.

---

## Local dev

```bash
git clone https://github.com/sincetwentytwo-sys/gigascope
cd gigascope
npm install
npm run dev
# → http://localhost:3000
```

Build:

```bash
npm run build
```

Refresh product thumbnails (`public/products/<slug>.jpg`) after editing models:

```bash
# Terminal 1
npm run dev

# Terminal 2 — opens a real Chromium window briefly per product.
# Headless WebGL captures r3f scenes as black; headed is required.
npm run capture:thumbnails
# (or)  ONLY_SLUG=cybertruck npm run capture:thumbnails
```

---

## Repo layout

```
src/
  app/             # Next.js App Router pages
  components/      # Globe, SatelliteMap, 3D viewer, etc.
  data/products/   # 13 product part trees
public/
  data/factories.json  # 16 site definitions
  timelapses/          # Pre-built MP4s + index.json
scripts/
  timelapse/       # Sentinel-2 capture + ffmpeg pipeline
  marketing/       # Auto-tweet generator + X poster
.github/workflows/ # cron pipelines
```

---

## Disclaimers

- Satellite imagery is **not real-time**. Sentinel-2 is ~5-day revisit, ESRI updates every 3–6 months.
- Progress percentages and milestone dates are best-effort estimates from public sources (Wikipedia, NASASpaceflight, Electrek, company filings). Not investment advice.
- Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.

---

## License

MIT — see [LICENSE](./LICENSE).

Contributions welcome. Open an issue or PR.

<!-- Push automation test with .env token (2026-05-20) -->
