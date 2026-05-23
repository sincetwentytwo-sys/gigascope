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
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full aspect-video bg-gradient-to-br from-surface to-border-custom flex items-center justify-center">
        <span className="text-dim text-xs font-mono uppercase tracking-widest">
          {source}
        </span>
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full aspect-video object-cover"
    />
  );
}
