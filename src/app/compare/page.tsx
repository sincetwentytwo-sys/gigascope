import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Tesla factory construction sites",
};

export default function ComparePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Satellite Compare</h1>
      <p className="text-dim mb-6">
        Drag the slider to compare Sentinel-2 vs ESRI imagery at each factory.
      </p>
      <CompareSliderWrapper />
    </div>
  );
}
