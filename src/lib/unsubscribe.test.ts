// Tests for unsubscribe — HMAC token signing + constant-time verification +
// URL/header construction. Security-critical: a verification bypass here
// would let attackers unsubscribe arbitrary addresses.
//
// We pin CRON_SECRET to a known value so the expected token hex is stable
// across test runs.

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  unsubscribeToken,
  verifyUnsubscribeToken,
  unsubscribeUrl,
  unsubHeaders,
} from "./unsubscribe";

const TEST_SECRET = "test-secret-do-not-use-in-prod";
let originalSecret: string | undefined;

beforeAll(() => {
  originalSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = TEST_SECRET;
});

afterAll(() => {
  if (originalSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = originalSecret;
});

describe("unsubscribeToken", () => {
  it("returns a 16-hex-char string", () => {
    const t = unsubscribeToken("a@b.com");
    expect(t).toMatch(/^[0-9a-f]{16}$/);
  });

  it("is deterministic for the same email", () => {
    const a = unsubscribeToken("user@example.com");
    const b = unsubscribeToken("user@example.com");
    expect(a).toBe(b);
  });

  it("is case-insensitive (email is lowercased before HMAC)", () => {
    expect(unsubscribeToken("User@Example.COM")).toBe(unsubscribeToken("user@example.com"));
  });

  it("differs across emails", () => {
    expect(unsubscribeToken("a@b.com")).not.toBe(unsubscribeToken("c@d.com"));
  });
});

describe("verifyUnsubscribeToken", () => {
  it("accepts the token its own generator produced", () => {
    const token = unsubscribeToken("user@example.com");
    expect(verifyUnsubscribeToken("user@example.com", token)).toBe(true);
  });

  it("rejects a wrong token of the right length", () => {
    expect(verifyUnsubscribeToken("user@example.com", "0".repeat(16))).toBe(false);
  });

  it("rejects a token of the wrong length without throwing", () => {
    expect(verifyUnsubscribeToken("user@example.com", "too-short")).toBe(false);
    expect(verifyUnsubscribeToken("user@example.com", "0".repeat(64))).toBe(false);
  });

  it("rejects when email is changed (token bound to email)", () => {
    const token = unsubscribeToken("user@example.com");
    expect(verifyUnsubscribeToken("other@example.com", token)).toBe(false);
  });

  it("accepts case variants of the same email (verification matches lowercased)", () => {
    const token = unsubscribeToken("user@example.com");
    expect(verifyUnsubscribeToken("USER@Example.COM", token)).toBe(true);
  });

  it("rejects malformed token without throwing", () => {
    expect(verifyUnsubscribeToken("user@example.com", "")).toBe(false);
    expect(verifyUnsubscribeToken("user@example.com", "not-hex-but-16ch")).toBe(false);
  });
});

describe("unsubscribeUrl", () => {
  it("returns an HTTPS URL with email + token params", () => {
    const url = unsubscribeUrl("user+tag@example.com");
    expect(url).toMatch(/^https:\/\/gigascope\.xyz\/api\/unsubscribe\?/);
    // The `+` in the email gets percent-encoded.
    expect(url).toContain("email=user%2Btag%40example.com");
    expect(url).toMatch(/token=[0-9a-f]{16}$/);
  });
});

describe("unsubHeaders", () => {
  it("emits the One-Click List-Unsubscribe pair Gmail/Yahoo require", () => {
    const h = unsubHeaders("user@example.com");
    expect(h["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(h["List-Unsubscribe"]).toContain("<https://gigascope.xyz/api/unsubscribe");
    expect(h["List-Unsubscribe"]).toContain("<mailto:unsubscribe@gigascope.xyz");
  });
});
