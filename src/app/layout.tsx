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
    "Track Tesla Terafab and Gigafactory construction progress worldwide with satellite imagery comparison, 3D globe visualization, and real-time milestones.",
  openGraph: {
    title: "GIGASCOPE",
    description:
      "Tesla factory construction tracker — satellite imagery, 3D globe, milestones",
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
        {/* Aurora background orbs */}
        <div className="aurora-orb aurora-1" />
        <div className="aurora-orb aurora-2" />
        <div className="aurora-orb aurora-3" />
        <div className="grid-overlay" />

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-custom bg-surface/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              {/* Orbital scope icon */}
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
                {/* Outer orbit ring */}
                <circle cx="16" cy="16" r="14" stroke="url(#logoGrad)" strokeWidth="1.5" opacity="0.6" />
                {/* Inner scope crosshair */}
                <circle cx="16" cy="16" r="6" stroke="#00d4ff" strokeWidth="1.5" />
                {/* Core dot */}
                <circle cx="16" cy="16" r="2.5" fill="#00d4ff" />
                {/* Orbiting satellite dot */}
                <circle cx="28" cy="10" r="2" fill="#e63946" />
                {/* Crosshair lines */}
                <line x1="16" y1="2" x2="16" y2="8" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
                <line x1="16" y1="24" x2="16" y2="30" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
                <line x1="2" y1="16" x2="8" y2="16" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
                <line x1="24" y1="16" x2="30" y2="16" stroke="#00d4ff" strokeWidth="0.8" opacity="0.4" />
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#3a86ff" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-sm font-bold tracking-[0.2em] group-hover:text-accent-cyan transition-colors">
                GIGASCOPE
              </span>
            </a>
            <div className="hidden sm:flex items-center gap-6 text-xs font-medium tracking-wide text-dim">
              <a href="/" className="hover:text-text transition-colors">
                HOME
              </a>
              <a href="/compare" className="hover:text-text transition-colors">
                COMPARE
              </a>
              <a href="/timeline" className="hover:text-text transition-colors">
                TIMELINE
              </a>
              <a href="/about" className="hover:text-text transition-colors">
                ABOUT
              </a>
              <a
                href="https://github.com/sincetwentytwo-sys/gigascope"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
              >
                GITHUB
              </a>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 relative z-10 pt-14">{children}</main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-border-custom py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dim">
            <span>
              GIGASCOPE — Community project. Not affiliated with Tesla,
              Inc.
            </span>
            <span className="font-mono">
              ESRI + Sentinel-2 + CartoDB
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
