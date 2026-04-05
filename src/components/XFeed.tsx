"use client";

interface XFeedProps {
  query: string;
  factoryName: string;
}

export default function XFeed({ query, factoryName }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;

  return (
    <div>
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-mono text-dim hover:text-text transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        {factoryName} on X &rarr;
      </a>
      <p className="font-mono text-[8px] text-dim/50 mt-1">
        Live posts, photos, and updates from the community
      </p>
    </div>
  );
}
