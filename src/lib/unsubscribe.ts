import crypto from "node:crypto";

// HMAC-SHA256 truncated to 16 hex chars (64-bit). Sufficient against guessing
// because there's no oracle to brute-force against — a bad token returns the
// same 401 page regardless of which byte is wrong. Secret is CRON_SECRET (the
// only long-lived server-side secret we already have); rotating it invalidates
// every existing unsubscribe link, which is acceptable (re-sent on next email).
export function unsubscribeToken(email: string): string {
  const secret = process.env.CRON_SECRET ?? "dev-only-unsafe";
  return crypto
    .createHmac("sha256", secret)
    .update(email.toLowerCase())
    .digest("hex")
    .slice(0, 16);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = unsubscribeToken(email);
  // timingSafeEqual requires equal-length buffers — bail before the call if
  // lengths differ so we don't throw on malformed input.
  if (token.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string): string {
  const token = unsubscribeToken(email);
  const e = encodeURIComponent(email);
  return `https://gigascope.xyz/api/unsubscribe?email=${e}&token=${token}`;
}

// Per-recipient List-Unsubscribe headers. Includes BOTH the HTTPS one-click
// URL (required by Gmail/Yahoo Feb 2024 bulk-sender rules when paired with
// `List-Unsubscribe-Post: List-Unsubscribe=One-Click`) and a mailto: form for
// older mail clients.
export function unsubHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(email)}>, <mailto:unsubscribe@gigascope.xyz?subject=unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
