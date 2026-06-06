import { describe, it, expect, beforeEach } from "vitest";
import type { Redis } from "@upstash/redis";
import {
  activateCharterMember,
  revokeCharterMember,
  getCharterRecipients,
} from "./charterMembership";

// Minimal in-memory stand-in for the subset of the Upstash Redis API the
// charter-membership helpers touch: SET (sadd/srem/smembers), HASH (hset),
// ZSET (zadd), and a plain INT (incr). Enough to assert the fulfillment
// semantics — idempotent activation, HWM counter, set membership gating.
function makeRedis() {
  const sets = new Map<string, Set<string>>();
  const hashes = new Map<string, Record<string, unknown>>();
  const ints = new Map<string, number>();
  const zsets = new Map<string, Map<string, number>>();

  const mock = {
    async sadd(key: string, ...members: string[]) {
      let s = sets.get(key);
      if (!s) sets.set(key, (s = new Set()));
      let added = 0;
      for (const m of members) {
        if (!s.has(m)) {
          s.add(m);
          added++;
        }
      }
      return added;
    },
    async srem(key: string, ...members: string[]) {
      const s = sets.get(key);
      if (!s) return 0;
      let removed = 0;
      for (const m of members) if (s.delete(m)) removed++;
      return removed;
    },
    async smembers(key: string) {
      return Array.from(sets.get(key) ?? []);
    },
    async hset(key: string, obj: Record<string, unknown>) {
      const h = hashes.get(key) ?? {};
      Object.assign(h, obj);
      hashes.set(key, h);
      return Object.keys(obj).length;
    },
    async hget(key: string, field: string) {
      return hashes.get(key)?.[field] ?? null;
    },
    async incr(key: string) {
      const v = (ints.get(key) ?? 0) + 1;
      ints.set(key, v);
      return v;
    },
    async zadd(key: string, item: { score: number; member: string }) {
      let z = zsets.get(key);
      if (!z) zsets.set(key, (z = new Map()));
      z.set(item.member, item.score);
      return 1;
    },
    // test-only inspectors
    _count: (key: string) => ints.get(key) ?? 0,
    _hash: (key: string) => hashes.get(key),
  };
  return mock;
}

let r: ReturnType<typeof makeRedis>;
beforeEach(() => {
  r = makeRedis();
});

describe("activateCharterMember", () => {
  it("marks a new member pro/charter, adds to both sets, bumps HWM once", async () => {
    const isNew = await activateCharterMember(r as unknown as Redis, {
      email: "Buyer@Example.com",
      plan: "monthly",
      source: "lemonsqueezy",
      lsSubscriptionId: "sub_1",
    });
    expect(isNew).toBe(true);
    expect(await getCharterRecipients(r as unknown as Redis)).toEqual(["buyer@example.com"]);
    expect(await r.smembers("subscribers:emails")).toEqual(["buyer@example.com"]);
    expect(r._count("subscribers:charter:count")).toBe(1);
    const h = r._hash("subscriber:buyer@example.com");
    expect(h?.tier).toBe("pro");
    expect(h?.charterMember).toBe(true);
    expect(h?.plan).toBe("monthly");
    expect(h?.lsSubscriptionId).toBe("sub_1");
  });

  it("is idempotent — re-activating the same member does NOT double-count", async () => {
    await activateCharterMember(r as unknown as Redis, { email: "a@b.com", plan: "monthly", source: "lemonsqueezy" });
    const second = await activateCharterMember(r as unknown as Redis, { email: "a@b.com", plan: "monthly", source: "lemonsqueezy" });
    expect(second).toBe(false);
    expect(r._count("subscribers:charter:count")).toBe(1);
  });

  it("counts distinct members separately", async () => {
    await activateCharterMember(r as unknown as Redis, { email: "a@b.com", plan: "monthly", source: "stripe" });
    await activateCharterMember(r as unknown as Redis, { email: "c@d.com", plan: "annual", source: "stripe" });
    expect(r._count("subscribers:charter:count")).toBe(2);
    expect((await getCharterRecipients(r as unknown as Redis)).sort()).toEqual(["a@b.com", "c@d.com"]);
  });

  it("ignores an empty email", async () => {
    const isNew = await activateCharterMember(r as unknown as Redis, { email: "   ", plan: "monthly", source: "stripe" });
    expect(isNew).toBe(false);
    expect(r._count("subscribers:charter:count")).toBe(0);
  });
});

describe("revokeCharterMember", () => {
  it("removes from the active charter set + flips flag, leaves HWM + emails intact", async () => {
    await activateCharterMember(r as unknown as Redis, { email: "a@b.com", plan: "monthly", source: "lemonsqueezy" });
    await revokeCharterMember(r as unknown as Redis, "A@B.com");
    expect(await getCharterRecipients(r as unknown as Redis)).toEqual([]);
    expect(await r.smembers("subscribers:emails")).toEqual(["a@b.com"]); // keeps free digest
    expect(r._count("subscribers:charter:count")).toBe(1); // HWM never decremented
    expect(r._hash("subscriber:a@b.com")?.charterMember).toBe(false);
  });
});

describe("getCharterRecipients", () => {
  it("returns [] when no one has paid (charter-only emails go to nobody pre-launch)", async () => {
    expect(await getCharterRecipients(r as unknown as Redis)).toEqual([]);
  });
});
