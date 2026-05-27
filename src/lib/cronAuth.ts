// Shared cron / admin route authorization.
//
// Six routes had a copy-pasted `authorized(req)` helper that fell open in
// dev/local when `CRON_SECRET` wasn't set. That's fine on a clean Vercel
// deploy, but on any non-Vercel host (a self-host, a forked deploy, a dev
// machine accidentally exposed to the internet) the cron path becomes a
// free trigger for Resend sends and SODA hits. This module centralizes
// the check and fails closed in EVERY environment unless `CRON_SECRET`
// is actually configured.
//
// For local testing, drop `CRON_SECRET=test` into `.env.local` and
// curl with `-H "Authorization: Bearer test"`.

export interface CronAuthResult {
  ok: boolean;
  reason?: "missing_secret" | "no_authorization_header" | "wrong_secret";
}

export function checkCronAuth(req: Request): CronAuthResult {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Fail closed in EVERY environment. The previous behavior allowed
    // unauthenticated cron triggers whenever NODE_ENV !== "production",
    // which is a real hole on any non-Vercel deploy.
    return { ok: false, reason: "missing_secret" };
  }
  const got = req.headers.get("authorization");
  if (!got) return { ok: false, reason: "no_authorization_header" };
  // Tolerate both "Bearer <secret>" and raw "<secret>" forms — Vercel sends
  // Bearer-prefixed automatically when CRON_SECRET is configured on a
  // /api/cron route, but manual curl tests may send raw.
  if (got === `Bearer ${expected}` || got === expected) return { ok: true };
  return { ok: false, reason: "wrong_secret" };
}

/**
 * Convenience boolean for routes that just want yes/no.
 * Routes that want to log the failure reason should call `checkCronAuth`
 * directly and inspect `result.reason`.
 */
export function isCronAuthorized(req: Request): boolean {
  return checkCronAuth(req).ok;
}
