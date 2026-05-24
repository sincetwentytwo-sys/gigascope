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
  // 308 permanent redirects for the 7 product breakdowns retired in the
  // Round 3 narrow (2026-05-24, 13 → 6). Search engines and any external
  // links land on the hub. See src/data/products/index.ts for the rationale.
  redirects: async () => [
    { source: "/products/model-3",        destination: "/products", permanent: true },
    { source: "/products/model-y",        destination: "/products", permanent: true },
    { source: "/products/megapack",       destination: "/products", permanent: true },
    { source: "/products/powerwall",      destination: "/products", permanent: true },
    { source: "/products/neuralink-n1",   destination: "/products", permanent: true },
    { source: "/products/supercharger-v4", destination: "/products", permanent: true },
    { source: "/products/falcon9",        destination: "/products", permanent: true },
  ],
};

export default withBundleAnalyzer(nextConfig);
