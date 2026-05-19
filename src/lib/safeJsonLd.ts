// Safely embed JSON in a <script> tag. Escapes characters that could break
// out of the script context: </script> termination and JS line terminators
// (U+2028, U+2029) which are valid in JSON but invalid in JS string literals.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(" ", "g"), "\\u2028")
    .replace(new RegExp(" ", "g"), "\\u2029");
}
