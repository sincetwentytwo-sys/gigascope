import Link from "next/link";
import { factories } from "@/data/factories";

export const metadata = {
  title: "Page not found — GIGASCOPE",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold mb-4">404</p>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-dim mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/" className="block bg-text text-bg rounded-lg px-5 py-3 font-semibold hover:opacity-90 transition-opacity">
            ← Back to all factories
          </Link>
          <Link href="/timeline" className="block text-sm text-dim hover:text-text py-2">
            Global Timeline →
          </Link>
        </div>
      </div>
    </div>
  );
}
