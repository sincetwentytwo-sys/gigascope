import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import SatelliteDropEmail from "@/emails/satellite-drop";
import { factories } from "@/data/factories";
import { TIMELAPSE_INDEX } from "@/lib/timelapseIndex";
import {
  detectDrops,
  type CaptureState,
  type DropDetected,
} from "@/lib/satelliteDropDetector";
import { unsubHeaders } from "@/lib/unsubscribe";
import { isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";
import { isCronAuthorized } from "@/lib/cronAuth";
import { emailTags, recordEmailSent } from "@/lib/emailMetrics";

// Hourly cron — checks the timelapse index for new satellite frames per
// site, fans out per-site alert emails (+ Telegram when linked) to all
// subscribers, then HSETs the new "last known" dates so the next run is
// idempotent.
//
// Scheduling: vercel.json — every hour at :15 past, offset from the daily
// :00 / :15 / :30 / :45 crons so we don't pile on Resend at peak minutes.
// Same dedup pattern as catalyst-alerts: the per-site "latest" date stored
// in Redis acts as the natural idempotency key.

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Redis hash holding the last-known latest capture date per site slug.
// Key shape: HSET satellite:last-known <slug> <YYYY-MM-DD>
const LAST_KNOWN_KEY = "satellite:last-known";

function formatTelegramText(drop: DropDetected, factoryName: string): string {
  const gap = Number.isFinite(drop.daysGap) ? `${drop.daysGap}d` : "—";
  const prev = drop.previous ?? "—";
  return [
    `🛰 New ${factoryName} satellite frame`,
    `Captured: ${drop.latest} · Previous: ${prev} · Gap: ${gap}`,
    `Cadence varies by weather/provider — not a daily feed.`,
    `https://gigascope.xyz/site/${drop.slug}`,
  ].join("\n");
}

async function handle(req: Request): Promise<NextResponse> {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // 1) Build CaptureState[] from factories.ts + TIMELAPSE_INDEX.
  //    We do NOT call captureFreshness(slug) here because daysOld is computed
  //    against Date.now() inside that helper — the cron only needs the raw
  //    `latest` string, and the pure detector is the one that does any math.
  const current: CaptureState[] = factories.map((f) => {
    const tl = TIMELAPSE_INDEX[f.slug];
    return { slug: f.slug, latest: tl?.latest ?? null };
  });

  // 2) Fetch last-known map from Redis. HGETALL returns an empty {} on a
  //    cold key — that's the correct "first run, nothing seen yet" state,
  //    and the detector treats every site as first-seen.
  let lastKnown: Record<string, string | null> = {};
  try {
    const raw = await r.hgetall<Record<string, string>>(LAST_KNOWN_KEY);
    lastKnown = raw ?? {};
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return NextResponse.json(
      { ok: false, error: "redis_hgetall_failed", message: err },
      { status: 502 },
    );
  }

  const drops = detectDrops(current, lastKnown);

  if (drops.length === 0) {
    return NextResponse.json({ ok: true, drops: 0 });
  }

  // 3) Pull subscriber list. For now: ALL subscribers receive ALL drops.
  //    TODO(watchlist): once the per-site watchlist feature exists, filter
  //    here — e.g. `subscribers:watchlist:<slug>` smembers, falling back to
  //    `subscribers:emails` for the "all sites" tier. Voting on this lives
  //    on /roadmap.
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { ok: false, error: "resend_not_configured", message: "Set RESEND_API_KEY in Vercel env vars." },
      { status: 503 },
    );
  }

  const subscribers = await r.smembers("subscribers:emails");
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    // No subscribers to alert — but we still want to update the last-known
    // map so the FIRST subscriber to ever sign up isn't blasted with months
    // of backlog drops on the next cron tick.
    await persistLastKnown(r, drops);
    return NextResponse.json({
      ok: true,
      drops: drops.length,
      sent: 0,
      totalSubscribers: 0,
      note: "no_subscribers_recorded_last_known",
    });
  }

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const tgEnabled = isTelegramConfigured();

  // Build a slug→Factory lookup once so per-send we have factoryName cheaply.
  const factoryBySlug = new Map(factories.map((f) => [f.slug, f]));

  let emailSent = 0;
  let emailFailed = 0;
  let tgSent = 0;
  let tgSkipped = 0;
  const failures: Array<{ email: string; slug: string; reason: string }> = [];

  for (const drop of drops) {
    const factory = factoryBySlug.get(drop.slug);
    if (!factory) {
      // Defensive — detector emitted a slug not in factories. Shouldn't
      // happen because we built `current` from factories, but log and skip
      // rather than crash.
      continue;
    }
    const factoryName = factory.name;
    const subject = `GIGASCOPE · new ${factoryName} satellite frame (${drop.latest})`;

    for (const email of subscribers) {
      try {
        await resend.emails.send({
          from: `GIGASCOPE <${from}>`,
          to: email,
          subject,
          react: SatelliteDropEmail({
            email,
            factoryName,
            slug: drop.slug,
            latest: drop.latest,
            previous: drop.previous,
            daysGap: drop.daysGap,
          }),
          headers: unsubHeaders(email),
          tags: [
            ...emailTags("satellite-drop"),
            { name: "site", value: drop.slug },
          ],
        });
        void recordEmailSent(r, "satellite-drop");
        emailSent += 1;
      } catch (e) {
        emailFailed += 1;
        const err = e instanceof Error ? e.message.slice(0, 120) : "unknown";
        failures.push({ email, slug: drop.slug, reason: err });
        // Keep going — one bad address shouldn't gate the rest. We still
        // persist last-known at the end because the per-site latest is
        // global, not per-recipient. A retry mechanism for individual
        // sends would need a different schema and isn't worth it for v1.
      }

      // Opportunistic Telegram. No flag — the email send is the source of
      // truth; if Telegram fails we silently skip rather than re-send email.
      if (tgEnabled) {
        const chatIdRaw = await r.get(`telegram:chat:${email}`);
        const chatId = typeof chatIdRaw === "string" ? chatIdRaw : null;
        if (!chatId) {
          tgSkipped += 1;
        } else {
          const ok = await sendTelegramMessage(
            chatId,
            formatTelegramText(drop, factoryName),
            { disable_web_page_preview: true },
          );
          if (ok) tgSent += 1;
          else tgSkipped += 1;
        }
      }
    }
  }

  // 4) Persist new last-known dates AFTER all sends. Doing this last means
  //    that if the whole route crashes (e.g. Vercel timeout) the next run
  //    will detect the same drops and retry — at the cost of possible
  //    duplicate sends to recipients we already reached. Trade-off chosen
  //    deliberately: a duplicate alert is recoverable, a silently-missed
  //    drop is not.
  try {
    await persistLastKnown(r, drops);
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return NextResponse.json(
      {
        ok: false,
        error: "hset_failed_after_sends",
        message: err,
        drops: drops.length,
        emailSent,
        emailFailed,
        warning: "sends succeeded but last-known not updated; next run will retry",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    drops: drops.length,
    sent: emailSent,
    failed: emailFailed,
    totalSubscribers: subscribers.length,
    telegram: { enabled: tgEnabled, sent: tgSent, skipped: tgSkipped },
    dropSamples: drops.slice(0, 5).map((d) => ({
      slug: d.slug,
      previous: d.previous,
      latest: d.latest,
      daysGap: Number.isFinite(d.daysGap) ? d.daysGap : null,
    })),
    failureSamples: failures.slice(0, 5),
  });
}

async function persistLastKnown(r: Redis, drops: DropDetected[]): Promise<void> {
  if (drops.length === 0) return;
  // Build the HSET payload as a single map so we do one round-trip rather
  // than N independent HSETs.
  const fields: Record<string, string> = {};
  for (const d of drops) fields[d.slug] = d.latest;
  await r.hset(LAST_KNOWN_KEY, fields);
}

export async function GET(req: Request) {
  // Vercel cron triggers GET; delegate to the same handler used by manual POST.
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
