# GIGASCOPE — Session Handoff

**Last updated**: 2026-05-22 (overnight autonomous build — Atlas pivot)
**Live (primary)**: https://gigascope.xyz
**Live (alias)**: https://gigascope-ten.vercel.app
**Repo**: https://github.com/sincetwentytwo-sys/gigascope
**Main branch**: `main` (Vercel auto-deploys every push)

**ComfyUI**: `G:\ComfyUI_windows_portable\run_with_python310.bat` (port 8188)
**SAM/segmentation venv**: `G:\ComfyUI_windows_portable\venv\Scripts\python.exe`
  - `numpy<2` pinned (torch 2.0.1 compat). Don't reinstall numpy.

---

## What this overnight session built

The owner went to sleep with a single instruction: **"Yahoo-Finance scale, but a different direction. Don't stop. Investor-grade enough that Elon would subscribe."** Then dropped the autonomous-build handoff doc (`G:\jb\gigascope-자율-핸드오프.txt`) — which reframes the destination as **"the visual atlas of how the future is being built"** (NOT Yahoo Finance, NOT Bloomberg).

That doc steered the framing. The old Musk-only tracker stayed, and a much larger Atlas was built around it.

### Now live and working (8 deploy waves, all green)

**New top-level routes** (all in nav):
- `/markets` (Atlas heatmap) — live multi-sector grid with top-movers + per-sector breakdown
- `/sectors` + `/sectors/[slug]` — 11 macro theses with heatmap + names
- `/company/[slug]` — **canonical company Atlas page** (36 companies): facility map (Leaflet + ESRI satellite), 1-month sparkline, thesis + 400-700 word deepDive on flagships, bull/bear, catalysts, supply chain (up/down), news, primary-source sidebar
- `/ticker/[symbol]` — financial sidecar (price-focused subset)
- `/private` + `/private/[slug]` — 5 private companies (SpaceX, xAI, Anduril, Helion, Commonwealth Fusion) with valuation-source labels
- `/supply-chain` — layered tier view (raw materials → wafer/litho → chips → systems → end products) + 33 directional edges
- `/news` — Yahoo Finance RSS aggregated across featured tickers
- `/calendar` — all upcoming catalysts + milestones, chronological, confidence-tagged
- `/learn` + `/learn/[slug]` — 10 first-principles glossary entries (HBM, EUV, GAA, CoWoS, FSD/Robotaxi, hyperscaler capex, qubit, REE, LFP vs NMC, SMR)
- `/watchlist` — localStorage-backed star-list (no login)
- `/investor` — single-tier landing ($9 early-bird → $19 → $29), waitlist email capture
- `/downloads` — CSV/JSON bulk export hub

**New APIs**:
- `/api/quote/[symbol]` — single quote (Yahoo chart endpoint, generic across exchanges)
- `/api/quotes?symbols=...` — bulk quote endpoint for heatmap (40 max)
- `/api/chart/[symbol]?range=...&interval=...` — 5d/1mo/3mo/6mo/1y/5y price history for sparkline
- `/api/news?symbol=...` — per-ticker RSS aggregator
- `/api/subscribe` — Upstash Redis-backed email capture (POST + GET count)
- `/api/digest` — daily digest payload (next 6mo catalysts, next 2mo milestones, last-24h news on featured names). **Wired to vercel.json cron @ 14:00 UTC daily** — currently writes to nowhere; needs Resend/Postmark hookup to actually email.
- `/api/export/[dataset]?format=csv|json` — bulk export for factories, tickers, milestones, supply-chain edges, products

**New components**:
- `Sparkline.tsx` — SVG, no library, 6 range tabs
- `FacilityMap.tsx` + wrapper — multi-point Leaflet ESRI satellite map with status-color dots + popup
- `TickerLivePrice.tsx`, `TickerGrid.tsx`, `TopMovers.tsx`, `TickerNews.tsx`, `EmailSignup.tsx`
- `GlobalSearch.tsx` + `GlobalSearchProvider.tsx` + `SearchOpener.tsx` — Cmd-K / Ctrl-K modal fuzzy-searches 36 companies + 5 private + 11 sectors + 16 sites + 13 products + 10 learn entries + 11 static pages
- `WatchlistButton.tsx` — star/unstar on any ticker page (localStorage)

**Data**:
- `src/data/tickers.ts` — 36 public companies across 11 sectors, with sources (SEC EDGAR/DART/IR — tier 1), facilities (lat/lng-verified), bull/bear, catalysts, deepDive (5 flagships have 400-700 word essays), koreanName for Korean champions (삼성전자, SK하이닉스, LG에너지솔루션, 현대자동차, 한화에어로스페이스, LIG넥스원).
- `src/data/privateCompanies.ts` — 5 private cos, valuation-source-labelled est.
- `src/data/supplyChain.ts` — 33 hand-curated directional edges, criticality (monopoly/primary/secondary), source URL per edge
- `src/data/learn.ts` — 10 glossary entries, first-principles, related-tickers + related-terms

