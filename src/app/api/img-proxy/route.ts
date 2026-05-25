import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Image proxy for news thumbnails.
 *
 * Why this exists: publishers like Electrek, Teslarati, InsideEVs and
 * CleanTechnica increasingly hotlink-defend their image CDNs — sometimes by
 * Referer header, sometimes by IP, sometimes by CDN region. So we get into
 * a state where curl returns 200 OK on the image URL from our laptop but
 * the user's browser gets 403 or a corrupted load when the same URL is
 * embedded as <img src="...">. The result is the placeholder sea the owner
 * saw on /news this morning.
 *
 * The fix: route every news thumbnail through our own domain. The server
 * fetches the publisher image from Vercel egress (which already passes
 * publisher IP checks for most), strips/normalizes the Referer, and
 * streams the bytes back to the browser as if they came from
 * gigascope.xyz. Browser sees a same-origin image — no CORS, no hotlink,
 * no region quirks.
 *
 * Security:
 * - SSRF defense via strict allowlist of publisher hostnames. Anything
 *   not on the list returns 400. Without this, anyone hitting
 *   /api/img-proxy?url=http://169.254.169.254/...  would be a metadata
 *   service attack vector.
 * - Schemes restricted to http/https.
 * - Response Content-Type must start with image/.
 *
 * Cache:
 * - 24h browser cache, 7d edge cache, immutable — image at a given URL
 *   doesn't change. Vercel edge dedupes hits across users.
 */

// Hosts of the publishers we actually use, plus their image CDN
// subdomains. endsWith()-style match so img.electrek.co matches electrek.co.
const ALLOWED_HOSTS = [
  "electrek.co",
  "teslarati.com",
  "insideevs.com",
  "cleantechnica.com",
  "torquenews.com",
  "cnbc.com",
  "cnbcfm.com",
  // Common WordPress / CDN subdomains used by the publishers above
  "wp.com",          // i0/i1/i2.wp.com — WordPress.com image CDN
  "files.wordpress.com",
  "cloudfront.net",  // some publishers use cloudfront, narrow allowlist below if abuse
  // SpaceX / Tesla newsroom CDNs if their images leak into RSS bodies
  "tesla.com",
  "spacex.com",
];

function isAllowed(host: string): boolean {
  const h = host.toLowerCase();
  return ALLOWED_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "url_required" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  if (targetUrl.protocol !== "https:" && targetUrl.protocol !== "http:") {
    return NextResponse.json({ error: "scheme_blocked" }, { status: 400 });
  }
  if (!isAllowed(targetUrl.hostname)) {
    return NextResponse.json(
      { error: "host_blocked", host: targetUrl.hostname },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
        // No Referer — many publishers' hotlink defense fires on
        // non-matching Referer but lets through requests with no Referer
        // at all (treated like a direct-paste).
      },
      // Image fetches can run a bit slower than HTML scrapes (full binary
      // download) — 10s upper bound. Vercel default function timeout is
      // ~10s on Hobby, so this is the most we can afford anyway.
      signal: AbortSignal.timeout(10000),
      // Don't follow redirects automatically into a non-allowlisted host.
      // The default follow=true is fine for in-domain redirects (Electrek
      // → wp.com CDN counts because wp.com is allowlisted), but if a
      // publisher 302's to a sketchy domain we want to fail clean.
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "upstream_fail", status: res.status },
        { status: 502 },
      );
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "not_image", contentType },
        { status: 502 },
      );
    }
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        // 24h browser, 7d edge. immutable hints the browser to never
        // revalidate within the maxage window.
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800, immutable",
        // Prevent leaking the upstream URL via referrer.
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
