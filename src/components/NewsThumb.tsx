"use client";

import { useState } from "react";

/**
 * Thumbnail wrapper that falls back to a gradient + source label on image
 * load error. Some publications (CNBC's image.cnbcfm.com, certain wp hosts)
 * serve URLs that resolve in their own pages but reject hotlinks from
 * third-party domains, so the og:image scrape returns a real URL but the
 * browser can't actually fetch it. Without this fallback, the card shows
 * the browser's broken-image icon.
 */
export default function NewsThumb({
  src,
  source,
  title,
}: {
  src: string | undefined;
  source: string;
  title: string;
}) {
  const [attempts, setAttempts] = useState(0);

  if (!src || attempts >= 2) {
    // Placeholder for: no RSS image AND no og:image scrape result, OR an
    // image URL that the browser refuses to load (hotlink-blocked, 404,
    // CDN region-locked). Used to render as a flat grey rectangle with
    // just the source name — which read like a broken card. Now it shows
    // the source initials as a monogram + a tiny honest "no thumbnail"
    // label so the user understands it's intentional, not a load failure.
    const initials = source.slice(0, 2).toUpperCase();
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-bg via-surface to-border-custom flex flex-col items-center justify-center gap-1 select-none">
        <span className="text-text/30 font-bold text-5xl tracking-tighter font-mono">
          {initials}
        </span>
        <span className="text-dim text-[10px] font-mono uppercase tracking-widest">
          {source} · no thumbnail
        </span>
      </div>
    );
  }

  // Route the publisher image through /api/img-proxy so the browser sees
  // a same-origin gigascope.xyz URL — bypasses publisher hotlink defenses,
  // CORS quirks, and CDN region blocks that were making /news devolve into
  // a wall of placeholders. The proxy itself enforces a publisher
  // allowlist (SSRF defense) and caches aggressively at the Vercel edge.
  //
  // On retry (attempts=1) we still append a cache-buster to defeat any
  // disk-cached "broken" entry the browser holds onto, but the bust is on
  // OUR proxy URL — the upstream URL stays clean for the edge cache to
  // dedupe across users.
  const proxiedSrc = `/api/img-proxy?url=${encodeURIComponent(src)}`;
  const finalSrc =
    attempts === 0 ? proxiedSrc : `${proxiedSrc}&_r=${attempts}`;

  // `referrerPolicy="no-referrer"` is the actual fix here. CDNs like
  // image.cnbcfm.com return 403 when the Referer is anything other than
  // their own publication domain — i.e. they block hotlinking. The
  // browser auto-attaches `Referer: https://gigascope.xyz/news` on the
  // img request, which CNBC rejects. Telling the browser to send NO
  // Referer at all bypasses the hotlink check (their server treats it
  // the same as a direct-paste image-in-new-tab request, which they
  // serve). No effect on publications that don't have hotlink defense.
  // The thumbnail IS the article's headline photo — it's editorial, not
  // decorative — so screen readers should hear the article title rather
  // than skip the image entirely.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      key={attempts}
      src={finalSrc}
      alt={title}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setAttempts((a) => a + 1)}
      className="w-full aspect-video object-cover"
    />
  );
}
