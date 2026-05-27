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

async function doUnsub(
  email: string,
  token: string,
): Promise<{ ok: boolean; status: number; message: string }> {
  if (!verifyUnsubscribeToken(email, token)) {
    return { ok: false, status: 401, message: "invalid_token" };
  }
  const r = getRedis();
  if (!r) return { ok: false, status: 503, message: "redis_not_configured" };
  try {
    await r.srem("subscribers:emails", email);
    await r.del(`subscriber:${email}`);
    await r.zrem("subscribers:timeline", email);
    // Best-effort: also clear any pending drip-sent flags so a future
    // resubscribe with the same address doesn't get skipped drips. Cheap
    // (5 keys, all may be no-ops) and the alternative is a SCAN.
    await Promise.all([
      r.del(`drip:sent:${email}:d3`),
      r.del(`drip:sent:${email}:d7`),
      r.del(`drip:sent:${email}:d14`),
      r.del(`drip:sent:${email}:d21`),
      r.del(`drip:sent:${email}:d30`),
    ]);
    // Also drop the Telegram binding (if any). The user explicitly asked
    // to leave — keeping the chat_id around would mean alerts still fire on
    // Telegram after they unsubscribed from email.
    try {
      const chatIdRaw = await r.get(`telegram:chat:${email}`);
      const chatId = typeof chatIdRaw === "string" ? chatIdRaw : null;
      await r.del(`telegram:chat:${email}`);
      if (chatId) await r.del(`telegram:email:${chatId}`);
    } catch {
      /* best-effort cleanup — don't block unsub on a stray key */
    }
    // GDPR Art. 17 / PIPA Art. 36 — right to erasure. Catalyst-alert
    // dedup flags are keyed `catalyst:alert:sent:<email>:<key>:<window>`
    // and bind email → milestone-viewed history (= behavioral PII).
    // Sweep via SCAN. Best-effort: if Upstash MATCH pagination misses
    // anything the 400d TTL on each flag is the backstop.
    try {
      // Upstash SDK returns [nextCursor (string | number), keys (string[])].
      // Normalize to a number for the loop check — "0" / 0 both mean "done".
      let cursor: string | number = 0;
      const pattern = `catalyst:alert:sent:${email}:*`;
      do {
        const res = (await r.scan(cursor, { match: pattern, count: 100 })) as unknown as [
          string | number,
          string[],
        ];
        cursor = res[0];
        const keys = res[1] ?? [];
        if (keys.length > 0) await r.del(...keys);
      } while (Number(cursor) !== 0);
    } catch {
      /* best-effort cleanup — flags expire after 400d anyway */
    }
  } catch (e) {
    console.error("unsubscribe_redis_failed", e);
    return { ok: false, status: 500, message: "redis_failed" };
  }
  return { ok: true, status: 200, message: "unsubscribed" };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// One-click POST handler. Gmail/Yahoo's mail proxy hits this with body
// `List-Unsubscribe=One-Click` and no auth. We must unsub immediately and
// return a 2xx; no confirmation page, no login.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!email || !token) {
    return NextResponse.json({ ok: false, error: "missing_params" }, { status: 400 });
  }
  const result = await doUnsub(email, token);
  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.status },
  );
}

// Browser-visit handler. Currently does the unsubscribe inline and renders a
// success page — keeps the link "just works" for users who click it directly.
// TODO: if we ever see bots crawling these links and burning subscribers,
// switch this to a "click to confirm" two-step (the POST one-click path above
// still satisfies Gmail/Yahoo without it).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const token = url.searchParams.get("token") ?? "";

  if (!email || !token) {
    return new Response(
      `<!doctype html><html><head><meta charset="utf-8"><title>GIGASCOPE — Unsubscribe</title></head><body style="font-family:-apple-system,system-ui,sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#0a0a0a;line-height:1.5"><h1 style="font-size:24px;margin:0 0 16px">Bad unsubscribe link</h1><p>The link is missing a parameter. <a href="https://gigascope.xyz">Return to GIGASCOPE</a>.</p></body></html>`,
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const result = await doUnsub(email, token);
  const heading = result.ok ? "You're unsubscribed." : "Unsubscribe failed.";
  const safeEmail = escapeHtml(email);
  const body = result.ok
    ? `<p>${safeEmail} has been removed from GIGASCOPE emails. If this was a mistake, <a href="https://gigascope.xyz">resubscribe at gigascope.xyz</a>.</p>`
    : `<p>${
        result.message === "invalid_token"
          ? "The unsubscribe link is invalid or has expired."
          : "We couldn't process this right now. Reply to any GIGASCOPE email and we'll handle it manually."
      }</p>`;

  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>GIGASCOPE — Unsubscribe</title><meta name="robots" content="noindex,nofollow"></head><body style="font-family:-apple-system,system-ui,sans-serif;max-width:560px;margin:40px auto;padding:24px;color:#0a0a0a;line-height:1.5"><h1 style="font-size:24px;margin:0 0 16px">${heading}</h1>${body}<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0"/><p style="font-size:12px;color:#888">GIGASCOPE — Community project. Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.</p></body></html>`,
    { status: result.status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
