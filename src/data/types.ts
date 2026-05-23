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
