import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Musk Empire construction sites (Tesla, SpaceX, xAI, Neuralink, Boring)",
};

export default function ComparePage() {
  return (
    <div className="bg-bg text-text -mb-8">
      <div className="border-b border-border-custom bg-bg ">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-3  uppercase tracking-[0.1em] text-text">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <h1 className="text-xs sm:text-base font-bold tracking-widest truncate">ORBITAL COMMAND</h1>
            <span className="hidden sm:inline text-[10px] font-mono text-dim">SATELLITE RECONNAISSANCE</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] font-mono text-dim flex-shrink-0">
            <span className="hidden md:inline">SIGNAL: STABLE</span>
            <span className="w-1.5 h-1.5 bg-text rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <CompareSliderWrapper />
      </div>
    </div>
  );
}
