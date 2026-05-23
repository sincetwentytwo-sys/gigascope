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
}: {
  src: string | undefined;
  source: string;
}) {
  const [attempts, setAttempts] = useState(0);

  if (!src || attempts >= 2) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-surface to-border-custom flex items-center justify-center">
        <span className="text-dim text-xs font-mono uppercase tracking-widest">
          {source}
        </span>
      </div>
    );
  }

  // On the second attempt append a cache-buster so the browser re-issues
  // the request instead of replaying a stale failure from disk cache.
  // CDNs that ignore unknown query params (image.cnbcfm.com, wp hosts) just
  // serve the same image; CDNs that key on query params see it as new.
  const finalSrc =
    attempts === 0 ? src : `${src}${src.includes("?") ? "&" : "?"}_r=${attempts}`;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      key={attempts}
      src={finalSrc}
      alt=""
      loading="lazy"
      onError={() => setAttempts((a) => a + 1)}
      className="w-full aspect-video object-cover"
    />
  );
}
