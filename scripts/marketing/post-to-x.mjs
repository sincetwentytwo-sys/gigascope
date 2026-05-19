#!/usr/bin/env node
// Posts tweet drafts from the latest marketing/drafts/*.md to X via API v2.
// OAuth 1.0a signed (no external deps).
//
// Required env vars (GitHub Secrets):
//   X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
//   X_AUTOPOST=1    (kill switch — without this, runs in dry-run mode)
//
// Optional:
//   POST_LIMIT=2    (max tweets posted per run; default 2)
//   DRAFT_FILE=...  (override the draft to read; default: today's daily draft)
import { readFileSync, writeFileSync, existsSync, appendFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import crypto from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const draftsDir = resolve(root, "marketing", "drafts");
const stateFile = resolve(root, "marketing", "posted-state.json");

const creds = {
  consumerKey: process.env.X_CONSUMER_KEY,
  consumerSecret: process.env.X_CONSUMER_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
};
const autoPost = process.env.X_AUTOPOST === "1";
const postLimit = Number(process.env.POST_LIMIT ?? 2);

function percentEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
}

function signOAuth1({ method, url, oauthParams }) {
  const sorted = Object.keys(oauthParams).sort();
  const paramString = sorted
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join("&");
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(creds.consumerSecret)}&${percentEncode(creds.accessTokenSecret)}`;
  return crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
}

async function postTweet(text) {
  const url = "https://api.x.com/2/tweets";
  const oauthParams = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };
  oauthParams.oauth_signature = signOAuth1({ method: "POST", url, oauthParams });

  const authHeader = "OAuth " + Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      "User-Agent": "gigascope-marketing/1.0",
    },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(15000),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${responseText.slice(0, 500)}`);
  }
  return JSON.parse(responseText);
}

function parseDraft(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const blocks = [];
  const blockRegex = /### (\S+)[\s\S]*?```\n([\s\S]*?)\n```/g;
  let m;
  while ((m = blockRegex.exec(raw)) !== null) {
    const tag = m[1];
    const body = m[2].trim();
    if (body.length > 0) blocks.push({ tag, body });
  }
  return blocks;
}

function loadState() {
  if (!existsSync(stateFile)) return { posted: [] };
  try { return JSON.parse(readFileSync(stateFile, "utf8")); } catch { return { posted: [] }; }
}

function tweetHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);
}

function pickDraftFile() {
  if (process.env.DRAFT_FILE) return resolve(root, process.env.DRAFT_FILE);
  if (!existsSync(draftsDir)) return null;
  const today = new Date().toISOString().slice(0, 10);
  // Prefer launch drafts first (time-sensitive), then today's daily draft
  const candidates = readdirSync(draftsDir)
    .filter((f) => f.startsWith(today) && f.endsWith(".md"))
    .sort();
  if (candidates.length === 0) return null;
  return resolve(draftsDir, candidates[0]);
}

async function main() {
  const draftFile = pickDraftFile();
  const out = process.env.GITHUB_OUTPUT;
  function emit(k, v) {
    if (out) appendFileSync(out, `${k}=${v}\n`);
  }

  if (!draftFile) {
    console.log("No draft file found for today.");
    emit("posted_count", "0");
    emit("summary", "no draft");
    return;
  }

  const credsMissing = !creds.consumerKey || !creds.consumerSecret || !creds.accessToken || !creds.accessTokenSecret;
  if (credsMissing) {
    console.log("X API credentials not set. Skipping auto-post.");
    emit("posted_count", "0");
    emit("summary", "no credentials");
    return;
  }

  const blocks = parseDraft(draftFile);
  if (blocks.length === 0) {
    console.log(`No tweet blocks found in ${draftFile}`);
    emit("posted_count", "0");
    emit("summary", "empty draft");
    return;
  }

  const state = loadState();
  const postedHashes = new Set(state.posted.map((p) => p.hash));

  const toPost = [];
  for (const b of blocks) {
    if (toPost.length >= postLimit) break;
    const h = tweetHash(b.body);
    if (postedHashes.has(h)) continue;
    if (b.body.length > 280) {
      console.warn(`Skipping over-long block (${b.body.length} chars): ${b.tag}`);
      continue;
    }
    toPost.push({ hash: h, ...b });
  }

  if (toPost.length === 0) {
    console.log("All tweets in this draft already posted.");
    emit("posted_count", "0");
    emit("summary", "all already posted");
    return;
  }

  let posted = 0;
  const errors = [];
  for (const t of toPost) {
    if (!autoPost) {
      console.log(`[DRY-RUN] would post (${t.tag}, ${t.body.length} chars):\n${t.body}\n---`);
      continue;
    }
    try {
      const result = await postTweet(t.body);
      const tweetId = result?.data?.id ?? null;
      state.posted.push({
        hash: t.hash,
        tag: t.tag,
        tweetId,
        postedAt: new Date().toISOString(),
        draftFile: draftFile.replace(root + "/", ""),
      });
      console.log(`✓ posted ${t.tag} → ${tweetId}`);
      posted++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`✗ failed to post ${t.tag}: ${msg}`);
      errors.push(`${t.tag}: ${msg}`);
    }
  }

  if (autoPost) {
    writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }

  const summary = autoPost
    ? `posted ${posted}/${toPost.length}${errors.length ? `, errors: ${errors.length}` : ""}`
    : `dry-run: ${toPost.length} would-post`;
  console.log(summary);
  emit("posted_count", String(posted));
  emit("summary", summary);
  if (errors.length > 0) emit("error", errors.join(" | "));
}

main().catch((err) => {
  console.error("Poster failed:", err);
  const out = process.env.GITHUB_OUTPUT;
  if (out) appendFileSync(out, `posted_count=0\nsummary=fatal: ${String(err).slice(0, 200)}\n`);
  process.exit(1);
});
