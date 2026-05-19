# GIGASCOPE — Session Handoff

**Last updated**: 2026-05-20
**Live**: https://gigascope-ten.vercel.app
**Repo**: https://github.com/sincetwentytwo-sys/gigascope
**Main branch**: `main` (auto-deploy on every push)

---

## What this is

Public dashboard tracking **16 Musk-empire construction sites** + **13 interactive 3D product breakdowns** + **automated X marketing**. Built solo for monetization (Free + Investor $19/mo planned for Phase 3).

Phase 1 (current): public site fully shipped.
Phase 2 (planned): Investor tier with Stripe + Auth + alerts + AI summary.
Phase 3 (planned): expand to AI infra / semiconductor / rare earth categories.

---

## Stack & deploy

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4
- Three.js + react-three-fiber + drei (3D viewer)
- Leaflet (satellite map)
- Vercel (auto-deploy on push to `main`, ~1-2 min)
- GitHub Actions for cron (marketing, timelapse, data updates)

---

## Current state — 100% shipped

### Public site
- `/` — home with 16 site cards, TSLA ticker, SpaceX live stats, community feed
- `/site/[slug]` — per-site detail (satellite map ESRI/Sentinel-2 toggle, 9-yr timelapse video, milestones, news, related products)
- `/compare` — before/after satellite slider (company-grouped)
- `/timeline` — global milestone timeline (company filter)
- `/products` — interactive 3D breakdown hub (13 products)
- `/products/[slug]` — full 3D viewer per product
- `/about` — data sources, disclaimer

### 16 sites (`public/data/factories.json`)
Tesla (×7): terafab, giga-texas, giga-nevada, giga-shanghai, giga-berlin, giga-mexico, fremont, giga-buffalo
SpaceX (×4): starbase, spacex-hawthorne, cape-canaveral, vandenberg
xAI: colossus
Neuralink (×2): neuralink-fremont, neuralink-austin
Boring: vegas-loop

### 13 product 3D breakdowns (`src/data/products/`)
Rockets: raptor, falcon9, starship
Battery: tesla4680, powerwall, megapack
Chip: neuralinkN1
Vehicles: model3, modelY, cybertruck, cybercab
Robot: optimus
Charging: superchargerV4

230+ clickable parts total, all procedural geometry (cylinders/boxes/spheres/cones/torus). Each part has 150-300 char tech description.

### Sentinel-2 timelapse (`public/timelapses/`)
- 16 sites × 14 quarters (2018-Q1 → 2026-Q2) backfilled via Copernicus Process API
- ffmpeg signalstats auto-drops cloudy/black frames (YAVG<40)
- Per-site `halfKm` bbox tuning + per-site center coords
- MP4 with date overlay (white text bottom-left)
- `public/timelapses/index.json` tracks build state

### X marketing automation (`scripts/marketing/`)
- `generate.mjs` — daily trigger, factories.json changes + weekday-scheduled content → drafts in `marketing/drafts/`
- `post-to-x.mjs` — OAuth 1.0a, posts text tweets to @since_2283618 (live)
- `post-video-to-x.mjs` — chunked v1.1 media upload + v2 tweet, weekly rotation by ISO week
- `launch-monitor.mjs` — hourly SpaceX launch detection → time-sensitive tweets
- Templates: `templates.mjs` — milestone, progress, launch, weekly summary, etc. with contextual hashtags + UTM tracking

### Cron workflows (`.github/workflows/`)
- `daily-marketing.yml` — 09:00 UTC daily, 0-45min random jitter
- `launch-monitor.yml` — hourly
- `timelapse.yml` — Mon 07:00 UTC, captures + builds + posts video tweet on rotation
- `factories-update.yml` — Mon 06:00 UTC, Wikipedia/LL2 → PR
- `data-freshness.yml` — staleness check
- `weekly-rebuild.yml` — Vercel rebuild trigger

---

## Secrets (already in GH repo settings)

- `CDSE_CLIENT_ID`, `CDSE_CLIENT_SECRET` — Copernicus Sentinel Hub OAuth (free tier, never expire)
- `X_CONSUMER_KEY`, `X_CONSUMER_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` — X API OAuth 1.0a, Read+Write, for @since_2283618
- `X_AUTOPOST=1`, `X_VIDEO_AUTOPOST=1` — kill switches
- `FINNHUB_API_KEY` — TSLA ticker
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — visitor counter

X account is on Pay-Per-Use tier, ~$0.001/tweet, $5 balance (covers years at current cadence).

---

