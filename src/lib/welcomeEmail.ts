// Welcome email sender — extracted from /api/subscribe so both the public
// signup route AND the payment webhooks (which create a paid subscriber the
// signup route never sees) can send the right welcome.
//
// Free signups get the "you're on the daily digest" welcome; paid/charter
// members (set only by a verified payment webhook) get the charter welcome.

import { Resend } from "resend";
import type { Redis } from "@upstash/redis";
import WelcomeEmail from "@/emails/welcome";
import { unsubHeaders } from "@/lib/unsubscribe";
import { emailTags, recordEmailSent } from "@/lib/emailMetrics";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * Best-effort welcome send. Never throws — returns false on any failure so the
 * caller (subscribe POST / payment webhook) never fails over a welcome email.
 * Bumps the "welcome" metric counter when a Redis handle is provided.
 */
export async function sendWelcomeEmail(
  email: string,
  tier: "free" | "pro" | "terminal",
  r: Redis | null,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? "digest@gigascope.xyz";
  const subject =
    tier === "free"
      ? "You're on the GIGASCOPE daily digest"
      : "You're a charter member — $9/mo locked for life";
  try {
    await resend.emails.send({
      from: `GIGASCOPE <${from}>`,
      to: email,
      subject,
      react: WelcomeEmail({ email, tier }),
      headers: unsubHeaders(email),
      tags: emailTags("welcome"),
    });
    if (r) void recordEmailSent(r, "welcome");
    return true;
  } catch (e) {
    console.error("resend_send_failed", e);
    return false;
  }
}
