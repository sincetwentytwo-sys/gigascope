import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Tesla factory construction sites",
};

export default function ComparePage() {
  return (
    <div className="bg-[#121416] text-[#e2e2e5] -mb-8">
      <div className="border-b border-[#00d4ff]/30 bg-[#121416] shadow-[0_0_8px_rgba(0,212,255,0.2)]">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between font-['Space_Grotesk'] uppercase tracking-[0.1em] text-[#00d4ff]">
          <div className="flex items-center gap-6">
            <h1 className="text-base font-bold tracking-widest">ORBITAL COMMAND</h1>
            <span className="hidden sm:inline text-[10px] font-mono text-[#00d4ff]/60">SATELLITE RECONNAISSANCE</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#00d4ff]/60">
            <span className="hidden md:inline">SIGNAL: STABLE</span>
            <span className="w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <CompareSliderWrapper />
      </div>
    </div>
  );
}
