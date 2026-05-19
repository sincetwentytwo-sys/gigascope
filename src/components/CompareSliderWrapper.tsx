"use client";

import dynamic from "next/dynamic";

const CompareSlider = dynamic(() => import("@/components/CompareSlider"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-[#0c0e10] border border-[#00d4ff]/20 animate-pulse" />
  ),
});

export default function CompareSliderWrapper() {
  return <CompareSlider />;
}
