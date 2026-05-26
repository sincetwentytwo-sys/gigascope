import Link from "next/link";

export const metadata = {
  title: "Page not found — GIGASCOPE",
  description: "The page you're looking for doesn't exist.",
};

const LINKS = [
  { href: "/", label: "All sites" },
  { href: "/pulse", label: "Pulse" },
  { href: "/products", label: "Products" },
  { href: "/compare", label: "Compare" },
  { href: "/methodology", label: "Methodology" },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-prose w-full text-center">
        <p className="font-mono text-[11px] uppercase tracking-widest text-dim mb-3">
          404
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-text">
          Page not found
        </h1>
        <p className="text-dim leading-relaxed mb-8">
          Even Sentinel-2 can&apos;t see everything.
        </p>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-text hover:text-dim underline underline-offset-4 decoration-border-custom hover:decoration-text transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
