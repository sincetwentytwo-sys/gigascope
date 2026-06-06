import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  verifyLemonSignature,
  planFromVariantName,
  emailFromLemonPayload,
  isTestModePayload,
} from "./lemonsqueezy";

const SECRET = "test_signing_secret_123";
function sign(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

describe("verifyLemonSignature", () => {
  const body = JSON.stringify({ meta: { event_name: "subscription_created" } });

  it("accepts a correct signature", () => {
    expect(verifyLemonSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("rejects a signature made with the wrong secret", () => {
    expect(verifyLemonSignature(body, sign(body, "wrong"), SECRET)).toBe(false);
  });

  it("rejects a tampered body", () => {
    const sig = sign(body);
    expect(verifyLemonSignature(body + "x", sig, SECRET)).toBe(false);
  });

  it("rejects missing signature / secret", () => {
    expect(verifyLemonSignature(body, null, SECRET)).toBe(false);
    expect(verifyLemonSignature(body, sign(body), "")).toBe(false);
    expect(verifyLemonSignature(body, "", SECRET)).toBe(false);
  });

  it("rejects malformed (non-hex) signature without throwing", () => {
    expect(verifyLemonSignature(body, "not-hex-!!", SECRET)).toBe(false);
  });

  it("rejects a wrong-length signature", () => {
    expect(verifyLemonSignature(body, "abcd", SECRET)).toBe(false);
  });
});

describe("planFromVariantName", () => {
  it("maps annual/yearly names to annual", () => {
    expect(planFromVariantName("GIGASCOPE Charter (Annual)")).toBe("annual");
    expect(planFromVariantName("Yearly plan")).toBe("annual");
    expect(planFromVariantName("$90 / yr")).toBe("annual");
  });
  it("defaults to monthly", () => {
    expect(planFromVariantName("GIGASCOPE Charter")).toBe("monthly");
    expect(planFromVariantName("Monthly")).toBe("monthly");
    expect(planFromVariantName(null)).toBe("monthly");
    expect(planFromVariantName(undefined)).toBe("monthly");
  });
});

describe("emailFromLemonPayload", () => {
  it("extracts and normalizes the buyer email", () => {
    expect(
      emailFromLemonPayload({ data: { attributes: { user_email: "  Buyer@Example.COM " } } }),
    ).toBe("buyer@example.com");
  });
  it("returns null when absent or not email-shaped", () => {
    expect(emailFromLemonPayload({})).toBeNull();
    expect(emailFromLemonPayload({ data: { attributes: {} } })).toBeNull();
    expect(emailFromLemonPayload({ data: { attributes: { user_email: "nope" } } })).toBeNull();
  });
});

describe("isTestModePayload", () => {
  it("is true only when test_mode === true", () => {
    expect(isTestModePayload({ data: { attributes: { test_mode: true } } })).toBe(true);
    expect(isTestModePayload({ data: { attributes: { test_mode: false } } })).toBe(false);
    expect(isTestModePayload({ data: { attributes: {} } })).toBe(false);
    expect(isTestModePayload({})).toBe(false);
  });
});
