import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GIGASCOPE — Tesla Factory Construction Tracker",
  description:
    "Track Tesla Terafab and Gigafactory construction progress worldwide with satellite imagery comparison and milestones.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "GIGASCOPE",
    description:
      "Tesla factory construction tracker — satellite imagery, milestones",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-bg focus:px-4 focus:py-2 focus:text-sm focus:font-bold">
          Skip to content
        </a>

        {/* Navbar */}
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 border-b border-border-custom bg-bg/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
                <circle cx="16" cy="16" r="14" stroke="#00d4ff" strokeWidth="1.2" opacity="0.4" />
                <circle cx="16" cy="16" r="6" stroke="#00d4ff" strokeWidth="1.2" />
                <circle cx="16" cy="16" r="2" fill="#00d4ff" />
              </svg>
              <span className="text-sm font-bold tracking-[0.15em]">
                GIGASCOPE
              </span>
            </a>
            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-6 text-xs font-medium tracking-wide text-dim">
              <a href="/" className="hover:text-text transition-colors">HOME</a>
              <a href="/compare" className="hover:text-text transition-colors">COMPARE</a>
              <a href="/timeline" className="hover:text-text transition-colors">TIMELINE</a>
              <a href="/about" className="hover:text-text transition-colors">ABOUT</a>
              <a href="https://github.com/sincetwentytwo-sys/gigascope" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors">GITHUB</a>
            </div>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-md border-t border-border-custom flex justify-around py-3">
          <a href="/" className="flex flex-col items-center gap-0.5 text-dim hover:text-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            <span className="text-[8px] font-mono uppercase">Home</span>
          </a>
          <a href="/compare" className="flex flex-col items-center gap-0.5 text-dim hover:text-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/></svg>
            <span className="text-[8px] font-mono uppercase">Compare</span>
          </a>
          <a href="/timeline" className="flex flex-col items-center gap-0.5 text-dim hover:text-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="16" r="2"/></svg>
            <span className="text-[8px] font-mono uppercase">Timeline</span>
          </a>
          <a href="/about" className="flex flex-col items-center gap-0.5 text-dim hover:text-text transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
            <span className="text-[8px] font-mono uppercase">About</span>
          </a>
        </nav>

        {/* Main content */}
        <main id="main-content" className="flex-1 relative pt-14">{children}</main>

        {/* Footer */}
        <footer className="border-t border-border-custom py-6 px-4 pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-dim">
            <span>GIGASCOPE — Community project. Not affiliated with Tesla, Inc.</span>
            <span className="font-mono">ESRI + Sentinel-2 + CartoDB</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
