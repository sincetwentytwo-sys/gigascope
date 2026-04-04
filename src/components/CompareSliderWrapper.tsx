"use client";

import dynamic from "next/dynamic";

const CompareSlider = dynamic(() => import("@/components/CompareSlider"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-surface animate-pulse rounded-xl" />
  ),
});

export default function CompareSliderWrapper() {
  return <CompareSlider />;
}
