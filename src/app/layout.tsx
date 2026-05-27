import type { Metadata, Viewport } from "next";
import "./globals.css";
import { safeJsonLd } from "@/lib/safeJsonLd";
import VisitCounter from "@/components/VisitCounter";
import SupportLinks from "@/components/SupportLinks";
import GlobalSearchProvider from "@/components/GlobalSearchProvider";
import SearchOpener from "@/components/SearchOpener";

export const metadata: Metadata = {
  title: "GIGASCOPE — Watch the Musk-orbit empire get built, one satellite frame at a time",
  description:
    "Empire-wide satellite scoreboard for 16 Musk industrial sites (Tesla, SpaceX, xAI, Neuralink, Boring Co.). Sentinel-2 + ESRI timelapses, hand-traced progress polygons, primary-source milestones, daily digest, methodology cited. The /pulse dashboard rolls it all into one view. Free.",
  keywords: ["Tesla", "SpaceX", "xAI", "Neuralink", "Boring Company", "Elon Musk", "Gigafactory", "Starlink", "Cybertruck", "Starship", "Model 3", "Model Y", "Megapack", "Optimus", "Colossus", "satellite imagery", "construction tracking"],
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.json",
  metadataBase: new URL("https://gigascope.xyz"),
  openGraph: {
    title: "Watch the Musk-orbit empire get built, one satellite frame at a time",
    description: "16 sites · Sentinel-2 + ESRI satellite timelapses · methodology cited. Tesla, SpaceX, xAI, Neuralink, Boring Co.",
    type: "website",
    siteName: "GIGASCOPE",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIGASCOPE — Musk-orbit industrial sites from above",
    description: "Sentinel-2 + ESRI timelapses of every Gigafactory, every launch pad, Colossus GPU cluster. Refreshed as new imagery drops. Methodology cited.",
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
              description: "Musk-orbit industrial site tracker — Tesla, SpaceX, xAI, Neuralink, Boring Company with satellite imagery, milestones, and timelapses refreshed as new captures land.",
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
              {/* Trimmed nav — /timeline /calendar /news /downloads deleted
                  2026-05-25 (Elon-level pruning). The remaining routes are
                  the only ones with non-trivial value:
                  Pulse (empire scoreboard — the flagship), Compare (slider),
                  Products (cutaways), Methodology (trust), About (founder),
                  /pro (paid funnel). Latest news lives inline on the home
                  page; site-level milestones live on /site/[slug]. */}
              <a href="/pulse" className="hover:text-text transition-colors">Pulse</a>
              <a href="/compare" className="hover:text-text transition-colors">Compare</a>
              <a href="/products" className="hover:text-text transition-colors">Products</a>
              <a href="/methodology" className="hover:text-text transition-colors">Methodology</a>
              <a href="/about" className="hover:text-text transition-colors">About</a>
              <SearchOpener />
              <a href="/pro" className="text-text font-bold hover:opacity-70 transition-opacity">Get the daily digest</a>
            </div>
          </div>
        </nav>

        {/* Mobile bottom nav */}
        <nav aria-label="Mobile navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/90 backdrop-blur-lg border-t border-border-custom flex justify-around py-2.5">
          <a href="/" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
            Home
          </a>
          <a href="/pulse" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
            Pulse
          </a>
          <a href="/compare" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            Compare
          </a>
          <a href="/products" className="flex flex-col items-center gap-0.5 text-dim text-[10px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Products
          </a>
          <a href="/pro" className="flex flex-col items-center gap-0.5 text-[10px] text-text font-bold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>
            Digest
          </a>
        </nav>

        <GlobalSearchProvider />
        {/* pb-20 on mobile clears the fixed bottom nav (~64px) so page CTAs
            (EmailSignup, "See all sites →", etc.) don't get hidden behind it.
            sm:pb-0 removes the padding once the mobile nav is hidden. */}
        <main id="main-content" className="flex-1 pb-20 sm:pb-0">{children}</main>

        <footer className="py-8 px-6 pb-20 sm:pb-8 text-center text-xs text-dim flex flex-col gap-4 items-center max-w-[1100px] mx-auto">
          <div>GIGASCOPE — Not affiliated with Tesla, SpaceX, xAI, Neuralink, or The Boring Company.</div>

          {/* Imagery credit — surfaced on every page so the credit is visible
              even on pages without a live Leaflet map (the map's own
              attribution control covers those). Required by Esri / EOX
              license terms. Deep-link goes to the methodology page's
              imagery section. */}
          <div className="text-[10px] text-dim/80 max-w-2xl leading-relaxed">
            Satellite imagery © Esri, Maxar, Earthstar Geographics and the GIS User Community ·
            Sentinel-2 cloudless 2024 by{" "}
            <a href="https://s2maps.eu" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors underline">EOX</a>{" "}
            (contains modified Copernicus Sentinel data 2024, CC BY-NC-SA 4.0) ·{" "}
            <a href="/methodology#imagery" className="hover:text-text transition-colors underline">full attribution</a>
          </div>

          {/* Policy + legal links — required for Paddle MoR + Korean e-commerce law */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
            <a href="/terms-of-service" className="hover:text-text transition-colors">Terms of Service</a>
            <a href="/privacy-policy" className="hover:text-text transition-colors">Privacy Policy</a>
            <a href="/refund-policy" className="hover:text-text transition-colors">Refund Policy</a>
            <a href="/charter-terms" className="hover:text-text transition-colors">Charter Terms</a>
            <a href="/methodology" className="hover:text-text transition-colors">Methodology</a>
          </div>

          <SupportLinks />
          <VisitCounter />

          {/* Business operator disclosure — required by Korean E-commerce Act
              (전자상거래법) when accepting payments from Korean residents. Since
              the site is English-language, English-only disclosure is compliant.
              Once 통신판매업 신고 (mail-order business registration) clears, add
              that registration number as an extra line. Data must always match
              the actual business registration — update immediately on any change. */}
          <div className="mt-2 pt-3 border-t border-border-custom/60 w-full max-w-xl text-[10px] text-dim leading-relaxed">
            <div className="font-semibold mb-1 text-text/80">Business operator</div>
            <div>Trade name: GIGASCOPE</div>
            <div>Representative: Jaebin Kim</div>
            <div>Business registration: 568-24-02193</div>
            <div>Address: 42, Hongik-ro 5an-gil, Mapo-gu, Seoul 04039, Republic of Korea</div>
            <div>
              Email:{" "}
              <a href="mailto:sincetwentytwo@gmail.com" className="hover:text-text transition-colors">
                sincetwentytwo@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
