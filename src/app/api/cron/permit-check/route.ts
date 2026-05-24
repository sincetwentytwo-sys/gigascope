import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import PermitAlertEmail from "@/emails/permit-alert";
import { fetchTravisPermits, filterGigaTexas, type Permit } from "@/lib/permits";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Same convention as digest/drips/catalyst-alerts: fail closed in prod,
    // allow in dev for manual curl-based testing.
    return process.env.NODE_ENV !== "production";
  }
  const got = req.headers.get("authorization");
  if (!got) return false;
  return got === `Bearer ${expected}` || got === expected;
}

// 90 days is plenty for the dedup window. Tesla Road permits never re-issue
// under the same ID, so the TTL is just hygiene to keep Redis tidy.
const SEEN_TTL_SECONDS = 90 * 24 * 60 * 60;
const SEEN_KEY_PREFIX = "permit:seen:";

/** PoC recipient — owner only. Subscriber fan-out is explicitly out of scope. */
const POC_RECIPIENT = "sincetwentytwo@gmail.com";

interface CheckResult {
  ok: true;
  checked: number;
  new: number;
  alerted: 0 | 1;
  dryRun?: boolean;
  newPermits?: Permit[];
  allPermits?: Permit[];
}

async function handle(req: Request): Promise<NextResponse> {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  // 1) Fetch + filter — works without Redis or Resend so dry-run can validate
  //    the pipeline even before infra envs are set.
  let fetched: Permit[];
  try {
    fetched = await fetchTravisPermits();
  } catch (e) {
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return NextResponse.json({ ok: false, error: "fetch_failed", message: err }, { status: 502 });
  }
  const gigaTexas = filterGigaTexas(fetched);

  // Dry-run: don't touch Redis, don't send email. Return everything for inspection.
  if (dryRun) {
    return NextResponse.json({
      ok: true,
      checked: gigaTexas.length,
      new: gigaTexas.length, // unknowable without Redis — report total filtered
      alerted: 0,
      dryRun: true,
      newPermits: gigaTexas,
      allPermits: fetched,
    } satisfies CheckResult);
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  // 2) Dedup via Upstash. SET-NX EX 90d — atomic claim so concurrent runs
  //    (manual curl + scheduled cron) can't double-alert. Same pattern as
  //    drips/send and catalyst-alerts.
  const newPermits: Permit[] = [];
  for (const p of gigaTexas) {
    const key = `${SEEN_KEY_PREFIX}${p.id}`;
    const acquired = await r.set(key, "1", { nx: true, ex: SEEN_TTL_SECONDS });
    if (acquired) newPermits.push(p);
  }

  if (newPermits.length === 0) {
    return NextResponse.json({
      ok: true,
      checked: gigaTexas.length,
      new: 0,
      alerted: 0,
    } satisfies CheckResult);
  }

  // 3) Send. Single digest email to the owner — NOT subscriber fan-out (PoC).
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // We already claimed the seen flags above. Release them so a later run
    // can retry once Resend is configured.
    for (const p of newPermits) {
      await r.del(`${SEEN_KEY_PREFIX}${p.id}`);
    }
    return NextResponse.json(
      { ok: false, error: "resend_not_configured", message: "Set RESEND_API_KEY in Vercel env vars." },
      { status: 503 },
    );
  }

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const subject = `🏗 Giga Texas — ${newPermits.length} new permit${newPermits.length === 1 ? "" : "s"} filed`;
  const generatedAt = new Date().toISOString();

  let alerted: 0 | 1 = 0;
  try {
    await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to: POC_RECIPIENT,
      subject,
      react: PermitAlertEmail({ permits: newPermits, generatedAt }),
    });
    alerted = 1;
  } catch (e) {
    // Release the flags so the next run can retry.
    for (const p of newPermits) {
      await r.del(`${SEEN_KEY_PREFIX}${p.id}`);
    }
    const err = e instanceof Error ? e.message.slice(0, 200) : "unknown";
    return NextResponse.json(
      { ok: false, error: "send_failed", message: err, checked: gigaTexas.length, new: newPermits.length },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    checked: gigaTexas.length,
    new: newPermits.length,
    alerted,
  } satisfies CheckResult);
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
