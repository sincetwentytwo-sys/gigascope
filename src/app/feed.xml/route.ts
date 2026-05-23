// RSS 2.0 feed for /feed.xml. Sources fetchAllNews() from src/lib/rss.ts —
// same parser the on-site feed uses, so /news and /feed.xml stay in sync.
// Cache-Control mirrors /api/news (10 min) — feeds don't need to be tighter.

import { fetchAllNews } from "@/lib/rss";

const SITE_URL = "https://gigascope.xyz";
const FEED_URL = `${SITE_URL}/feed.xml`;
const NEWS_URL = `${SITE_URL}/news`;
const MAX_ITEMS = 20;

export const revalidate = 600;

// XML-escape — '&' must come first or it double-escapes the others.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Wrap free-form text in CDATA so we don't have to escape every special char.
// Defensive: close-CDATA inside the body would prematurely terminate.
function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const all = await fetchAllNews();
  const items = all.slice(0, MAX_ITEMS);
  const lastBuild = new Date(items[0]?.timestamp || Date.now()).toUTCString();

  const itemXml = items
    .map((it) => {
      const pubDate = it.timestamp ? new Date(it.timestamp).toUTCString() : new Date().toUTCString();
      const desc = it.excerpt ?? it.title;
      return [
        "    <item>",
        `      <title>${cdata(it.title)}</title>`,
        `      <link>${esc(it.link)}</link>`,
        `      <guid isPermaLink="true">${esc(it.link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <category>${esc(it.source)}</category>`,
        `      <description>${cdata(desc)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>GIGASCOPE News</title>",
    `    <link>${NEWS_URL}</link>`,
    `    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />`,
    "    <description>Musk-empire construction tracker — daily satellite + news digest</description>",
    "    <language>en</language>",
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    itemXml,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
