import type { Metadata } from "next";
import WatchlistClient from "./WatchlistClient";

export const metadata: Metadata = {
  title: "Watchlist — GIGASCOPE",
  description: "Your personal watchlist. Live prices, change %, sector tag. Stored locally — no login required.",
};

export default function WatchlistPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">Watchlist</h1>
        <p className="text-dim text-sm">
          Stored locally in your browser. No account needed. Add names with the ★ button on any ticker page.
        </p>
      </header>
      <WatchlistClient />
    </div>
  );
}
