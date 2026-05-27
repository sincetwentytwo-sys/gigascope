export type Company = "tesla" | "spacex" | "xai" | "neuralink" | "boring" | "joint";

export interface Source {
  url: string;
  label: string;
  date: string; // YYYY-MM-DD or YYYY-Qx or YYYY-MM
}

export interface Milestone {
  date: string;
  text: string;
  done: boolean;

  /** 신뢰도 수준: high=1차 출처+검증, medium=복수 보도, low=추정, speculative=공식 발표/계획 */
  confidence?: 'high' | 'medium' | 'low' | 'speculative';
  /** 개별 마일스톤에 대한 출처 (복수 가능) */
  sources?: Source[];
  /** 사람이 마지막으로 검증한 날짜 (YYYY-MM-DD) */
  lastVerified?: string;

  /**
   * Primary-source URL for this milestone (FAA notice, SEC filing,
   * county building permit, IR press release, etc.). Rendered as a small
   * "[source]" link on the site detail page. Optional — milestones without
   * a verified URL fall back to a citation-less entry.
   */
  sourceUrl?: string;
}

export interface Factory {
  id: string;
  slug: string;
  name: string;
  aka: string;
  flag: string;
  location: string;
  lat: number;
  lng: number;
  company: Company;
  status: "operational" | "expanding" | "construction" | "announced" | "planned" | "paused";
  progress: number;
  area: string;
  capacity: string;
  products: string;
  investment: string;
  employees: string;
  color: string;
  featured?: boolean;
  extras?: Record<string, string>;
  lastUpdated: string;
  milestones: Milestone[];
  timeline: number[];

  /** 공장 전체에 대한 출처 (복수 가능) */
  sources?: Source[];
  /** 공장 데이터 전체 신뢰도 */
  confidence?: 'high' | 'medium' | 'low' | 'speculative';
  /** 사람이 마지막으로 전체 데이터를 검증한 날짜 */
  lastVerified?: string;

  /** 타임랩스 캡처용 (빌드 스크립트 전용) */
  halfKm?: number;

  /**
   * Timelapse asset slug — overrides `slug` when looking up
   * `public/timelapses/<x>.mp4`, `<x>-first.jpg`, `<x>-last.jpg`, etc.
   * Defaults to `slug` when unset. Set to `null` to declare "no timelapse
   * assets exist yet" (renderer falls back to the no-timelapse path).
   *
   * Introduced 2026-05-27 when `starbase` was split into `starbase-launch`
   * (which reuses the legacy `starbase` video files) + `starbase-build`
   * (no assets yet).
   */
  timelapseSlug?: string | null;
}

export interface CompanyMeta {
  id: Company;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface NewsItem {
  title: string;
  link: string;
  date: string;
  timestamp: number;
  source: string;
}

export interface TileSource {
  name: string;
  label: string;
  source: string;
  url: string;
  maxZoom: number;
  attribution?: string;
}

/**
 * AI-augmented inference article published under /pulse/[slug].
 *
 * Introduced 2026-05-27: gigascope shifts from "static data catalog" to
 * "AI workflow output". An `Analysis` is a markdown-rendered article that
 * cross-links to one or more `factories.json` entries via `factoryRefs`,
 * carries a `confidence` tag (verified/medium/speculative), and cites
 * primary sources in `sources`.
 */
export type Analysis = {
  /** URL slug under /pulse/[slug] */
  slug: string;
  /** Headline */
  title: string;
  /** Small kicker label, e.g. "Permit-driven inference · Giga Texas" */
  kicker: string;
  /** ISO datetime */
  publishedAt: string;
  /** Factory slugs this analysis cross-links — must match factories.json */
  factoryRefs: string[];
  /** Confidence tier — controls badge color on the page */
  confidence: "verified" | "medium" | "speculative";
  /** Article body, markdown */
  bodyMarkdown: string;
  /** Primary-source citations */
  sources: Array<{ url: string; label: string }>;
  /** Free-form tags */
  tags: string[];
};
