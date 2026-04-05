import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description:
    "Before/after satellite imagery comparison of Tesla factory construction sites",
};

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 border-l-2 border-accent-cyan/30 pl-4">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
          Satellite Compare
        </h1>
        <p className="font-mono text-[10px] text-dim tracking-wider mt-1">
          Drag the slider to compare SENTINEL-2 vs ESRI imagery at each factory
          site.
        </p>
      </div>

      <CompareSliderWrapper />
    </div>
  );
}
