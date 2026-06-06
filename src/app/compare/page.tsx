import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";
import EmailSignup from "@/components/EmailSignup";

const SITE_URL = "https://gigascope.xyz";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery of Musk-orbit construction sites: Sentinel-2 2019 baseline vs ESRI latest (~3-6 months).",
  alternates: { canonical: `${SITE_URL}/compare` },
  openGraph: {
    title: "Compare imagery — GIGASCOPE",
    description: "Sentinel-2 2019 baseline vs ESRI latest imagery for Tesla, SpaceX, xAI, Neuralink, and Boring sites.",
    url: `${SITE_URL}/compare`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare imagery — GIGASCOPE",
    description: "Sentinel-2 2019 baseline vs ESRI latest imagery for Musk-orbit construction sites.",
  },
};

export default function ComparePage() {
  return (
    <div className="bg-bg text-text -mb-8">
      <div className="border-b border-border-custom bg-bg ">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center gap-3 text-text">
          <h1 className="text-sm sm:text-base font-bold tracking-tight">Compare imagery</h1>
          <span className="hidden sm:inline text-[11px] text-dim">Sentinel-2 2019 baseline vs ESRI latest</span>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <CompareSliderWrapper />
      </div>
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-surface border border-border-custom rounded-lg p-4 sm:p-5 text-center">
          <h2 className="text-sm font-semibold mb-1">Get the next frame the day it lands</h2>
          <p className="text-xs text-dim mb-3">
            New satellite frames and permit filings, emailed as they happen. Free.
          </p>
          <EmailSignup tier="free" source="compare" variant="inline" />
        </div>
      </div>
    </div>
  );
}
