// Footer support links. Env-driven — shows only links whose URLs are configured.
// - NEXT_PUBLIC_TESLA_REFERRAL_URL: your Tesla referral link (optional)
// - NEXT_PUBLIC_SPONSORS_URL: GitHub Sponsors or Buy Me a Coffee URL (optional)
// GitHub repo + YouTube channel always show.

const GITHUB_REPO = "https://github.com/sincetwentytwo-sys/gigascope";
const YOUTUBE_CHANNEL = "https://www.youtube.com/@gigascopehq";

export default function SupportLinks() {
  const teslaRef = process.env.NEXT_PUBLIC_TESLA_REFERRAL_URL;
  const sponsors = process.env.NEXT_PUBLIC_SPONSORS_URL;

  const link =
    "inline-flex items-center gap-1.5 hover:text-text transition-colors";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-dim">
      <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className={link}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c6.626 0 12 5.373 12 12 0 5.302-3.438 9.8-8.207 11.387-.6.111-.82-.261-.82-.577 0-.382.014-1.634.014-3.193 0-1.086-.373-1.794-.79-2.156 2.593-.288 5.32-1.272 5.32-5.741 0-1.269-.451-2.308-1.197-3.121.12-.295.52-1.48-.114-3.084 0 0-.975-.313-3.194 1.191-.927-.258-1.92-.387-2.907-.392-.987.005-1.98.134-2.907.392-2.221-1.504-3.198-1.191-3.198-1.191-.633 1.604-.234 2.789-.114 3.084-.744.813-1.198 1.852-1.198 3.121 0 4.458 2.722 5.457 5.315 5.751-.334.291-.636.805-.741 1.559-.666.298-2.357.814-3.4-.97 0 0-.618-1.125-1.793-1.207 0 0-1.141-.015-.08.71 0 0 .766.36 1.299 1.713 0 0 .686 2.082 3.935 1.375.006.974.015 1.891.015 2.169 0 .314-.218.688-.81.578C3.44 21.795 0 17.295 0 12 0 5.373 5.372 0 12 0z"/></svg>
        Star on GitHub
      </a>

      <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer" className={link}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        YouTube
      </a>

      {teslaRef && (
        <a href={teslaRef} target="_blank" rel="noopener noreferrer" className={link}>
          <span>🚗</span>
          Buy Tesla with referral
        </a>
      )}

      {sponsors && (
        <a href={sponsors} target="_blank" rel="noopener noreferrer" className={link}>
          <span>♥</span>
          Support GIGASCOPE
        </a>
      )}
    </div>
  );
}
