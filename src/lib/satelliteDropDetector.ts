// Pure-function detector for "new satellite frame landed" events.
//
// Inputs:
//   - current[]: per-site latest capture dates pulled at call time (from
//     TIMELAPSE_INDEX + captureFreshness — the satellite-check cron builds
//     this array).
//   - lastKnown: map of slug → ISO YYYY-MM-DD strings persisted across runs
//     (Redis hash `satellite:last-known`). First-time-seen sites have no
//     entry; this is treated as a fresh drop with `daysGap = Infinity`.
//
// Output: one DropDetected per site whose `latest` is strictly newer than
// what we previously recorded. Strictly newer = ISO lex-compare under
// YYYY-MM-DD format (which works because that format sorts as date).
//
// Why a pure function:
//   - Cron handler does I/O (Redis reads, Resend sends, Telegram). The
//     decision of "did anything change" should be testable without mocks.
//   - Deterministic + never throws + never reads Date.now() so the same
//     inputs always produce the same outputs. The cron handler is the
//     only place that touches time/IO.
//   - Honest about edge cases: corrupt rows are skipped, never abort.

export interface CaptureState {
  slug: string;
  latest: string | null;
}

export interface DropDetected {
  slug: string;
  previous: string | null;
  latest: string;
  /**
   * Days between `previous` and `latest`. When `previous` is null (first time
   * we've ever seen this site) we use `Infinity` as a sentinel — the email
   * template renders it as "—" rather than a misleading huge number.
   *
   * Always non-negative for real drops because we only emit when the
   * incoming `latest` is strictly greater than the stored `previous`.
   */
  daysGap: number;
}

// YYYY-MM-DD strict matcher. We don't accept ISO datetime or other formats
// because the timelapse index emits this exact shape — anything else is a
// data corruption and should be skipped rather than coerced.
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDateUtc(s: string): number | null {
  const m = s.match(ISO_DATE);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const d = parseInt(m[3], 10);
  // Reject obviously-invalid month/day. We don't try to validate Feb 30 etc
  // — Date.UTC happily normalizes those, and a single bad row only hurts
  // its own daysGap, never the whole run.
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const ts = Date.UTC(y, mo - 1, d);
  if (!Number.isFinite(ts)) return null;
  return ts;
}

function daysBetween(previousIso: string, latestIso: string): number {
  const prev = parseIsoDateUtc(previousIso);
  const next = parseIsoDateUtc(latestIso);
  if (prev === null || next === null) return Infinity;
  const diff = Math.round((next - prev) / 86_400_000);
  // Defense against weirdness — if the math says negative we wouldn't have
  // emitted in the first place (caller checks lex ordering), but pin it as
  // non-negative for the email template's sake.
  return diff < 0 ? Infinity : diff;
}

/**
 * Detect sites whose latest capture date moved forward since the last run.
 *
 * Contract:
 * - Never throws. Bad date strings are silently skipped.
 * - Deterministic: same inputs ⇒ same outputs. No Date.now(), no Math.random.
 * - Order of `current` is preserved in the output (handy for stable email
 *   batching + test snapshots).
 */
export function detectDrops(
  current: CaptureState[],
  lastKnown: Record<string, string | null>,
): DropDetected[] {
  const drops: DropDetected[] = [];

  for (const c of current) {
    // No latest → no drop. Site has no timelapse yet, or the index lookup
    // returned null. Skip silently.
    if (!c.latest) continue;

    // Reject malformed `latest` strings up front. If the incoming value
    // isn't a YYYY-MM-DD date, we can't trust any comparison, so we skip.
    if (!ISO_DATE.test(c.latest)) continue;

    const previous = lastKnown[c.slug] ?? null;

    // First time we've ever seen this slug — treat as a drop with Infinity
    // gap. Email template will render the gap as "—".
    if (previous === null || previous === undefined) {
      drops.push({
        slug: c.slug,
        previous: null,
        latest: c.latest,
        daysGap: Infinity,
      });
      continue;
    }

    // If the stored `previous` is itself corrupt, don't emit — emitting would
    // mean every cron run forever fires this slug because the comparison can
    // never succeed cleanly. Better to silently no-op until the operator
    // fixes the Redis row.
    if (!ISO_DATE.test(previous)) continue;

    // Strict lex compare under YYYY-MM-DD sorts correctly as date order.
    // Equal → no drop. Earlier → no drop (covers corruption / manual rollback
    // / clock drift on the source side).
    if (c.latest <= previous) continue;

    drops.push({
      slug: c.slug,
      previous,
      latest: c.latest,
      daysGap: daysBetween(previous, c.latest),
    });
  }

  return drops;
}
