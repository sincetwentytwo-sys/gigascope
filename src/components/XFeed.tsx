interface XFeedProps {
  query: string;
  factoryName: string;
}

export default function XFeed({ query, factoryName }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
  const photosUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=image`;

  return (
    <div className="flex flex-col gap-2">
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 border border-white/8 p-3 hover:border-white/20 transition-colors group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <div className="flex-1">
          <div className="text-sm font-bold group-hover:text-white transition-colors">{factoryName} — Latest</div>
          <div className="text-[10px] text-dim">Live posts and updates</div>
        </div>
        <span className="text-dim group-hover:text-white">&rarr;</span>
      </a>
      <a
        href={photosUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 border border-white/8 p-3 hover:border-white/20 transition-colors group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        <div className="flex-1">
          <div className="text-sm font-bold group-hover:text-white transition-colors">{factoryName} — Photos</div>
          <div className="text-[10px] text-dim">Construction photos from the community</div>
        </div>
        <span className="text-dim group-hover:text-white">&rarr;</span>
      </a>
    </div>
  );
}
