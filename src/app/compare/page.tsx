import type { Metadata } from "next";
import CompareSliderWrapper from "@/components/CompareSliderWrapper";

export const metadata: Metadata = {
  title: "Compare — GIGASCOPE",
  description: "Before/after satellite imagery comparison of Tesla factory construction sites",
};

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-black mb-2">Satellite Compare</h1>
        <p className="text-dim text-sm">
          Drag the slider to compare two satellite sources at each factory site.
        </p>
      </div>

      <CompareSliderWrapper />
    </div>
  );
}