## Known issues / unfinished

1. **8 product thumbnails missing** — hub cards for `model3`, `modelY`, `cybertruck`, `optimus`, `cybercab`, `megapack`, `powerwall`, `supercharger-v4` show category gradient placeholder instead of real 3D screenshot. Headless Chrome WebGL flaky for these. (First 5 products have real thumbnails captured.)
2. **3D viewer initial camera** — Most products render fine, but some (especially Starship, Cybertruck) need user-drag to see model. Initial camera angle slightly off — drag/zoom works.
3. **No license** — repo public but no LICENSE file. Should add MIT before community contributions.
4. **No custom domain** — `gigascope.xyz` was mentioned in original handoff but not connected; site lives at `gigascope-ten.vercel.app`.

---

## Important behavior memory

User profile (`C:/Users/JIBBY/.claude/projects/G--claude/memory/`):
- **Always merge to main immediately after every fix** — Vercel deploys from main, user verifies on production
- Direct, fact-based communication. No marketing fluff. Push back honestly when ideas are bad
- Korean. Use `~합니다` / `~해드릴게요` formal-but-warm tone
- Don't ask for confirmation on small reversible changes; do ask for risky ones (force-push, payment, destructive)

Critical project rules:
- 가짜 SF 용어 금지 (no "SATELLITE LINK ESTABLISHED" etc — see `CLAUDE.md`)
- 실시간이 아니면 "LIVE" 표기 금지 (Sentinel-2 is not real-time)
- Tesla-style minimal aesthetic

---

## Next session — 3 options to pick from

### A. Launch prep (~1 hour) — RECOMMENDED FIRST
- MIT LICENSE
- Custom domain `gigascope.xyz` (DNS + Vercel)
- Fix 3D camera framing for 8 new products
- Capture missing 8 thumbnails (try Puppeteer or playwright instead of bare Chrome)
- README polish + ProductHunt/HN/X teaser ready

### B. Investor tier MVP (~3-5 hours)
- Supabase Auth (email + Google OAuth)
- Stripe Checkout ($19/mo + $190/yr)
- Customer Portal
- Permission middleware (Free vs Investor)
- Email alerts via Resend on milestone changes (Investor-only)
- CSV/JSON data export (Investor-only)

### C. Content automation expansion (~2 hours)
- Per-site RSS news feed (NASASpaceflight, SpaceFlightNow, Electrek...)
- Reddit/HN embed widgets per site
- Real-time X mention tracker
- Push more daily fresh content for SEO

---

## How to start the next session

Open Claude Code in `G:/claude/gigascope` and paste:

```
HANDOFF.md 읽고 현재 상태 파악해줘. 그 다음 [A/B/C 중 선택] 작업 시작해줘.
```

Or for a quick status check first:
```
HANDOFF.md 읽고 현재 상태 + 다음 옵션 3개 요약해줘.
```

---

## Useful commands

```bash
# Local dev
cd G:/claude/gigascope && npm install && npm run dev

# Build
npm run build

# Trigger marketing workflow manually
gh workflow run daily-marketing.yml --repo sincetwentytwo-sys/gigascope

# Trigger timelapse workflow
gh workflow run timelapse.yml --repo sincetwentytwo-sys/gigascope

# Trigger single site timelapse only (for testing)
gh workflow run timelapse.yml --repo sincetwentytwo-sys/gigascope -f only_slug=giga-berlin

# Check secrets
gh secret list --repo sincetwentytwo-sys/gigascope

# Recent deploys
gh run list --repo sincetwentytwo-sys/gigascope --limit 5

# Run a timelapse capture locally (needs CDSE creds)
CDSE_CLIENT_ID=... CDSE_CLIENT_SECRET=... GITHUB_REPOSITORY=sincetwentytwo-sys/gigascope ONLY_SLUG=giga-berlin DRY_RUN=1 node scripts/timelapse/capture.mjs

# Run X video poster dry-run
DRY_RUN=1 node scripts/marketing/post-video-to-x.mjs
```

---

## Memory references (auto-loaded into Claude context)

- `feedback_always_merge_to_main.md` — push every fix to main immediately
- `user_content_creator.md` — fact-based, direct
- `feedback_no_checkpoint.md` — run full pipeline without mid-confirms
- `reference_rivet_brief_channel.md` — separate channel setup pattern

Repo-level `CLAUDE.md` and `AGENTS.md` cover project-specific design rules (gas-free SF jargon ban, Tesla aesthetic, Next.js 16 caveat about breaking changes).
