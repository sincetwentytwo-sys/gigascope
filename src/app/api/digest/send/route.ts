import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// TODO: add HTTPS one-click unsub at /api/unsubscribe?email=X&token=Y, then add second URL form + List-Unsubscribe-Post header.
const UNSUB_HEADERS = {
  "List-Unsubscribe": "<mailto:unsubscribe@gigascope.xyz?subject=unsubscribe>",
};

function authorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // In production, fail closed. In dev/local, allow for manual testing.
    return process.env.NODE_ENV !== "production";
  }
  const got = req.headers.get("authorization");
  if (!got) return false;
  return got === `Bearer ${expected}` || got === expected;
}

function renderHtml(data: {
  upcomingCatalysts: Array<{ symbol: string; date: string; label: string }>;
  freshNews: Array<{ symbol: string; title: string; link: string }>;
}): string {
  const cat = data.upcomingCatalysts
    .slice(0, 8)
    .map(
      (c) =>
        `<tr><td style="padding:6px 8px;font-family:monospace;font-size:11px;color:#86868b">${c.date}</td><td style="padding:6px 8px;font-size:14px"><b>${c.symbol}</b> &mdash; ${c.label}</td></tr>`,
    )
    .join("");
  const news = data.freshNews
    .slice(0, 6)
    .map(
      (n) =>
        `<li style="margin:6px 0;font-size:13px;line-height:1.4"><a href="${n.link}" style="color:#0066cc;text-decoration:none"><b>[${n.symbol}]</b> ${n.title}</a></li>`,
    )
    .join("");
  return `<!doctype html><html><body style="font-family:-apple-system,system-ui,sans-serif;color:#1d1d1f;max-width:600px;margin:0 auto;padding:24px">
    <h1 style="font-size:22px;margin:0 0 8px">GIGASCOPE digest</h1>
    <div style="color:#86868b;font-size:13px;margin-bottom:24px">Watch Musk's empire get built, one satellite frame at a time · <a href="https://gigascope.xyz" style="color:#86868b">gigascope.xyz</a></div>
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#86868b;margin:24px 0 8px">Catalysts ahead</h2>
    <table style="width:100%;border-collapse:collapse">${cat || '<tr><td style="padding:8px;color:#86868b;font-size:13px">No upcoming catalysts in window.</td></tr>'}</table>
    <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.05em;color:#86868b;margin:24px 0 8px">Last 24h news</h2>
    <ul style="padding-left:18px;margin:0">${news || '<li style="color:#86868b">Quiet news cycle.</li>'}</ul>
    <hr style="margin:24px 0;border:none;border-top:1px solid #e5e5e7" />
    <div style="font-size:11px;color:#86868b">
      You're receiving this because you signed up at gigascope.xyz. Forward freely.
      <br/><a href="https://gigascope.xyz" style="color:#86868b">Open the Atlas</a> &middot; <a href="https://gigascope.xyz/investor" style="color:#86868b">Investor tier</a>
    </div>
  </body></html>`;
}

async function fetchDigest(origin: string): Promise<{
  upcomingCatalysts: Array<{ symbol: string; date: string; label: string }>;
  freshNews: Array<{ symbol: string; title: string; link: string }>;
}> {
  const res = await fetch(`${origin}/api/digest`, { cache: "no-store" });
  return res.json();
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ ok: false, error: "resend_not_configured", message: "Set RESEND_API_KEY in Vercel env vars." }, { status: 503 });
  }

  const r = getRedis();
  if (!r) {
    return NextResponse.json({ ok: false, error: "redis_not_configured" }, { status: 503 });
  }

  const subscribers = await r.smembers("subscribers:emails");
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: "no_subscribers" });
  }

  const origin = new URL(req.url).origin;
  const digest = await fetchDigest(origin);
  const html = renderHtml(digest);
  const from = process.env.DIGEST_FROM ?? "GIGASCOPE <digest@gigascope.xyz>";
  const subject = `GIGASCOPE — ${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} digest`;

  let sent = 0;
  let failed = 0;
  // Resend supports up to 50 recipients per batch via /emails/batch.
  // For simplicity, fire individually in chunks to respect rate limits.
  for (let i = 0; i < subscribers.length; i += 5) {
    const chunk = subscribers.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async (to) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ from, to, subject, html, headers: UNSUB_HEADERS }),
          });
          return res.ok;
        } catch {
          return false;
        }
      }),
    );
    sent += results.filter(Boolean).length;
    failed += results.filter((x) => !x).length;
    if (i + 5 < subscribers.length) await new Promise((r) => setTimeout(r, 1100));
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}

export async function GET(req: Request) {
  // Convenience: GET also triggers send so Vercel cron (which sends GET) works.
  return POST(req);
}