**Per-company OG image** (massive share-rate boost) at `/company/[slug]/opengraph-image.tsx` — uses next/og ImageResponse with sector accent + ticker + name + thesis snippet.

**Marketing assets** at `content/social-drafts/2026-05-22/x-launch.md` — EN + KO launch thread + 3 infographic concepts. Owner reviews → polishes → posts.

### Framing pivot (the important strategic call)

Per the autonomous handoff doc, the owner's destination is NOT a Bloomberg/Yahoo Finance competitor. It's an **atlas**.

The early build called this an "intelligence terminal" and shipped a 3-tier "Pro/Premium/Enterprise" pricing page. Both were wrong. Mid-build pivot done:
- Single `Investor` tier, not Pro/Premium/Enterprise.
- "Atlas" replaces "terminal" in copy + nav label for `/markets`.
- Root metadata title: "Visual atlas of how the future is being built."
- About page rewritten with the **5 moats** (industrial essence / physical sites / supply-chain visibility / future-facing framing / visual UX) + 4-tier primary-source policy + Korean differentiation.

### What was already live (pre-overnight) that survived

- 16 Musk-empire factory sites + `/site/[slug]` dashboards
- 13 products + 2D viewer with numbered hotspot dots (87 hand-tuned hotspots)
- `/compare` slider, `/timeline`, `/products` hub
- Model 3 wheel hotspots fixed (y=0.65 → y=0.75 per prev session)
- Legacy 3D viewer code deleted (Product3DViewer*, capture-product-thumbnails)

---

## Known not-yet-done / decisions for owner

### Investor billing is scaffold-only
- `/investor` page collects emails → Upstash Redis (if envs set). No Stripe yet.
- Three.js + R3F still in package.json (unused since 2D viewer landed). Can remove next session.
- Daily digest cron runs but doesn't actually email — needs Resend or Postmark integration (~30 min of work).

### Hyperscaler valuations are placeholders
- MSFT marketCap = $3,500B, GOOG = $2,200B, etc. Refreshed to ~mid-2026 levels.
- Refresh script not built — currently hand-edited. Build `scripts/refresh-marketcaps.mjs` (uses Yahoo Finance) next.

### Things explicitly skipped (handoff §11)
- No real-time trading features (Yahoo Finance lane).
- No comments / forums / user-gen content.
- No crypto / NFT.
- No 3-tier "Pro/Premium" — single Investor tier only.

### Live verification status
- All 8 commits passed `npx next build` locally before push.
- Per HANDOFF discipline ("Never claim launchable without smoke test") — owner should still eyeball one or two pages live before any X post.

---

## Files that matter (additions, in order of edit cadence)

| Path | Purpose |
|---|---|
| `src/data/tickers.ts` | **36 public companies**. Single biggest data file. Add new tickers here. |
| `src/data/privateCompanies.ts` | 5 private cos with valuation-source labels. |
| `src/data/supplyChain.ts` | 33 directional edges. Add edges when a primary source confirms a dependency. |
| `src/data/learn.ts` | 10 glossary entries. Each ~400-700 words. Add new terms here. |
| `src/app/company/[slug]/page.tsx` | The canonical Atlas company page. |
| `src/app/company/[slug]/opengraph-image.tsx` | Dynamic per-company OG image for X cards. |
| `src/app/private/[slug]/page.tsx` | Private company pages — same shape as /company but with valuation-est. labels. |
| `src/app/markets/page.tsx` | Live multi-sector heatmap + top movers. |
| `src/app/sectors/[slug]/page.tsx` | Sector hubs (11 sectors). |
| `src/app/supply-chain/page.tsx` | Layered tier + edges list. |
| `src/app/learn/[slug]/page.tsx` | Glossary. |
| `src/app/calendar/page.tsx`, `src/app/news/page.tsx`, `src/app/downloads/page.tsx`, `src/app/investor/page.tsx`, `src/app/watchlist/...` | Self-explanatory. |
| `src/app/about/page.tsx` | Full rewrite — Atlas tone + 5 moats + primary-source policy. |
| `src/components/FacilityMap.tsx` (+wrapper) | Multi-point Leaflet+ESRI map used on company pages. |
| `src/components/Sparkline.tsx` | SVG sparkline with 6 range tabs. |
| `src/components/GlobalSearch*.tsx` | Cmd-K modal. |
| `vercel.json` | Cron config: `/api/digest` daily 14:00 UTC. |
| `content/social-drafts/2026-05-22/x-launch.md` | EN + KO launch thread drafts. |

---

## How to start the next session

```
HANDOFF.md 읽고 현재 상태 파악해줘.
```

Then likely user priorities (best guess):

