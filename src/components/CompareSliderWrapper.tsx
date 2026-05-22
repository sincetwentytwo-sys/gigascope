"use client";

import dynamic from "next/dynamic";

const CompareSlider = dynamic(() => import("@/components/CompareSlider"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] bg-surface border border-border-custom animate-pulse" />
  ),
});

export default function CompareSliderWrapper() {
  return <CompareSlider />;
}
