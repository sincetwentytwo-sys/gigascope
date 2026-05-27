// Loader for AI-augmented inference articles surfaced under /pulse/[slug].
//
// Mirrors the static-JSON pattern of `factories.ts`: the canonical data
// lives in `public/data/analyses.json`, imported at build time so SSG +
// generateStaticParams can enumerate every analysis without a runtime
// fetch. See `src/data/types.ts` for the `Analysis` shape.

import data from "../../public/data/analyses.json";
import type { Analysis } from "./types";

export const analyses = data as Analysis[];

/** Resolve a single analysis by its `/pulse/[slug]` slug. */
export function getAnalysisBySlug(slug: string): Analysis | undefined {
  return analyses.find((a) => a.slug === slug);
}

/**
 * Analyses that cross-link to the given factory slug, newest first.
 * Used by `/site/[slug]` to render a "Related analysis" box next to
 * milestones — call site skips the box entirely when this returns [].
 */
export function getAnalysesForFactory(factorySlug: string): Analysis[] {
  return analyses
    .filter((a) => a.factoryRefs.includes(factorySlug))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Most recent analyses across all sites — used on the /pulse index. */
export function getLatestAnalyses(limit = 5): Analysis[] {
  return [...analyses]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}
