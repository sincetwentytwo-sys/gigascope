import { permanentRedirect } from "next/navigation";
import { factories } from "@/data/factories";

export function generateStaticParams() {
  return factories.map((f) => ({ slug: f.slug }));
}

export default async function FactoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/site/${slug}`);
}
