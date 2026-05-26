// Tests for safeJsonLd — the function we use to embed JSON-LD in <script>
// tags. The escape contract is small but security-critical, so we pin it
// down with explicit cases.

import { describe, it, expect } from "vitest";
import { safeJsonLd } from "./safeJsonLd";

describe("safeJsonLd", () => {
  it("happy path: JSON-stringifies a plain object", () => {
    const out = safeJsonLd({ a: 1, b: "hello" });
    expect(out).toBe('{"a":1,"b":"hello"}');
  });

  it("escapes < so a </script> sequence inside the value cannot terminate the <script> tag", () => {
    const out = safeJsonLd({ html: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script");
    expect(out).toContain("\\u003c");
  });

  it("escapes U+2028 (LINE SEPARATOR) — valid in JSON but invalid in JS string literals", () => {
    const out = safeJsonLd({ s: "a b" });
    expect(out).toContain("\\u2028");
    expect(out).not.toContain(" ");
  });

  it("escapes U+2029 (PARAGRAPH SEPARATOR) — same hazard as U+2028", () => {
    const out = safeJsonLd({ s: "a b" });
    expect(out).toContain("\\u2029");
    expect(out).not.toContain(" ");
  });

  it("ordinary ASCII whitespace passes through unchanged (regression: a sloppy regex used to match spaces instead of U+2028)", () => {
    const out = safeJsonLd({ s: "hello world  there" });
    // Spaces should appear literally inside the JSON string value.
    expect(out).toContain("hello world");
    expect(out).not.toContain("\\u2028");
  });

  it("returns a string parseable by JSON.parse after un-escaping our additions", () => {
    const original = { msg: "</a> hi   ok   done" };
    const escaped = safeJsonLd(original);
    // The escaped output is valid JS-embedded JSON; JSON.parse should still
    // accept it because \\u003c / \\u2028 / \\u2029 are valid JSON escapes.
    const parsed = JSON.parse(escaped);
    expect(parsed).toEqual(original);
  });
});
