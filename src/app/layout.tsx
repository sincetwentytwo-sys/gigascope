import type { Metadata, Viewport } from "next";
import "./globals.css";
import { safeJsonLd } from "@/lib/safeJsonLd";
import VisitCounter from "@/components/VisitCounter";
import SupportLinks from "@/components/SupportLinks";
import GlobalSearchProvider from "@/components/GlobalSearchProvider";
import SearchOpener from "@/components/SearchOpener";

export const metadata: Metadata = {
  title: "GIGASCOPE — Watch Musk's empire get built, one satellite frame at a time",
  description:
    "Weekly Sentinel-2 satellite timelapses of 16 Musk-empire sites. Tesla Gigafactories from dirt to delivery, SpaceX Starbase orbital launches, xAI Colossus GPU cluster, Neuralink, Boring Co. Methodology + catalyst calendar. Free.",
  keywords: ["Tesla", "SpaceX", "xAI", "Neuralink", "Boring Company", "Elon Musk", "Gigafactory", "Starlink", "Cybertruck", "Starship", "Model 3", "Model Y", "Megapack", "Optimus", "Colossus", "satellite imagery", "construction tracking"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://gigascope.xyz"),
  openGraph: {
    title: "Watch Musk's empire get built, one satellite frame at a time",
    description: "16 sites · weekly Sentinel-2 satellite timelapses · methodology cited. Tesla, SpaceX, xAI, Neuralink, Boring Co.",
    type: "website",
    siteName: "GIGASCOPE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE — Musk Empire from orbit",
    description: "Weekly Sentinel-2 timelapses of every Gigafactory, every launch pad, Colossus GPU cluster. Methodology cited.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Next.js 16 Viewport export (replaces the deprecated viewport meta tag).
// Note: no maximum-scale / user-scalable — pinch-zoom must stay enabled (WCAG 1.4.4).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "GIGASCOPE",
              description: "Musk Empire site tracker — Tesla, SpaceX, xAI, Neuralink, Boring Company with satellite imagery, milestones, and live updates.",
              url: "https://gigascope.xyz",
              applicationCategory: "ReferenceApplication",
              operatingSystem: "All",
              author: {
                "@type": "Organization",
                name: "GIGASCOPE",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GIGASCOPE",
              url: "https://gigascope.xyz",
              description:
                "Satellite construction tracker for Tesla, SpaceX, xAI, Neuralink, Boring Company",
              founder: {
                "@type": "Person",
                name: "Jaebin Kim",
                sameAs: "https://x.com/gigascopehq",
              },
              sameAs: [
                "https://github.com/sincetwentytwo-sys/gigascope",
                "https://www.youtube.com/@gigascopehq",
                "https://x.com/gigascopehq",
              ],
            }),
          }}
        />
        {/* dangerouslySetInnerHTML uses safeJsonLd() which escapes </script>, U+2028, U+2029 */}
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">

        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-text focus:text-bg focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
          Skip to content
        </a>

        {/* Navbar — Tesla-style minimal */}
        <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-border-custom">
          <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold tracking-wide">
              GIGASCOPE
            </a>
            <div className="hidden sm:flex items-center gap-5 text-[13px] text-dim">
              {/* Musk-empire primary */}
              <a href="/timeline" className="hover:text-text transition-colors">Timeline</a>
              <a href="/compare" className="hover:text-text transition-colors">Compare</a>
              <a href="/products" className="hover:text-text transition-colors">Products</a>
              <a href="/calendar" className="hover:text-text transition-colors">Calendar</a>
              <a href="/news" className="hover:text-text transition-colors">News</a>
              <a href="/methodology" className="hover:text-text transition-colors">Methodology</a>
              <a href="/about" className="hover:text-text transition-colors">About</a>
              <SearchOpener />
              <a href="/pro" className="text-text font-bold hover:opacity-70 transition-opacity">Subscribe</a>
            </div>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-lg border-t border-border-custom flex justify-around py-2.5">
          <a href="/" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            Home
          </a>
          <a href="/timeline" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"/><circle cx="7" cy="12" r="1.5"/><circle cx="13" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
            Timeline
          </a>
          <a href="/methodology" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h13a2 2 0 012 2v12a2 2 0 01-2 2H4z"/><line x1="7" y1="8" x2="16" y2="8"/><line x1="7" y1="12" x2="16" y2="12"/><line x1="7" y1="16" x2="12" y2="16"/></svg>
            Methodology
          </a>
          <a href="/news" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h13a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/><line x1="8" y1="8" x2="14" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/></svg>
            News
          </a>
          <a href="/pro" className="flex flex-col items-center gap-0.5 text-[10px] text-text font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
            Subscribe
          </a>
        </nav>

        <GlobalSearchProvider />
        {/* pb-20 on mobile clears the fixed bottom nav (~64px) so page CTAs
            (EmailSignup, "See all sites →", etc.) don't get hidden behind it.
            sm:pb-0 removes the padding once the mobile nav is hidden. */}
        <main id="main-content" className="flex-1 pb-20 sm:pb-0">{children}</main>

        <footer className="py-8 px-6 pb-20 sm:pb-8 text-center text-xs text-dim flex flex-col gap-3 items-center">
          <div>GIGASCOPE — Community project. Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.</div>
          <SupportLinks />
          <VisitCounter />
        </footer>
      </body>
    </html>
  );
}
