import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  // 308 permanent redirects preserve SEO equity from retired routes.
  //
  // Round 3 (2026-05-24): 7 product breakdowns retired (13 → 6).
  // Round 4 (2026-05-25): 4 page routes killed — /news, /timeline,
  //   /downloads, /calendar. Elon-style pruning after a 4-hour /news
  //   debug spiral revealed the page was thrash > value. Latest news
  //   now lives inline on the home; per-site milestones live on
  //   /site/[slug]; catalysts surface in the digest emails.
  redirects: async () => [
    // Round 3 — product narrow
    { source: "/products/model-3",        destination: "/products", permanent: true },
    { source: "/products/model-y",        destination: "/products", permanent: true },
    { source: "/products/megapack",       destination: "/products", permanent: true },
    { source: "/products/powerwall",      destination: "/products", permanent: true },
    { source: "/products/neuralink-n1",   destination: "/products", permanent: true },
    { source: "/products/supercharger-v4", destination: "/products", permanent: true },
    { source: "/products/falcon9",        destination: "/products", permanent: true },
    // Round 4 — page kill
    { source: "/news",                    destination: "/",         permanent: true },
    { source: "/timeline",                destination: "/",         permanent: true },
    { source: "/downloads",               destination: "/pro",      permanent: true },
    { source: "/calendar",                destination: "/spacex-ipo", permanent: true },
  ],
};

export default withBundleAnalyzer(nextConfig);
