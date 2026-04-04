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
            <a href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center text-xs font-black text-white">
                GS
              </span>
              <span className="text-sm font-bold tracking-widest">
                GIGA<span className="text-accent-cyan">SCOPE</span>
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
              <span className="flex items-center gap-1.5 text-accent-green">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                LIVE
              </span>
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
