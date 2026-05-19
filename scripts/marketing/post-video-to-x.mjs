#!/usr/bin/env node
// Posts ONE site's MP4 timelapse to X as a video tweet. Designed to be
// called from the weekly timelapse workflow — rotates through sites by
// ISO week number so every site gets equal airtime over time.
//
// Required env:
//   X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
//   X_VIDEO_AUTOPOST=1   — kill switch (without it, dry-run only)
//
// Optional:
//   FORCE_SLUG=<slug>    — post a specific site (overrides rotation)
//   DRY_RUN=1            — skip actual upload + tweet
import { readFileSync, statSync, openSync, readSync, closeSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import crypto from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..", "..");
const indexPath = resolve(root, "public", "timelapses", "index.json");
const factoriesPath = resolve(root, "public", "data", "factories.json");
const timelapseDir = resolve(root, "public", "timelapses");

const SITE_URL = "https://gigascope-ten.vercel.app";

const COMPANY_TAGS = {
  tesla: "#Tesla #Gigafactory",
  spacex: "#SpaceX",
  xai: "#xAI",
  neuralink: "#Neuralink",
  boring: "#BoringCompany",
  joint: "#Tesla #SpaceX",
};

const creds = {
  consumerKey: process.env.X_CONSUMER_KEY,
  consumerSecret: process.env.X_CONSUMER_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
};
const autoPost = process.env.X_VIDEO_AUTOPOST === "1";
const dryRun = process.env.DRY_RUN === "1";
const forceSlug = process.env.FORCE_SLUG || null;

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
  // For multipart, body params are NOT included in signature base
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

async function mediaInit(totalBytes) {
  const body = { command: "INIT", media_type: "video/mp4", total_bytes: String(totalBytes), media_category: "tweet_video" };
  const auth = oauthHeader({ method: "POST", url: MEDIA_URL, bodyParams: body });
  const res = await fetch(MEDIA_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`INIT ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.media_id_string;
}

async function mediaAppend(mediaId, chunk, segmentIndex) {
  const auth = oauthHeader({ method: "POST", url: MEDIA_URL, multipart: true });
  const boundary = `----gigascope${crypto.randomBytes(8).toString("hex")}`;
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="command"\r\n\r\nAPPEND\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="media_id"\r\n\r\n${mediaId}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="segment_index"\r\n\r\n${segmentIndex}\r\n` +
    `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="chunk"\r\nContent-Type: application/octet-stream\r\n\r\n`
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([head, chunk, tail]);
  const res = await fetch(MEDIA_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": String(body.length) },
    body,
    signal: AbortSignal.timeout(60000),
  });
  if (res.status !== 204 && !res.ok) throw new Error(`APPEND[${segmentIndex}] ${res.status}: ${await res.text()}`);
}

async function mediaFinalize(mediaId) {
  const body = { command: "FINALIZE", media_id: mediaId };
  const auth = oauthHeader({ method: "POST", url: MEDIA_URL, bodyParams: body });
  const res = await fetch(MEDIA_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`FINALIZE ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function mediaStatus(mediaId) {
  const url = `${MEDIA_URL}?command=STATUS&media_id=${mediaId}`;
  const auth = oauthHeader({ method: "GET", url: MEDIA_URL, bodyParams: { command: "STATUS", media_id: mediaId } });
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: auth },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`STATUS ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function waitForMediaReady(mediaId, finalizeResult) {
  let info = finalizeResult.processing_info;
  if (!info) return; // already ready
  while (info && info.state !== "succeeded") {
    if (info.state === "failed") throw new Error(`Media processing failed: ${JSON.stringify(info)}`);
    await new Promise((r) => setTimeout(r, (info.check_after_secs ?? 2) * 1000));
    const status = await mediaStatus(mediaId);
    info = status.processing_info;
    console.log(`  media ${mediaId}: ${info?.state ?? "ready"}`);
    if (!info) return;
  }
}

async function uploadVideo(filePath) {
  const size = statSync(filePath).size;
  const mediaId = await mediaInit(size);
  console.log(`  INIT ok, media_id=${mediaId}, size=${(size/1024).toFixed(0)}KB`);

  const chunkSize = 1024 * 1024;
  const fd = openSync(filePath, "r");
  try {
    let segIndex = 0;
    let offset = 0;
    while (offset < size) {
      const len = Math.min(chunkSize, size - offset);
      const buf = Buffer.alloc(len);
      readSync(fd, buf, 0, len, offset);
      await mediaAppend(mediaId, buf, segIndex);
      console.log(`  APPEND seg=${segIndex} (${len}B)`);
      segIndex++;
      offset += len;
    }
  } finally {
    closeSync(fd);
  }

  const finalizeResult = await mediaFinalize(mediaId);
  console.log(`  FINALIZE ok`);
  await waitForMediaReady(mediaId, finalizeResult);
  return mediaId;
}

async function postTweet(text, mediaId) {
  const auth = oauthHeader({ method: "POST", url: TWEET_URL });
  const res = await fetch(TWEET_URL, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ text, media: { media_ids: [mediaId] } }),
    signal: AbortSignal.timeout(20000),
  });
  const t = await res.text();
  if (!res.ok) throw new Error(`Tweet ${res.status}: ${t}`);
  return JSON.parse(t);
}

