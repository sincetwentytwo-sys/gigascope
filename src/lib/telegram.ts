import { createHmac, timingSafeEqual, createHash } from "node:crypto";

// Telegram Bot HTTP API base. Append `<token>/<method>` for each call.
const BASE_API = "https://api.telegram.org/bot";

function getToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN ?? null;
}

/**
 * Returns true only when the bot token env is set. Every send path in cron
 * routes is gated on this — without it, nothing fires, no errors, no logs.
 */
export function isTelegramConfigured(): boolean {
  return !!getToken();
}

/**
 * Send a Markdown-formatted message to a specific chat_id. Returns true on
 * success. Logs and returns false on any error so callers can opportunistically
 * try Telegram alongside Resend without one path breaking the other.
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  opts?: { parse_mode?: "Markdown" | "HTML"; disable_web_page_preview?: boolean },
): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${BASE_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: opts?.parse_mode ?? "Markdown",
        disable_web_page_preview: opts?.disable_web_page_preview ?? false,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "?");
      console.error("telegram_send_failed", { status: res.status, detail: detail.slice(0, 200) });
      return false;
    }
    return true;
  } catch (e) {
    console.error("telegram_send_exception", e);
    return false;
  }
}

/**
 * Generate a server-verifiable linkage token for an email. The deep-link
 * embeds BOTH a base64url-encoded email AND this HMAC — the webhook can
 * verify the user actually came through our form (not someone guessing
 * other people's emails into the bot).
 *
 * Reuses CRON_SECRET (same secret used by `lib/unsubscribe.ts`) — rotating it
 * invalidates pending link requests, which is acceptable since users can
 * re-generate fresh links from the site.
 */
export function makeLinkToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? "dev-only-unsafe";
  return createHmac("sha256", secret)
    .update(`telegram:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Constant-time verification of a linkage token. Returns false on any malformed
 * input rather than throwing — webhook handlers should not 500 on user typos.
 */
export function verifyLinkToken(email: string, token: string): boolean {
  const expected = makeLinkToken(email);
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

/**
 * Encode an email into a base64url payload safe for Telegram's `?start=`
 * parameter (which is limited to ~64 chars and accepts only [A-Za-z0-9_-]).
 * We pack `email_b64.token` so the webhook can recover the email without a
 * full subscribers scan.
 */
export function encodeStartPayload(email: string): string {
  const token = makeLinkToken(email);
  const emailB64 = Buffer.from(email.toLowerCase(), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${emailB64}.${token}`;
}

/**
 * Decode the start payload back into { email, token }. Returns null on any
 * malformed input. Caller MUST then run `verifyLinkToken` before trusting the
 * email — decoding alone is not authentication.
 */
export function decodeStartPayload(payload: string): { email: string; token: string } | null {
  const dot = payload.indexOf(".");
  if (dot <= 0 || dot === payload.length - 1) return null;
  const emailB64 = payload.slice(0, dot);
  const token = payload.slice(dot + 1);
  // base64url chars only — any other char means tampered/invalid.
  if (!/^[A-Za-z0-9_-]+$/.test(emailB64) || !/^[a-f0-9]+$/.test(token)) return null;
  try {
    const padded = emailB64.replace(/-/g, "+").replace(/_/g, "/");
    // Re-pad to a multiple of 4 for Buffer.from base64 decode.
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const email = Buffer.from(padded + pad, "base64").toString("utf8");
    // Cheap sanity guard — reject anything that doesn't look like an email
    // before passing it to HMAC verify.
    if (!email.includes("@") || email.length > 320) return null;
    return { email: email.toLowerCase(), token };
  } catch {
    return null;
  }
}

/**
 * Construct the t.me deep-link URL a user clicks to start the bot with their
 * one-time linkage payload. botUsername defaults to env (set by owner during
 * activation) — falls back to a placeholder so dev builds don't crash.
 */
export function botStartUrl(
  payload: string,
  botUsername: string = process.env.TELEGRAM_BOT_USERNAME ?? "gigascopebot",
): string {
  return `https://t.me/${botUsername}?start=${encodeURIComponent(payload)}`;
}

/**
 * Short SHA-256 prefix of an email — used as an opaque per-recipient key for
 * logging when we don't want to spill the raw address into structured logs.
 * Not a security primitive; just a privacy nicety.
 */
export function emailHash8(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 8);
}
