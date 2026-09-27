#!/usr/bin/env node
// Posts a hand-written thread to X from a spec folder (owner-approved copy).
//
//   marketing/posts/<name>/post.json
//     { "posts": [ { "text": "...", "media": ["img.png"] }, { "text": "reply" } ] }
//   Each post after the first is a reply to the previous one.
//
// Required env: X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN,
//   X_ACCESS_TOKEN_SECRET, POST_DIR=marketing/posts/<name>
// Posting also needs CONFIRM_POST=1 — otherwise it's a dry run.
//
// Idempotent: writes <POST_DIR>/posted.json with the tweet ids and refuses to
// run again if it exists, so a re-run can't double-post.
import { readFileSync, writeFileSync, existsSync, statSync, appendFileSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import crypto from "node:crypto";

const creds = {
  consumerKey: process.env.X_CONSUMER_KEY,
  consumerSecret: process.env.X_CONSUMER_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
};
const dir = resolve(process.env.POST_DIR ?? "");
const confirm = process.env.CONFIRM_POST === "1";

function percentEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/!/g, "%21").replace(/\*/g, "%2A").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function oauthHeader({ method, url, bodyParams = {}, multipart = false }) {
  const oauthParams = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };
  const sigParams = multipart ? { ...oauthParams } : { ...oauthParams, ...bodyParams };
  const paramString = Object.keys(sigParams).sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(sigParams[k])}`).join("&");
  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(creds.consumerSecret)}&${percentEncode(creds.accessTokenSecret)}`;
  oauthParams.oauth_signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64");
  return "OAuth " + Object.keys(oauthParams).sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`).join(", ");
}

const MEDIA_URL = "https://upload.x.com/1.1/media/upload.json";
const TWEET_URL = "https://api.x.com/2/tweets";
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp4": "video/mp4" };

async function form(command, extra) {
  const body = { command, ...extra };
  const res = await fetch(MEDIA_URL, {
    method: "POST",
    headers: {
      Authorization: oauthHeader({ method: "POST", url: MEDIA_URL, bodyParams: body }),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`${command} ${res.status}: ${await res.text()}`);
  return res.status === 204 ? {} : res.json();
}

async function append(mediaId, chunk, seg) {
  const boundary = `----gigascope${crypto.randomBytes(8).toString("hex")}`;
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="command"\r\n\r\nAPPEND\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="media_id"\r\n\r\n${mediaId}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="segment_index"\r\n\r\n${seg}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="chunk"\r\nContent-Type: application/octet-stream\r\n\r\n`,
  );
  const body = Buffer.concat([head, chunk, Buffer.from(`\r\n--${boundary}--\r\n`)]);
  const res = await fetch(MEDIA_URL, {
    method: "POST",
    headers: {
      Authorization: oauthHeader({ method: "POST", url: MEDIA_URL, multipart: true }),
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
    signal: AbortSignal.timeout(60000),
  });
  if (res.status !== 204 && !res.ok) throw new Error(`APPEND[${seg}] ${res.status}: ${await res.text()}`);
}

async function upload(file) {
  const type = MIME[extname(file).toLowerCase()];
  if (!type) throw new Error(`unsupported media type: ${file}`);
  const buf = readFileSync(file);
  const init = await form("INIT", {
    media_type: type,
    total_bytes: String(buf.length),
    media_category: type === "video/mp4" ? "tweet_video" : "tweet_image",
  });
  const id = init.media_id_string;
  for (let off = 0, seg = 0; off < buf.length; off += 1 << 20, seg++) {
    await append(id, buf.subarray(off, off + (1 << 20)), seg);
  }
  let info = (await form("FINALIZE", { media_id: id })).processing_info;
  while (info && info.state !== "succeeded") {
    if (info.state === "failed") throw new Error(`media failed: ${JSON.stringify(info)}`);
    await new Promise((r) => setTimeout(r, (info.check_after_secs ?? 2) * 1000));
    const res = await fetch(`${MEDIA_URL}?command=STATUS&media_id=${id}`, {
      headers: { Authorization: oauthHeader({ method: "GET", url: MEDIA_URL, bodyParams: { command: "STATUS", media_id: id } }) },
    });
    info = (await res.json()).processing_info;
  }
  console.log(`  media ${file.split(/[\\/]/).pop()} → ${id} (${(buf.length / 1024).toFixed(0)}KB)`);
  return id;
}

async function tweet(text, mediaIds, replyTo) {
  const body = { text };
  if (mediaIds.length) body.media = { media_ids: mediaIds };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };
  const res = await fetch(TWEET_URL, {
    method: "POST",
    headers: { Authorization: oauthHeader({ method: "POST", url: TWEET_URL }), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`tweet ${res.status}: ${t}`);
  return JSON.parse(t).data.id;
}

async function main() {
  const specPath = join(dir, "post.json");
  if (!existsSync(specPath)) throw new Error(`no spec at ${specPath}`);
  const donePath = join(dir, "posted.json");
  if (existsSync(donePath)) {
    console.log(`already posted (${donePath}) — refusing to post again`);
    return;
  }
  const { posts } = JSON.parse(readFileSync(specPath, "utf8"));
  for (const [i, p] of posts.entries()) {
    console.log(`--- post ${i + 1}/${posts.length} (${[...p.text].length} chars, media: ${(p.media ?? []).join(", ") || "none"})`);
    console.log(p.text);
    for (const m of p.media ?? []) statSync(join(dir, m)); // fail fast on a missing file
  }
  if (!confirm) {
    console.log("\n[DRY-RUN] CONFIRM_POST != 1 — nothing posted");
    return;
  }
  if (!creds.consumerKey || !creds.accessToken) throw new Error("X credentials missing");

  const ids = [];
  let prev = null;
  for (const p of posts) {
    const media = [];
    for (const m of p.media ?? []) media.push(await upload(join(dir, m)));
    prev = await tweet(p.text, media, prev);
    ids.push(prev);
    console.log(`✓ posted ${prev}`);
  }
  writeFileSync(donePath, JSON.stringify({ postedAt: new Date().toISOString(), ids }, null, 2) + "\n");
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `ids=${ids.join(",")}\n`);
}

main().catch((err) => {
  console.error("post-thread failed:", err);
  process.exit(1);
});
