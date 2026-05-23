#!/usr/bin/env node
// One-time script the owner runs after creating the bot via @BotFather.
// Reads TELEGRAM_BOT_TOKEN + TELEGRAM_WEBHOOK_SECRET from env (use
// `.env.local` via `node --env-file=.env.local scripts/telegram-setwebhook.mjs`
// or prefix the env on the command line) and registers the production
// webhook with Telegram. Prints the API response.
//
// Usage:
//   TELEGRAM_BOT_TOKEN=xxx TELEGRAM_WEBHOOK_SECRET=yyy \
//     node scripts/telegram-setwebhook.mjs
//
//   # Or with a custom URL (default: https://gigascope.xyz/api/telegram/webhook):
//   WEBHOOK_URL=https://preview-foo.vercel.app/api/telegram/webhook \
//     TELEGRAM_BOT_TOKEN=xxx TELEGRAM_WEBHOOK_SECRET=yyy \
//     node scripts/telegram-setwebhook.mjs

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const webhookUrl = process.env.WEBHOOK_URL ?? "https://gigascope.xyz/api/telegram/webhook";

if (!token) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN env var is required.");
  process.exit(1);
}
if (!secret) {
  console.error("ERROR: TELEGRAM_WEBHOOK_SECRET env var is required.");
  console.error("Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  process.exit(1);
}

console.log(`Registering webhook: ${webhookUrl}`);

const apiUrl = `https://api.telegram.org/bot${token}/setWebhook`;
const body = {
  url: webhookUrl,
  secret_token: secret,
  allowed_updates: ["message"],
  // Drop any unprocessed updates that piled up before the webhook was set —
  // catches the case where the bot was created but never used.
  drop_pending_updates: true,
};

try {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(json, null, 2));

  if (!res.ok || !json.ok) {
    process.exit(2);
  }

  // Print the current webhook info so the owner can sanity-check what
  // Telegram actually has registered (pending updates, last error, etc.).
  console.log("\nWebhook info:");
  const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoJson = await infoRes.json();
  console.log(JSON.stringify(infoJson, null, 2));
} catch (e) {
  console.error("Request failed:", e);
  process.exit(3);
}
