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
  status: "operational" | "expanding" | "construction" | "planned" | "paused";
  progress: number;
  area: string;
  capacity: string;
  products: string;
  investment: string;
  employees: string;
  color: string;
  featured?: boolean;
  lastUpdated: string; // ISO date string (YYYY-MM-DD)
  milestones: Milestone[];
  timeline: number[]; // progress % per year [2020..2026]
}

export interface NewsItem {
  title: string;
  link: string;
  date: string;
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
