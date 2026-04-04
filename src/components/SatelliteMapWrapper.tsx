"use client";

import dynamic from "next/dynamic";

const SatelliteMap = dynamic(() => import("@/components/SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface animate-pulse rounded-xl" />
  ),
});

export default function SatelliteMapWrapper(props: {
  lat: number;
  lng: number;
  zoom?: number;
  factoryColor?: string;
}) {
  return <SatelliteMap {...props} />;
}
