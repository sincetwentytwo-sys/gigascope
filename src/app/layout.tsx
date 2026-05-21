import type { Metadata } from "next";
import "./globals.css";
import { safeJsonLd } from "@/lib/safeJsonLd";
import GlobeBackground from "@/components/GlobeBackground";
import VisitCounter from "@/components/VisitCounter";
import SupportLinks from "@/components/SupportLinks";

export const metadata: Metadata = {
  title: "GIGASCOPE — Industrial intelligence for the AI build-out",
  description:
    "Live multi-sector dashboards: Musk Empire, NVIDIA & semis, HBM (Samsung, SK Hynix), quantum (RGTI, IONQ), critical materials (CRML), defense & space, fusion/nuclear. Satellite imagery, milestones, catalysts, news — one terminal.",
  keywords: ["Tesla", "SpaceX", "xAI", "Neuralink", "NVIDIA", "Samsung", "SK Hynix", "RGTI", "IONQ", "CRML", "ASML", "TSMC", "Palantir", "Gigafactory", "Starlink", "satellite imagery", "AI compute", "HBM", "quantum computing", "critical materials"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://gigascope.xyz"),
  openGraph: {
    title: "GIGASCOPE — Industrial intelligence for the AI build-out",
    description: "Live multi-sector intel: Musk Empire, semis (NVDA/Samsung/Hynix/TSM), quantum (RGTI/IONQ), critical materials, defense, fusion. Satellite + catalysts + news in one terminal.",
    type: "website",
    siteName: "GIGASCOPE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE — Industrial intelligence terminal",
    description: "Musk Empire + semis + quantum + materials + defense + nuclear. Live prices, catalysts, satellite, news.",
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
        {/* dangerouslySetInnerHTML uses safeJsonLd() which escapes </script>, U+2028, U+2029 */}
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
            <div className="hidden sm:flex items-center gap-5 text-[13px] text-dim">
              <a href="/markets" className="hover:text-text transition-colors">Markets</a>
              <a href="/sectors" className="hover:text-text transition-colors">Sectors</a>
              <a href="/news" className="hover:text-text transition-colors">News</a>
              <a href="/timeline" className="hover:text-text transition-colors">Timeline</a>
              <a href="/compare" className="hover:text-text transition-colors">Compare</a>
              <a href="/products" className="hover:text-text transition-colors">Products</a>
              <a href="/about" className="hover:text-text transition-colors">About</a>
              <a href="/pro" className="text-text font-bold hover:opacity-70 transition-opacity">Pro</a>
            </div>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-lg border-t border-border-custom flex justify-around py-2.5">
          <a href="/" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            Home
          </a>
          <a href="/markets" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h7v7"/></svg>
            Markets
          </a>
          <a href="/sectors" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Sectors
          </a>
          <a href="/news" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h13a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/><line x1="8" y1="8" x2="14" y2="8"/><line x1="8" y1="12" x2="14" y2="12"/></svg>
            News
          </a>
          <a href="/pro" className="flex flex-col items-center gap-0.5 text-[10px] text-text font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
            Pro
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
