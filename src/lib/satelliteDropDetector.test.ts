// Unit tests for detectDrops — the pure-function brain behind the hourly
// satellite-check cron. Wrong decisions here mean either (a) subscribers
// get spammed with phantom drops on every hourly run, or (b) genuine new
// frames silently never email. Both ruin the Charter promise.
//
// Structure (house style): happy → edges → failures → invariants.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { detectDrops, type CaptureState, type DropDetected } from "./satelliteDropDetector";

describe("detectDrops", () => {
  // ── Happy path (1) ────────────────────────────────────────────────
  it("happy: latest moved forward from a known previous → emits one drop with positive daysGap", () => {
    const current: CaptureState[] = [
      { slug: "giga-texas", latest: "2026-05-01" },
    ];
    const lastKnown: Record<string, string | null> = { "giga-texas": "2026-02-01" };

    const drops = detectDrops(current, lastKnown);
    expect(drops).toHaveLength(1);
    const d = drops[0];
    expect(d.slug).toBe("giga-texas");
    expect(d.previous).toBe("2026-02-01");
    expect(d.latest).toBe("2026-05-01");
    // Feb 1 → May 1 in 2026 is 89 days (28 + 31 + 30).
    expect(d.daysGap).toBe(89);
  });

  // ── Edge cases (4) ────────────────────────────────────────────────
  it("edge: no previous (first time site seen) → emits drop with Infinity gap (renderable as '—')", () => {
    const current: CaptureState[] = [
      { slug: "starbase", latest: "2026-05-10" },
    ];
    const drops = detectDrops(current, {});
    expect(drops).toEqual<DropDetected[]>([
      { slug: "starbase", previous: null, latest: "2026-05-10", daysGap: Infinity },
    ]);
  });

  it("edge: same date as last known → no drop (the cron MUST be idempotent across hourly runs)", () => {
    const current: CaptureState[] = [
      { slug: "giga-berlin", latest: "2026-04-01" },
    ];
    const drops = detectDrops(current, { "giga-berlin": "2026-04-01" });
    expect(drops).toEqual([]);
  });

  it("edge: current date earlier than lastKnown (corruption / manual rollback) → no drop, silent", () => {
    const current: CaptureState[] = [
      { slug: "giga-shanghai", latest: "2026-01-15" },
    ];
    const drops = detectDrops(current, { "giga-shanghai": "2026-03-01" });
    expect(drops).toEqual([]);
  });

  it("edge: current.latest is null (no timelapse built yet for that slug) → skip silently", () => {
    const current: CaptureState[] = [
      { slug: "no-timelapse-yet", latest: null },
      { slug: "has-timelapse", latest: "2026-05-12" },
    ];
    const drops = detectDrops(current, {});
    // null skipped, the one with a real latest emits as first-seen.
    expect(drops).toHaveLength(1);
    expect(drops[0].slug).toBe("has-timelapse");
  });

  // ── Failure cases (3) ─────────────────────────────────────────────
  it("failure: invalid date string in current → no throw, no drop (skip the bad row)", () => {
    const current: CaptureState[] = [
      { slug: "bad-latest-1", latest: "2026/05/01" },        // wrong separator
      { slug: "bad-latest-2", latest: "May 1 2026" },        // free-form
      { slug: "bad-latest-3", latest: "" },                  // empty string
      { slug: "ok",           latest: "2026-05-01" },        // sanity control
    ];
    const drops = detectDrops(current, {});
    expect(drops).toHaveLength(1);
    expect(drops[0].slug).toBe("ok");
  });

  it("failure: invalid date string in lastKnown → no drop emitted for that slug (avoid forever-fire)", () => {
    // If we emitted on every run because the stored value is corrupt, the
    // hourly cron would spam subscribers forever. Skipping is the safe move.
    const current: CaptureState[] = [
      { slug: "corrupt-stored", latest: "2026-05-01" },
    ];
    const drops = detectDrops(current, { "corrupt-stored": "not-a-date" });
    expect(drops).toEqual([]);
  });

  it("failure: empty current array → empty result, no throw", () => {
    expect(detectDrops([], {})).toEqual([]);
    expect(detectDrops([], { "anything": "2026-01-01" })).toEqual([]);
  });

  // ── Invariants ────────────────────────────────────────────────────
  it("invariant: detectDrops is pure — same inputs return deep-equal outputs across many calls", () => {
    const current: CaptureState[] = [
      { slug: "a", latest: "2026-05-01" },
      { slug: "b", latest: "2026-04-15" },
      { slug: "c", latest: null },
    ];
    const lastKnown = { a: "2026-04-01", b: "2026-04-15" };

    const out1 = detectDrops(current, lastKnown);
    const out2 = detectDrops(current, lastKnown);
    const out3 = detectDrops(current, lastKnown);
    expect(out2).toEqual(out1);
    expect(out3).toEqual(out1);
    // Pin the size so future refactors that accidentally change semantics break loudly.
    expect(out1).toHaveLength(1);
    expect(out1[0].slug).toBe("a");
  });

  it("invariant: output order matches input order (stable for downstream batching)", () => {
    const current: CaptureState[] = [
      { slug: "z", latest: "2026-05-01" },
      { slug: "a", latest: "2026-05-02" },
      { slug: "m", latest: "2026-05-03" },
    ];
    const drops = detectDrops(current, {});
    expect(drops.map((d) => d.slug)).toEqual(["z", "a", "m"]);
  });

  it("invariant: across real factories.json slugs + simulated lastKnown, function never throws", () => {
    // Load the canonical factories list so this test catches schema drift —
    // if someone adds a slug shape we can't handle, this fails loudly.
    const json = JSON.parse(
      readFileSync(resolve(process.cwd(), "public", "data", "factories.json"), "utf8"),
    ) as { factories: Array<{ slug: string }> };
    const current: CaptureState[] = json.factories.map((f, i) => ({
      slug: f.slug,
      // Half get a real date, half get null, scattered to exercise both paths.
      latest: i % 2 === 0 ? "2026-05-20" : null,
    }));
    const lastKnown: Record<string, string | null> = {};
    json.factories.forEach((f, i) => {
      // Stagger stored values: some older, some equal, some corrupt, some missing.
      if (i % 4 === 0) lastKnown[f.slug] = "2026-01-01";
      else if (i % 4 === 1) lastKnown[f.slug] = "2026-05-20";
      else if (i % 4 === 2) lastKnown[f.slug] = "garbage";
      // i % 4 === 3 → leave unset
    });

    expect(() => detectDrops(current, lastKnown)).not.toThrow();
    const drops = detectDrops(current, lastKnown);
    // Sanity: every drop's latest is a valid ISO date and previous is either null or ISO.
    for (const d of drops) {
      expect(d.latest).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (d.previous !== null) {
        expect(d.previous).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
      // daysGap is finite OR Infinity; never NaN or negative.
      expect(d.daysGap === Infinity || (Number.isFinite(d.daysGap) && d.daysGap >= 0)).toBe(true);
    }
  });

  it("invariant: a drop's daysGap is always non-negative (or Infinity for first-seen)", () => {
    const current: CaptureState[] = [
      { slug: "a", latest: "2026-05-01" },
      { slug: "b", latest: "2026-05-02" },
    ];
    const drops = detectDrops(current, { a: "2026-04-30" });
    for (const d of drops) {
      if (d.previous === null) {
        expect(d.daysGap).toBe(Infinity);
      } else {
        expect(d.daysGap).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(d.daysGap)).toBe(true);
      }
    }
  });
});
