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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black mb-1">
          Satellite Compare
        </h1>
        <p className="text-sm text-dim">
          Drag the slider to compare Sentinel-2 vs ESRI imagery at each factory.
        </p>
      </div>

      <CompareSliderWrapper />
    </div>
  );
}
