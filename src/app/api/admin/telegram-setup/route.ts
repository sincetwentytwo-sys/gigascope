import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cronAuth";

export const runtime = "nodejs";

// Admin endpoint: configures the Telegram bot webhook. Owner runs this ONCE
// after setting TELEGRAM_BOT_TOKEN + TELEGRAM_WEBHOOK_SECRET in Vercel env.
// Server-side reads the token so it never has to leave Vercel — no need for
// owner to paste a token into a local curl.
//
// CRON_SECRET-gated to match the pattern across our other admin/cron routes.

const authorized = isCronAuthorized;

const WEBHOOK_PATH = "/api/telegram/webhook";

interface TgResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
  error_code?: number;
}

async function tgCall(token: string, method: string, body: Record<string, string>): Promise<TgResponse> {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as TgResponse;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: "telegram_bot_token_missing",
        message: "Set TELEGRAM_BOT_TOKEN in Vercel env first (BotFather → bot token).",
      },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "telegram_webhook_secret_missing",
        message:
          "Set TELEGRAM_WEBHOOK_SECRET in Vercel env. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      },
      { status: 503 },
    );
  }

  // Build the public webhook URL. Vercel sets VERCEL_URL on deployments but
  // that's the unique-per-deploy URL; production webhook needs the stable
  // domain so it survives redeploys.
  const host = process.env.PUBLIC_HOST ?? "gigascope.xyz";
  const webhookUrl = `https://${host}${WEBHOOK_PATH}`;

  // 1) Sanity: who is this bot? Surface botUsername in response so owner can
  //    confirm they're configuring the right bot before traffic starts flowing.
  const me = await tgCall(token, "getMe", {});
  if (!me.ok) {
    return NextResponse.json(
      { ok: false, error: "telegram_getme_failed", detail: me.description },
      { status: 502 },
    );
  }

  // 2) Register the webhook with the secret token. Telegram will include
  //    that secret in X-Telegram-Bot-Api-Secret-Token on every inbound
  //    update — the webhook route verifies it.
  const set = await tgCall(token, "setWebhook", {
    url: webhookUrl,
    secret_token: webhookSecret,
    // drop_pending_updates: true,  // intentionally NOT set — pending /start
    //   messages owner sent during setup should still be delivered
  });
  if (!set.ok) {
    return NextResponse.json(
      { ok: false, error: "telegram_setwebhook_failed", detail: set.description },
      { status: 502 },
    );
  }

  // 3) Echo current webhook state so owner can verify URL + secret_token
  //    are wired correctly. `has_custom_certificate` and `pending_update_count`
  //    are useful diagnostics if /start later seems to hang.
  const info = await tgCall(token, "getWebhookInfo", {});

  return NextResponse.json({
    ok: true,
    bot: me.result,
    webhook: {
      url: webhookUrl,
      configured: set.result,
      info: info.result,
    },
    next_steps: [
      "Open https://gigascope.xyz/account",
      "Tap 'Link Telegram' (subscribe with your owner email first if you haven't)",
      "/start in the deep-link that opens — chat_id gets bound to your email",
      "Re-trigger /api/cron/x-post-reminder — it should now route via telegram",
    ],
  });
}

export async function GET(req: Request) {
  return POST(req);
}
