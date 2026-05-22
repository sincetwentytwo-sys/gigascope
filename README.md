# Gigascope

**Watch Musk's empire get built, one satellite frame at a time.**

Public dashboard tracking 16 Tesla / SpaceX / xAI / Neuralink / Boring Company
construction and production sites from orbit. Sentinel-2 weekly captures, ESRI
high-resolution overlays, milestone timelines, and 2D product breakdowns for
the hardware that ships from those sites.

🌐 Live: **https://gigascope.xyz** (alias: https://gigascope-ten.vercel.app)

---

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5, Tailwind 4
- Leaflet + react-leaflet (satellite map, before/after compare slider)
- Resend + `@react-email/components` (welcome + drip sequence)
- Upstash Redis (subscriber store, visit counter)
- Stripe (checkout code present, billing not yet live)
- Vercel (auto-deploy on push to `main`, cron hosting)

Most pages are statically generated; only API routes and cron jobs run on demand.

---

## Local dev

```bash
git clone https://github.com/sincetwentytwo-sys/gigascope.git
cd gigascope
npm install
npm run dev
# → http://localhost:3000
```

Build:

```bash
npm run build
```

Refresh factory data after editing `public/data/factories.json`:

```bash
npm run update:factories
```

`.env.local` needs `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, and `UNSUBSCRIBE_SECRET` for full email functionality.

---

## Deployment

Push to `main` — Vercel builds and ships. Cron jobs (daily digest, drip sequence,
Starlink refresh) are defined in `vercel.json`.

---

## Repo conventions

- Contributor guide: see [`CONTRIBUTING.md`](./CONTRIBUTING.md) (data updates go via PR to `public/data/factories.json`)
- Session handoffs land in [`HANDOFF.md`](./HANDOFF.md)
- Project instructions for AI agents live in [`CLAUDE.md`](./CLAUDE.md) and [`AGENTS.md`](./AGENTS.md)
- Commits: conventional-ish prefixes (`feat:`, `fix:`, `content:`, `chore:`)

---

## Disclaimers

- Satellite imagery is **not real-time**. Sentinel-2 has a ~5-day revisit cadence; ESRI World Imagery refreshes every 3–6 months.
- Progress percentages and milestone dates are best-effort estimates from public sources (company filings, news outlets, Wikipedia). Not investment advice.
- Community project. **Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.**

---

## License

MIT — see [LICENSE](./LICENSE).
