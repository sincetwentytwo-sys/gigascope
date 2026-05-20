import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Musk Empire construction sites (Tesla, SpaceX, xAI, Neuralink, Boring)",
};

export default function ComparePage() {
  return (
    <div className="bg-[#121416] text-[#e2e2e5] -mb-8">
      <div className="border-b border-[#00d4ff]/30 bg-[#121416] shadow-[0_0_8px_rgba(0,212,255,0.2)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-3 font-['Space_Grotesk'] uppercase tracking-[0.1em] text-[#00d4ff]">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <h1 className="text-xs sm:text-base font-bold tracking-widest truncate">ORBITAL COMMAND</h1>
            <span className="hidden sm:inline text-[10px] font-mono text-[#00d4ff]/60">SATELLITE RECONNAISSANCE</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] font-mono text-[#00d4ff]/60 flex-shrink-0">
            <span className="hidden md:inline">SIGNAL: STABLE</span>
            <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <CompareSliderWrapper />
      </div>
    </div>
  );
}
