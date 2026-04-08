import type { Metadata } from "next";
import "./globals.css";
import GlobeBackground from "@/components/GlobeBackground";

export const metadata: Metadata = {
  title: "GIGASCOPE — Tesla Factory Construction Tracker",
  description:
    "Track Tesla Terafab and 8 Gigafactory construction sites worldwide. Satellite imagery comparison, milestones, real-time news, and community updates.",
  keywords: ["Tesla", "Gigafactory", "Terafab", "factory tracker", "satellite imagery", "construction", "Giga Texas", "Giga Berlin", "Giga Shanghai"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://gigascope.xyz"),
  openGraph: {
    title: "GIGASCOPE — Tesla Factory Construction Tracker",
    description: "Track Tesla's 8 factory construction sites with satellite imagery, milestones, and real-time community updates.",
    type: "website",
    siteName: "GIGASCOPE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE — Tesla Factory Tracker",
    description: "Track Tesla's 8 factory sites with satellite imagery and real-time updates.",
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
              description: "Tesla factory construction tracker with satellite imagery, milestones, and community updates.",
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

        <footer className="py-8 px-6 pb-20 sm:pb-8 text-center text-xs text-dim">
          GIGASCOPE — Community project. Not affiliated with Tesla, Inc.
        </footer>
      </body>
    </html>
  );
}