### 1. Hook digest cron to actual email (highest revenue impact)
Wire Resend (free 100/day) into `/api/digest`. When the cron fires, fetch the JSON payload, render HTML, mass-send to every email in `subscribers:emails` Upstash set. **~30 min work.**

### 2. Stripe + Supabase Auth for the Investor tier
Currently `/investor` is email-capture only. Wire $9/mo + $99/yr products + a `subscription_status` check on `/api/digest` (so only paid users get the email). **~3-4 hours.**

### 3. Refresh market-cap data
Build `scripts/refresh-marketcaps.mjs` that hits Yahoo Finance for every ticker.marketCapB, writes back to the data file. Run on cron. ~1 hour.

### 4. Cover more companies (Phase 6+ per handoff)
- LG Electronics, Samsung Display, more semis (KLAC, AMAT, LRCX), Intel Foundry detail, MRVL, ON
- Hanwha Solutions, Doosan Robotics (000150.KS), Rainbow Robotics (277810.KQ)
- Lithium Americas (LAC), QuantumScape (QS), Northvolt (now bankrupt — historical only)
- Helion / Commonwealth Fusion already in private; add TAE Technologies, Type One Energy

### 5. Korean-language X content
Owner asked for KO X posts. Drafts exist at `content/social-drafts/2026-05-22/x-launch.md`. Refresh weekly.

### 6. Continue hotspot fine-tuning
User report format: `[product]의 [part_name]이 [방향]으로 어긋남` → edit `scripts/apply-hotspots.py`, re-run, push.

---

## Important behavior memory

User profile (`C:/Users/JIBBY/.claude/projects/G--claude/memory/`):
- **Always merge to main immediately after every fix** — Vercel deploys from main
- Direct, fact-based. Push back honestly when ideas are bad
- Korean. `~합니다` / `~해드릴게요` formal-but-warm tone
- Don't ask for confirmation on small reversible changes; do ask for risky ones

Critical rules from the autonomous handoff doc (`G:\jb\gigascope-자율-핸드오프.txt`):
- **You are NOT a junior dev waiting for tickets.** Read the vision, execute. Don't ask permission per company. Only escalate strategic decisions.
- **Accuracy is the moat.** Musk fans + semis analysts + REE investors will catch one wrong number and trust collapses. ALWAYS cite Tier-1 primary sources (SEC EDGAR, DART, IR, whitepapers). NEVER Wikipedia/Reddit/blogs as a sole source.
- **Korean coverage is the differentiator.** Owner is Korean → DART filings are a structural moat over Bloomberg's thin Korea desk.
- **NOT Yahoo Finance, NOT Bloomberg.** Atlas, not terminal. Visual + interactive, not spreadsheet.
- **Skip:** real-time trading, comments/forums, crypto/NFT, 3-tier pricing, ads.

---

## Useful commands

```bash
# Local dev
cd G:/claude/gigascope && npm run dev

# Production build sanity (run before pushing big changes)
npx next build

# Adjust dots
"G:/ComfyUI_windows_portable/venv/Scripts/python.exe" \
  scripts/apply-hotspots.py

# Recent deploys
gh run list --repo sincetwentytwo-sys/gigascope --limit 5

# Latest commits
git log --oneline -10
```

---

## Repo state at end of overnight session

Latest commits (newest first):
```
4e11b88 feat: private company pages (SpaceX, xAI, Anduril, Helion, Commonwealth Fusion)
6888717 feat: /learn glossary + Hyperscalers sector + About rewrite
3c935c1 content: more deepDives + LIG Nex1 + IBM Quantum + Lynas + launch marketing drafts
5b75491 feat: long-form deepDives + downloads + daily digest cron
2759936 feat: global cmd-K search + nav expansion + Atlas-tone polish
aab98ca feat: supply chain graph + batteries/EV/Korea industrial coverage + Model 3 hotspot fix
a235da9 feat: pivot to Atlas framing — company pages, primary-source citations, Investor tier
e19c893 feat: massive multi-sector expansion — markets + sectors + tickers + pro tier
1c95a35 HANDOFF: snapshot end of products-page rework — photo viewer with numbered dots is live
```

Working tree should be clean (this file is the only delta after the last commit; commit it next).

**Page count delta** (rough): old build ~50 static/SSG pages → current build ~120 (factories 16 + products 13 + companies 36 + tickers 36 + private 5 + sectors 11 + learn 10 + statics ~15 + assorted dynamic).

**Sectors covered** (11): Musk Empire, Semis & AI Compute, Quantum, Critical Materials, Defense & Space, Fusion & Nuclear, Robotics & Applied AI, Batteries & EVs, Korea Industrial, China Tech, Hyperscalers.

**Korean-listed names in coverage** (6): 005930.KS Samsung, 000660.KS SK Hynix, 373220.KS LGES, 006400.KS Samsung SDI, 005380.KS Hyundai Motor, 012450.KS Hanwha Aerospace, 079550.KS LIG Nex1.
