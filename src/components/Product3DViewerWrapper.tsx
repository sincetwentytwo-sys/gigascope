"use client";

import dynamic from "next/dynamic";
import type { ProductSpec } from "@/data/products";

const Product3DViewer = dynamic(
  () => import("@/components/Product3DViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70vh] sm:h-[80vh] min-h-[480px] border border-[#343538] bg-[#0a0a0c] flex items-center justify-center">
        <div className="font-mono text-[11px] text-[#8292aa] uppercase tracking-widest animate-pulse">
          Loading 3D viewer…
        </div>
      </div>
    ),
  },
);

export default function Product3DViewerWrapper({
  product,
}: {
  product: ProductSpec;
}) {
  return <Product3DViewer product={product} />;
}
