import type { Company, Factory } from "./types";
import localData from "../../public/data/factories.json";

interface FactoryData {
  lastUpdated: string;
  totalInvestment: string;
  timelineYears: number[];
  factories: Factory[];
}

const data: FactoryData = localData as FactoryData;

export const DATA_LAST_UPDATED = data.lastUpdated;
export const TIMELINE_YEARS = data.timelineYears;
export const factories: Factory[] = data.factories;

export function getFactory(slug: string): Factory | undefined {
  return factories.find((f) => f.slug === slug);
}

export const getSite = getFactory;

export function getSitesByCompany(company: Company): Factory[] {
  return factories.filter((f) => f.company === company);
}

export function getTotalInvestment(): string {
  return data.totalInvestment;
}
