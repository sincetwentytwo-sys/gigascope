#!/usr/bin/env node
// HTTP smoke sweep for a running GIGASCOPE server (dev or prod build).
// Page list comes from the app's own /sitemap.xml, so new sites/products are
// covered without editing this file. Read-only: never touches cron, subscribe,
// checkout or webhook routes (those send email / hit Stripe).
//
//   node scripts/verify/smoke.mjs                 # http://localhost:3000
//   node scripts/verify/smoke.mjs --base http://localhost:3001
//   node scripts/verify/smoke.mjs --quick         # home + 1 site + 1 product + compare
//   node scripts/verify/smoke.mjs --paths /site/giga-texas,/compare   # just the pages you touched
//
// Exit 0 = every check passed. Prints one line per URL plus a summary.

const args = process.argv.slice(2);
const base = (args[args.indexOf("--base") + 1] && args.includes("--base")
  ? args[args.indexOf("--base") + 1]
  : "http://localhost:3000").replace(/\/$/, "");
const quick = args.includes("--quick");

// Next renders these when a page throws; a 200 with this body is still a failure.
const ERROR_MARKERS = [
  "Application error: a server-side exception",
  "Application error: a client-side exception",
  "Internal Server Error",
  "__next_error__",
  "Unhandled Runtime Error",
];

// Page-specific proof that the real content rendered, not just the shell.
function expectFor(path) {
  if (path === "/") return [/<h1[\s>]/, /\/site\/giga-texas/];
  if (path.startsWith("/site/")) return [/<h1[\s>]/, /Milestone|milestone/];
  if (path.startsWith("/products/")) return [/<h1[\s>]|<h2[\s>]/, /<svg[\s>]/];
  if (path === "/products") return [/<h1[\s>]/, /\/products\/[a-z0-9-]+/];
  if (path === "/compare") return [/Compare imagery/];
  return [/<title>[^<]+<\/title>/];
}

async function get(path, opts = {}) {
  const t = Date.now();
  const res = await fetch(base + path, { redirect: "manual", ...opts });
  const body = res.status === 200 ? await res.text() : "";
  return { status: res.status, body, ms: Date.now() - t, location: res.headers.get("location") };
}

async function main() {
  const sm = await get("/sitemap.xml").catch((e) => ({ status: 0, body: String(e) }));
  if (sm.status !== 200) {
    console.error(`FAIL sitemap.xml status=${sm.status} - is the server up at ${base}?`);
    process.exit(2);
  }
  let paths = [...sm.body.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
  paths = [...new Set(paths)];
  if (args.includes("--paths")) {
    // Git Bash rewrites a leading "/site/x" arg to "C:/Program Files/Git/site/x" - undo that.
    paths = args[args.indexOf("--paths") + 1].split(",").map((s) => s.trim()).filter(Boolean)
      .map((s) => s.replace(/^[A-Za-z]:[\\/].*?[\\/]Git(?=[\\/])/i, "").replace(/\\/g, "/"))
      .map((s) => (s.startsWith("/") ? s : "/" + s));
  } else if (quick) {
    paths = ["/", paths.find((p) => p.startsWith("/site/")), paths.find((p) => p.startsWith("/products/")), "/compare"]
      .filter(Boolean);
  }

  const fails = [];
  for (const p of paths) {
    const r = await get(p).catch((e) => ({ status: 0, body: "", ms: 0, err: String(e) }));
    const problems = [];
    if (r.status !== 200) problems.push(`status ${r.status}${r.err ? " " + r.err : ""}`);
    for (const m of ERROR_MARKERS) if (r.body.includes(m)) problems.push(`error marker "${m}"`);
    if (r.status === 200) for (const re of expectFor(p)) if (!re.test(r.body)) problems.push(`missing ${re}`);
    console.log(`${problems.length ? "FAIL" : "ok  "} ${String(r.status).padEnd(3)} ${String(r.ms).padStart(5)}ms ${p}${problems.length ? "  <- " + problems.join("; ") : ""}`);
    if (problems.length) fails.push(p);
  }

  // Killed pages must keep redirecting (next.config.ts 308s), feed must be XML.
  if (!quick && !args.includes("--paths")) {
    for (const p of ["/news", "/timeline", "/calendar", "/downloads"]) {
      const r = await get(p);
      const ok = r.status === 308 || r.status === 307 || r.status === 301;
      console.log(`${ok ? "ok  " : "FAIL"} ${r.status} redirect ${p} -> ${r.location ?? "-"}`);
      if (!ok) fails.push(p);
    }
    const feed = await get("/feed.xml");
    const ok = feed.status === 200 && /<rss|<feed/.test(feed.body);
    console.log(`${ok ? "ok  " : "FAIL"} ${feed.status} /feed.xml`);
    if (!ok) fails.push("/feed.xml");
  }

  console.log(`\n${fails.length ? "FAILED" : "PASSED"}: ${paths.length - fails.filter((f) => paths.includes(f)).length}/${paths.length} pages` +
    (fails.length ? `, failures: ${fails.join(", ")}` : ""));
  process.exit(fails.length ? 1 : 0);
}

main();
