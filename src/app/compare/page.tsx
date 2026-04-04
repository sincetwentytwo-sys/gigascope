import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Tesla factory construction sites",
};

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-accent-cyan rounded-full" />
          <span className="font-mono text-[9px] tracking-[0.2em] text-dim uppercase">ORBITAL COMPARISON</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Satellite Compare</h1>
        <p className="text-dim text-sm">
          Drag the slider to compare Sentinel-2 and ESRI satellite imagery of each factory site.
        </p>
      </div>

      <CompareSliderWrapper />
    </div>
  );
}