function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function pickSite(factories, index) {
  const available = factories.filter((f) => index[f.slug] && index[f.slug].frames >= 2);
  if (available.length === 0) return null;
  if (forceSlug) {
    return available.find((f) => f.slug === forceSlug) ?? null;
  }
  const week = isoWeekNumber(new Date());
  return available[week % available.length];
}

function withUtm(url, campaign) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=x&utm_medium=social&utm_campaign=${campaign}`;
}

function buildTweetText(site, indexEntry) {
  const tags = COMPANY_TAGS[site.company] ?? "#MuskEmpire";
  const latestYear = indexEntry.latest.slice(0, 4);
  const earliestYear = String(Number(latestYear) - indexEntry.frames + 1);
  const url = withUtm(`${SITE_URL}/site/${site.slug}`, "timelapse");
  return `${site.flag} ${site.name} — ${indexEntry.frames} years of construction in seconds.\n\n${earliestYear} → ${latestYear} (Sentinel-2)\n\n${tags}\n\n${url}`;
}

async function main() {
  if (!existsSync(indexPath)) {
    console.log("No timelapse index — nothing to post");
    return;
  }
  const index = JSON.parse(readFileSync(indexPath, "utf8"));
  const data = JSON.parse(readFileSync(factoriesPath, "utf8"));
  const site = pickSite(data.factories, index);
  if (!site) {
    console.log("No site has >=2 frames yet");
    return;
  }
  const entry = index[site.slug];
  const videoPath = join(timelapseDir, `${site.slug}.mp4`);
  if (!existsSync(videoPath)) {
    console.log(`Video missing for ${site.slug} at ${videoPath}`);
    return;
  }
  const text = buildTweetText(site, entry);
  console.log(`Selected: ${site.slug} (${entry.frames} frames, latest ${entry.latest})`);
  console.log(`Text (${text.length} chars):\n${text}\n`);

  const credsMissing = !creds.consumerKey || !creds.consumerSecret || !creds.accessToken || !creds.accessTokenSecret;
  if (credsMissing) {
    console.log("X credentials not set — skipping");
    return;
  }
  if (!autoPost || dryRun) {
    console.log(`[DRY-RUN] would upload ${videoPath} (${(statSync(videoPath).size/1024).toFixed(0)}KB) and post above tweet`);
    return;
  }

  const mediaId = await uploadVideo(videoPath);
  const result = await postTweet(text, mediaId);
  const tweetId = result?.data?.id ?? null;
  console.log(`✓ posted ${site.slug} → tweet ${tweetId}`);
}

main().catch((err) => {
  console.error("Video poster failed:", err);
  process.exit(1);
});
