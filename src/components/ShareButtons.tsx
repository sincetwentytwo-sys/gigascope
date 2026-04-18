"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = {
    reddit: `https://www.reddit.com/submit?url=${encoded}&title=${encodedTitle}`,
    x: `https://x.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encoded}`,
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  };

  const btn = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-custom text-xs text-dim hover:text-text hover:bg-white transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-dim mr-1">Share:</span>
      <a href={links.reddit} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Reddit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.675 10.22c.053.198.08.405.08.617 0 2.49-2.897 4.507-6.47 4.507-3.573 0-6.47-2.017-6.47-4.507 0-.215.028-.426.083-.63-.396-.177-.672-.575-.672-1.036 0-.624.506-1.13 1.13-1.13.313 0 .596.127.801.332 1.056-.73 2.493-1.198 4.079-1.256l.867-4.08 2.836.596a.965.965 0 111.68.934.965.965 0 01-1.743-.57L12.24 4.01l-.783 3.69c1.595.062 3.037.534 4.09 1.268.205-.21.491-.34.807-.34.624 0 1.13.506 1.13 1.13 0 .469-.286.871-.692 1.043zm-9.15.936a.885.885 0 111.77 0 .885.885 0 01-1.77 0zm5.395 3.225c-.402.402-1.046.603-1.92.603-.873 0-1.517-.201-1.92-.603a.257.257 0 11.363-.364c.298.298.84.437 1.557.437.717 0 1.259-.139 1.557-.437a.257.257 0 11.363.364zm-.61-2.34a.885.885 0 110-1.77.885.885 0 010 1.77z"/></svg>
        Reddit
      </a>
      <a href={links.x} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        X
      </a>
      <a href={links.email} className={btn} aria-label="Share via email">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
        Email
      </a>
      <button onClick={onCopy} className={btn} aria-label="Copy link">
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
