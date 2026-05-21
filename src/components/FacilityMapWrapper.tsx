"use client";

import dynamic from "next/dynamic";

const FacilityMap = dynamic(() => import("@/components/FacilityMap"), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] bg-surface animate-pulse rounded-lg" />,
});

type Facility = {
  name: string;
  city: string;
  country: string;
  flag?: string;
  lat: number;
  lng: number;
  status: string;
  siteSlug?: string;
};

export default function FacilityMapWrapper(props: { facilities: Facility[]; height?: number }) {
  return <FacilityMap {...props} />;
}
