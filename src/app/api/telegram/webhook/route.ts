import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import {
  decodeStartPayload,
  isTelegramConfigured,
  sendTelegramMessage,
  verifyLinkToken,
} from "@/lib/telegram";

export const runtime = "nodejs";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// Telegram update shape — narrowed to just the fields we read. The full
// schema (https://core.telegram.org/bots/api#update) is much wider; we
// deliberately ignore everything else (edited_message, callback_query, etc.)
// since this bot only supports text-command interaction.
interface TelegramUpdate {
  update_id?: number;
  message?: {
    message_id?: number;
    from?: { id?: number; username?: string };
    chat?: { id?: number; type?: string };
    text?: string;
  };
}

function ok(): NextResponse {
  // Telegram retries any non-2xx response — always 200 to ack the update,
  // even on logical errors. The reply to the user is the source of truth
  // for "did your /start work?", not the HTTP status.
  return NextResponse.json({ ok: true });
}

/**
 * Verify the incoming POST actually came from Telegram. When the webhook is
 * registered with `secret_token`, Telegram sends that value back in the
 * `X-Telegram-Bot-Api-Secret-Token` header on every update. Without it set,
 * we accept all requests (dev mode), matching the cron auth pattern.
 */
function authorized(req: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    // Fail closed in production. Dev can iterate without the secret.
    return process.env.NODE_ENV !== "production";
  }
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

const HELP_TEXT = [
  "*GIGASCOPE alerts bot*",
  "",
  "Commands:",
  "/start <link> — connect this chat to your email (link generated at gigascope.xyz)",
  "/stop — disconnect this chat",
  "/help — this message",
  "",
  "Open https://gigascope.xyz/account to generate a fresh link.",
].join("\n");

async function handleStart(
  r: Redis,
  chatId: number,
  payload: string,
): Promise<void> {
  // Empty `/start` (no payload) — show help. Telegram sends this when a user
  // opens the bot directly instead of via deep-link.
  if (!payload) {
    await sendTelegramMessage(chatId, HELP_TEXT);
    return;
  }

  const decoded = decodeStartPayload(payload);
  if (!decoded || !verifyLinkToken(decoded.email, decoded.token)) {
    await sendTelegramMessage(
      chatId,
      "Invalid or expired link. Open https://gigascope.xyz/account to generate a fresh link.",
    );
    return;
  }

  const { email } = decoded;

  // Subscriber must actually exist — we don't let arbitrary email holders
  // bind a chat to an address that isn't on our list.
  const isMember = await r.sismember("subscribers:emails", email);
  if (!isMember) {
    await sendTelegramMessage(
      chatId,
      "We couldn't find that email on GIGASCOPE. Subscribe first at https://gigascope.xyz, then link.",
    );
    return;
  }

  // Bidirectional mapping. `telegram:chat:{email}` is what the cron jobs
  // look up. `telegram:email:{chat_id}` lets /stop unlink without the user
  // re-pasting their email.
  await r.set(`telegram:chat:${email}`, String(chatId));
  await r.set(`telegram:email:${chatId}`, email);

  await sendTelegramMessage(
    chatId,
    [
      "*Linked.* You'll get GIGASCOPE catalyst alerts here.",
      "",
      "Send /stop anytime to disconnect.",
    ].join("\n"),
  );
}

async function handleStop(r: Redis, chatId: number): Promise<void> {
  const emailRaw = await r.get(`telegram:email:${chatId}`);
  const email = typeof emailRaw === "string" ? emailRaw : null;
  if (email) {
    await r.del(`telegram:chat:${email}`);
  }
  await r.del(`telegram:email:${chatId}`);
  await sendTelegramMessage(
    chatId,
    "Unlinked. You can re-link anytime from https://gigascope.xyz/account.",
  );
}

export async function POST(req: Request) {
  // Always-200 contract for Telegram. Wrap every code path so a thrown error
  // never causes Telegram to retry-storm us.
  if (!authorized(req)) {
    // Don't reveal whether the secret is right — silently ack to avoid
    // tipping off scanners. But DO log so we notice misconfigured webhooks.
    console.warn("telegram_webhook_unauthorized");
    return ok();
  }

  if (!isTelegramConfigured()) {
    // Webhook can't reply without the bot token. Silently ack.
    return ok();
  }

  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return ok();
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (typeof chatId !== "number" || typeof text !== "string") {
    return ok();
  }

  const r = getRedis();
  if (!r) {
    // Without Redis we can't persist mappings — tell the user something's off
    // but don't expose env details.
    await sendTelegramMessage(chatId, "Service temporarily unavailable. Try again later.");
    return ok();
  }

  const trimmed = text.trim();

  try {
    if (trimmed === "/help" || trimmed === "/start") {
      // Bare /start with no payload — show help.
      await sendTelegramMessage(chatId, HELP_TEXT);
    } else if (trimmed.startsWith("/start ")) {
      const payload = trimmed.slice("/start ".length).trim();
      await handleStart(r, chatId, payload);
    } else if (trimmed === "/stop") {
      await handleStop(r, chatId);
    } else {
      // Any non-command message — give a hint, don't echo or log content.
      await sendTelegramMessage(
        chatId,
        "Unknown command. Send /help for the command list.",
      );
    }
  } catch (e) {
    console.error("telegram_webhook_handler_error", e);
    // Best-effort reply; ignore failures.
    await sendTelegramMessage(
      chatId,
      "Something went wrong. Try again in a moment.",
    ).catch(() => false);
  }

  return ok();
}

// Telegram only POSTs updates. GET is for sanity-pinging the route from a
// browser — returns a static "configured" marker, no secrets leaked.
export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isTelegramConfigured(),
    note: "Telegram webhook endpoint. POST-only for real updates.",
  });
}
