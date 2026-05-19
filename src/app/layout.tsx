import type { Metadata } from "next";
import "./globals.css";
import GlobeBackground from "@/components/GlobeBackground";
import VisitCounter from "@/components/VisitCounter";
import SupportLinks from "@/components/SupportLinks";

export const metadata: Metadata = {
  title: "GIGASCOPE — Musk Empire Site Tracker",
  description:
    "Track Tesla, SpaceX, xAI, Neuralink, and The Boring Company sites worldwide. Satellite imagery comparison, milestones, live SpaceX data, and community updates.",
  keywords: ["Tesla", "SpaceX", "xAI", "Neuralink", "Boring Company", "Gigafactory", "Terafab", "Starbase", "Colossus", "Starlink", "satellite imagery", "construction tracker"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://gigascope.xyz"),
  openGraph: {
    title: "GIGASCOPE — Musk Empire Site Tracker",
    description: "Track 16 sites across Tesla, SpaceX, xAI, Neuralink, and The Boring Company with satellite imagery, milestones, and live updates.",
    type: "website",
    siteName: "GIGASCOPE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE — Musk Empire Tracker",
    description: "Track 16 sites across Tesla, SpaceX, xAI, Neuralink & Boring Company with satellite imagery and live updates.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
            __html: JSON.stringify({
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
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text">
        <GlobeBackground />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-text focus:text-bg focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
          Skip to content
        </a>

        {/* Navbar — Tesla-style minimal */}
        <nav aria-label="Main navigation" className="sticky top-0 z-50 bg-bg/80 backdrop-blur-lg border-b border-border-custom">
          <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center justify-between">
            <a href="/" className="text-sm font-semibold tracking-wide">
              GIGASCOPE
            </a>
            <div className="hidden sm:flex items-center gap-8 text-[13px] text-dim">
              <a href="/compare" className="hover:text-text transition-colors">Compare</a>
              <a href="/timeline" className="hover:text-text transition-colors">Timeline</a>
              <a href="/products" className="hover:text-text transition-colors">Products</a>
              <a href="/about" className="hover:text-text transition-colors">About</a>
              <a href="https://github.com/sincetwentytwo-sys/gigascope" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GitHub</a>
            </div>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-lg border-t border-border-custom flex justify-around py-2.5">
          <a href="/" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            Home
          </a>
          <a href="/compare" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/></svg>
            Compare
          </a>
          <a href="/timeline" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="16" r="2"/></svg>
            Timeline
          </a>
          <a href="/about" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
            About
          </a>
        </nav>

        <main id="main-content" className="flex-1">{children}</main>

        <footer className="py-8 px-6 pb-20 sm:pb-8 text-center text-xs text-dim flex flex-col gap-3 items-center">
          <div>GIGASCOPE — Community project. Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.</div>
          <SupportLinks />
          <VisitCounter />
        </footer>
      </body>
    </html>
  );
}
