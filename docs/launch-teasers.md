# Launch teasers — copy-paste ready

Pick one per platform. Replace `https://gigascope-ten.vercel.app` with `https://gigascope.xyz` after DNS cuts over.

---

## Product Hunt

**Tagline (60 char max):**
> Tracking the Musk empire — factory by factory, part by part.

**Description:**
> Gigascope is a public dashboard for 16 Tesla / SpaceX / xAI / Neuralink / Boring construction sites. Satellite maps with 9-year quarterly timelapses (Sentinel-2), 13 interactive 3D product breakdowns (Raptor, Starship, 4680, Optimus, Cybertruck, ...) with 230+ clickable parts, milestone timelines, and a before/after slider. No login, no ads, no fake "LIVE" labels. MIT-licensed.

**First comment (maker):**
> Built this solo over a few weekends after getting tired of the Musk-empire info being scattered across 50 different X threads and YouTube channels. Everything you see is from public sources (Copernicus Sentinel-2, Wikipedia, NASASpaceflight, Electrek, company filings) — all stitched together with Next.js 16 + Three.js + a lot of ffmpeg. The 3D parts are pure procedural geometry, no CAD imports.
>
> Roadmap: investor tier with email alerts on milestone changes, CSV exports, and an AI summary feed.
>
> Happy to answer any technical questions on the timelapse pipeline or the 3D viewer.

---

## Hacker News (Show HN)

**Title (80 char max):**
> Show HN: Gigascope – 9-year Sentinel-2 timelapses of 16 Musk-empire build sites

**First comment:**
> Author here. A few technical notes that might interest HN:
>
> - All 16 × 14 quarter timelapses are pre-rendered from Copernicus Sentinel-2 Process API. ffmpeg signalstats (YAVG<40) auto-drops cloudy/black frames so you actually see the construction instead of clouds.
> - 13 product 3D breakdowns are 100% procedural geometry (cylinders/boxes/spheres/cones/torus composited in r3f). 230+ clickable parts each with a 150–300 char tech description. No glTF, no Blender.
> - Statically generated — every page is just HTML/JSON. Vercel free tier, no server. GitHub Actions handle cron (weekly timelapse rebuild, daily marketing, hourly launch monitor).
> - MIT-licensed, repo: https://github.com/sincetwentytwo-sys/gigascope
>
> Known issues: 8 of the 13 product cards still use a placeholder gradient instead of a real 3D screenshot (headless WebGL is flaky); custom domain not yet wired. Working on both.
>
> Feedback welcome, especially on the timelapse calibration — some sites need bbox tuning.

---

## X / Twitter

### Short variant (single tweet)

> Tracking the Musk empire — factory by factory, part by part.
>
> 16 build sites with 9-yr Sentinel-2 timelapses
> 13 interactive 3D product breakdowns (Raptor, Starship, 4680, Optimus...)
> 230+ clickable parts, all procedural geometry
>
> No login. MIT-licensed.
>
> https://gigascope-ten.vercel.app

### Thread variant

**1/**
> I built a public dashboard for the entire Musk empire.
>
> 16 construction sites. 9 years of quarterly satellite timelapses. 13 interactive 3D product breakdowns with 230+ clickable parts.
>
> No login. No ads. MIT-licensed.
>
> https://gigascope-ten.vercel.app

**2/**
> Every site has a 2018→2026 timelapse, auto-built from Copernicus Sentinel-2.
>
> ffmpeg signalstats drops cloudy frames so you actually see the construction — not weather.

**3/**
> The 3D breakdowns are pure procedural geometry. No CAD, no Blender. Every part is a cylinder/box/sphere/cone/torus composited in react-three-fiber.
>
> Click anything — Raptor turbopump, Optimus actuator, 4680 tab — get a tech blurb.

**4/**
> Stack: Next.js 16, Three.js + r3f, Leaflet, Vercel.
>
> GitHub Actions for everything: weekly timelapse rebuild, daily marketing, hourly launch monitor.
>
> Statically generated. Free tier. Repo:
> https://github.com/sincetwentytwo-sys/gigascope

**5/**
> Roadmap: investor tier with milestone email alerts, CSV exports, AI summary feed.
>
> If you have a site you'd like added (semiconductor fabs, rare earth, AI datacenters), reply or open an issue.

---

## Reddit

Candidate subs: r/teslamotors, r/spacex, r/SpaceXLounge, r/elonmusk, r/dataisbeautiful, r/webdev, r/threejs

**r/dataisbeautiful title:**
> [OC] 9 years of quarterly satellite timelapses for all 16 Musk-empire build sites (Sentinel-2 + ffmpeg)

**r/threejs / r/webdev title:**
> Built a 3D product breakdown viewer with 230+ clickable parts — all procedural geometry, zero CAD imports

**r/spacex title:**
> I made an interactive 3D Raptor / Falcon 9 / Starship breakdown — click any part for a tech description

Keep Reddit comments low-key, no marketing tone, lead with one technical detail and the link.
