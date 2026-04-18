import Link from "next/link";
import { factories } from "@/data/factories";

export const metadata = {
  title: "Page not found — GIGASCOPE",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  const random = factories[Math.floor(Math.random() * factories.length)];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-mono tracking-widest text-dim mb-4">404 — NO SIGNAL</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3">Off the map</h1>
        <p className="text-dim mb-8 leading-relaxed">
          That page isn&apos;t tracked. Satellites can only see so much. Try one of these instead:
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/" className="block bg-text text-bg rounded-lg px-5 py-3 font-semibold hover:opacity-90 transition-opacity">
            ← Back to all factories
          </Link>
          <Link href={`/factory/${random.slug}`} className="block border border-border-custom rounded-lg px-5 py-3 text-sm text-dim hover:text-text hover:bg-surface transition-colors">
            Jump to {random.flag} {random.name}
          </Link>
          <Link href="/timeline" className="block text-sm text-dim hover:text-text py-2">
            Global Timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
