"use client";

interface XFeedProps {
  query: string;
  factoryName: string;
}

export default function XFeed({ query, factoryName }: XFeedProps) {
  const searchUrl = `https://x.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
  // X timeline embed URL for search
  const timelineUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/Tesla?dnt=true&embedId=twitter-widget-0&features=eyJ0ZndfdGltZWxpbmVfbGlzdCI6eyJidWNrZXQiOltdLCJ2ZXJzaW9uIjpudWxsfSwidGZ3X2ZvbGxvd2VyX2NvdW50X3N1bnNldCI6eyJidWNrZXQiOnRydWUsInZlcnNpb24iOm51bGx9LCJ0ZndfdHdlZXRfZWRpdF9iYWNrZW5kIjp7ImJ1Y2tldCI6Im9uIiwidmVyc2lvbiI6bnVsbH19&frame=false&hideBorder=true&hideFooter=true&hideHeader=true&hideScrollBar=false&lang=en&maxHeight=500px&origin=https%3A%2F%2Fpublish.twitter.com&theme=dark&transparent=true&widgetsVersion=2615f7e52b7e0%3A1702314776716`;

  return (
    <div className="flex flex-col gap-3">
      {/* Prominent search link */}
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 border border-white/10 p-4 hover:border-white/20 transition-colors group"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white shrink-0">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <div>
          <div className="text-sm font-bold group-hover:text-white transition-colors">
            {factoryName} on X
          </div>
          <div className="text-[10px] text-dim mt-0.5">
            Live posts, photos, construction updates from the community
          </div>
        </div>
        <span className="ml-auto text-dim group-hover:text-white transition-colors">&rarr;</span>
      </a>

      {/* Related X accounts to follow */}
      <div className="flex flex-wrap gap-2">
        {[
          { handle: "elonmusk", label: "@elonmusk" },
          { handle: "Tesla", label: "@Tesla" },
          { handle: "TeslaCharging", label: "@TeslaCharging" },
        ].map((account) => (
          <a
            key={account.handle}
            href={`https://x.com/${account.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-dim hover:text-text border border-white/5 px-2 py-1"
          >
            {account.label}
          </a>
        ))}
      </div>
    </div>
  );
}
