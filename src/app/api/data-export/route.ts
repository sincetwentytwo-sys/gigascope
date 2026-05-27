// Data Subject Access Request (DSAR) endpoint.
//
// Implements GDPR Art. 15 (Right of access) + Art. 20 (Right to data portability)
// and PIPA Art. 35 (개인정보의 열람). Returns a JSON dump of every record we
// hold keyed on the requesting email address.
//
// Auth model mirrors `/api/unsubscribe` — the user proves ownership of the
// address by holding a valid HMAC token, which is delivered out-of-band by
// the operator after the user emails a request from the registered address.
// We do NOT auto-generate this URL in transactional emails: the export
// contains potentially sensitive Telegram + Stripe bindings, so a single
// careless email forward shouldn't leak them.
//
// To grant a request: run `node -e "console.log(require('crypto').createHmac('sha256', process.env.CRON_SECRET).update('user@example.com'.toLowerCase()).digest('hex').slice(0,16))"`
// and reply to the user with `https://gigascope.xyz/api/data-export?email=...&token=...`.
//
// The same HMAC seed feeds the unsubscribe path so this stays the only
// long-lived server-side secret (CRON_SECRET). Rotating it invalidates
// existing export URLs.

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

interface ExportRecord {
  email: string;
  exportedAt: string;
  subscriber: Record<string, unknown> | null;
  onActiveMailingList: boolean;
  subscribedAtMs: number | null;
  telegram: { chatId: string | null } | null;
  catalystAlertHistory: string[];
  dripsSent: string[];
  retentionPolicy: string;
  processors: Array<{ name: string; country: string; role: string }>;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = url.searchParams.get("token") ?? "";

  if (!email || !token) {
    return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
  }
  if (!verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // Pull every key we hold this email under. All reads are best-effort —
  // missing keys mean the record simply isn't present.
  const [subscriber, onList, subscribedAt, telegramChatId] = await Promise.all([
    r.hgetall<Record<string, unknown>>(`subscriber:${email}`).catch(() => null),
    r.sismember("subscribers:emails", email).catch(() => 0),
    r.zscore("subscribers:timeline", email).catch(() => null),
    r.get<string>(`telegram:chat:${email}`).catch(() => null),
  ]);

  // Drip flags — fixed key list, no scan needed.
  const dripKeys = ["d3", "d7", "d14", "d21", "d30"] as const;
  const dripFlags = await Promise.all(
    dripKeys.map((k) => r.get(`drip:sent:${email}:${k}`).catch(() => null)),
  );
  const dripsSent = dripKeys.filter((_, i) => dripFlags[i] != null);

  // Catalyst-alert flags — variable per-milestone, requires SCAN.
  const catalystAlertHistory: string[] = [];
  try {
    let cursor: string | number = 0;
    const pattern = `catalyst:alert:sent:${email}:*`;
    do {
      // Upstash SDK returns [nextCursor (string | number), keys (string[])].
      // Normalize to a number for the loop check — "0" / 0 both mean "done".
      const res = (await r.scan(cursor, { match: pattern, count: 100 })) as unknown as [
        string | number,
        string[],
      ];
      cursor = res[0];
      catalystAlertHistory.push(...(res[1] ?? []));
    } while (Number(cursor) !== 0);
  } catch {
    /* best-effort */
  }

  const record: ExportRecord = {
    email,
    exportedAt: new Date().toISOString(),
    subscriber: subscriber && Object.keys(subscriber).length > 0 ? subscriber : null,
    onActiveMailingList: Number(onList) === 1,
    subscribedAtMs: typeof subscribedAt === "number" ? subscribedAt : null,
    telegram: telegramChatId ? { chatId: String(telegramChatId) } : null,
    catalystAlertHistory,
    dripsSent,
    retentionPolicy:
      "Free subscriber records are kept until unsubscribe. Paid subscriber records are kept for the subscription duration + 5 years (Korean tax law). Unsubscribe-event hashes are kept for 1 year as a suppression list. Per-IP rate-limit buckets expire after 1 hour.",
    processors: [
      { name: "Upstash (Redis)", country: "US", role: "storage" },
      { name: "Resend", country: "US", role: "transactional email delivery" },
      { name: "Vercel", country: "US", role: "hosting + serverless functions" },
      { name: "Telegram", country: "global (user-elected only)", role: "chat alerts if user linked" },
    ],
  };

  return NextResponse.json(
    { ok: true, record },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="gigascope-data-${encodeURIComponent(email)}.json"`,
      },
    },
  );
}
