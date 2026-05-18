export type Company = "tesla" | "spacex" | "xai" | "neuralink" | "boring" | "joint";

export interface Milestone {
  date: string;
  text: string;
  done: boolean;
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
  status: "operational" | "expanding" | "construction" | "planned" | "paused";
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
