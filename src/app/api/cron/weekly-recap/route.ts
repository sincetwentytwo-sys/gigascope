import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import WeeklyRecapEmail from "@/emails/weekly-recap";
import { unsubHeaders } from "@/lib/unsubscribe";
import { isCronAuthorized } from "@/lib/cronAuth";
import { emailTags, recordEmailSent } from "@/lib/emailMetrics";
import { factories } from "@/data/factories";
import {
  getRecentAnalyses,
  getRecentlyDoneMilestones,
  getUpcomingCatalysts,
} from "@/lib/weeklyRecap";

// Node runtime — `getRecentAnalyses` reads `public/data/analyses.json` via
// `fs.readFileSync`, which the edge runtime would refuse.
export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const authorized = isCronAuthorized;

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "resend_not_configured",
        message: "Set RESEND_API_KEY in Vercel env vars.",
      },
      { status: 503 },
    );
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  const subscribers = await r.smembers("subscribers:emails");
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, note: "no_subscribers" });
  }

  // Build the three feeds ONCE, not per-subscriber. The recap body is
  // identical across recipients — only the unsubscribe headers vary — so
  // we aggregate up-front to keep the per-recipient hot path lean.
  const now = new Date();
  const recentlyDone = getRecentlyDoneMilestones(now, factories);
  const recentAnalyses = getRecentAnalyses(now);
  const upcoming = getUpcomingCatalysts(now, factories, 14);
  const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const weekEndingISO = dateKey;

  const resend = new Resend(resendKey);
  const from = process.env.DIGEST_FROM ?? "GIGASCOPE <digest@gigascope.xyz>";
  const subject = "GIGASCOPE weekly recap — what landed, what's next";
  // Same tag shape as digest/catalyst-alert. Adding the YYYY-MM-DD as a
  // second tag lets the Resend dashboard filter "show me the May 23 recap
  // send wave" without parsing subject lines.
  const tags = [
    ...emailTags("weekly-recap"),
    { name: "date", value: dateKey },
  ];

  let sent = 0;
  let skipped = 0;

  // Mirror the digest send pattern: 5-recipient chunks with a ~1.1s gap
  // between chunks so we stay under Resend's documented 10 req/s soft cap
  // even on multi-thousand-subscriber waves.
  for (let i = 0; i < subscribers.length; i += 5) {
    const chunk = subscribers.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async (to) => {
        try {
          await resend.emails.send({
            from,
            to,
            subject,
            react: WeeklyRecapEmail({
              email: to,
              weekEndingISO,
              recentlyDone,
              recentAnalyses,
              upcoming,
            }),
            headers: unsubHeaders(to),
            tags,
          });
          return true;
        } catch {
          return false;
        }
      }),
    );
    const chunkSent = results.filter(Boolean).length;
    sent += chunkSent;
    skipped += results.length - chunkSent;
    // Fire-and-forget counter bumps; recordEmailSent never throws.
    for (let k = 0; k < chunkSent; k++) void recordEmailSent(r, "weekly-recap");
    if (i + 5 < subscribers.length) await new Promise((r) => setTimeout(r, 1100));
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    total: subscribers.length,
    eligibleMilestones: recentlyDone.length,
    eligibleAnalyses: recentAnalyses.length,
    eligibleUpcoming: upcoming.length,
    weekEndingISO,
  });
}

export async function GET(req: Request) {
  // Vercel cron uses GET — delegate so both work.
  return POST(req);
}
