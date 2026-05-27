// Permit aggregation — PoC for Giga Texas only.
//
// Source: City of Austin "Issued Construction Permits" SODA dataset (3syk-w9eu).
// Despite Giga Texas sitting in unincorporated Travis County (ETJ release area),
// the City of Austin dataset includes ETJ-jurisdiction permits — verified by
// querying the live endpoint for permits with TESLA in the address (197 records
// historically, addresses 12733 / 13101 TESLA RD, lat ~30.224 / lon ~-97.618).
//
// No API key required. Dataset refreshes daily. Field shapes documented inline
// below since SODA does not expose a typed schema.

/** Resource ID for the "Issued Construction Permits" dataset on data.austintexas.gov. */
const AUSTIN_PERMITS_RESOURCE = "3syk-w9eu";
const AUSTIN_SODA_BASE = `https://data.austintexas.gov/resource/${AUSTIN_PERMITS_RESOURCE}.json`;

/** Approx Giga Texas centroid — used as a backup geo filter. */
const GIGA_TEXAS_LAT = 30.22;
const GIGA_TEXAS_LON = -97.62;
const GEO_BOX_HALF_DEG = 0.02; // ~2.2km box around centroid
// FP epsilon for the inclusive boundary check. Without this, a permit
// geocoded exactly to the corner (30.24, -97.60) would silently miss
// because 30.24 - 30.22 === 0.020000000000000018 > 0.02 in IEEE-754.
const GEO_BOX_EPS = 1e-9;

// SODA returns optional string fields — every key may be absent. Keep the raw
// shape loose and let the normalizer coerce.
interface RawAustinPermit {
  permit_number?: string;
  permit_type_desc?: string;
  permit_class?: string;
  permit_class_mapped?: string;
  work_class?: string;
  description?: string;
  permit_location?: string;
  original_address1?: string;
  original_city?: string;
  original_state?: string;
  original_zip?: string;
  applieddate?: string;
  issue_date?: string;
  status_current?: string;
  latitude?: string;
  longitude?: string;
  total_existing_bldg_sqft?: string;
  total_new_add_bldg_sqft?: string;
  remodel_repair_sqft?: string;
  total_valuation_remodel?: string;
  total_job_valuation?: string;
  building_valuation?: string;
  plumbing_valuation?: string;
  electrical_valuation?: string;
  mechanical_valuation?: string;
  applicant_full_name?: string;
  contractor_company_name?: string;
  contractor_full_name?: string;
  project_id?: string;
  jurisdiction?: string;
}

/** Normalized permit shape the rest of the app talks to. */
export interface Permit {
  /** Unique permit ID — used as the dedup key. e.g. "2026-064079 PP". */
  id: string;
  address: string;
  city: string;
  zip: string;
  type: string;
  workClass: string;
  description: string;
  /** Square footage when available — sum of new + remodel sqft. null if neither present. */
  sqft: number | null;
  /** Total declared valuation in USD — sum of all *_valuation fields. null if none present. */
  valuation: number | null;
  /** ISO timestamp — applied date is the earlier signal; falls back to issue_date. */
  filedAt: string | null;
  applicant: string | null;
  contractor: string | null;
  status: string | null;
  jurisdiction: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Deep link to the dataset's row for human inspection. */
  sourceUrl: string;
}

function toNumber(v: string | undefined): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function sumNumeric(...vs: Array<string | undefined>): number | null {
  let total = 0;
  let any = false;
  for (const v of vs) {
    const n = toNumber(v);
    if (n !== null) {
      total += n;
      any = true;
    }
  }
  return any ? total : null;
}

// SODA exposes both a master `total_job_valuation` field AND per-trade
// breakdowns (building / plumbing / electrical / mechanical / remodel).
// On many rows the master is the SUM of the trades, so summing all six
// double-counts every dollar. Pick the master when present, otherwise
// fall back to summing the trade-specific sub-fields.
function pickValuation(raw: RawAustinPermit): number | null {
  const master = toNumber(raw.total_job_valuation);
  if (master !== null) return master;
  return sumNumeric(
    raw.building_valuation,
    raw.plumbing_valuation,
    raw.electrical_valuation,
    raw.mechanical_valuation,
    raw.total_valuation_remodel,
  );
}

function normalize(raw: RawAustinPermit): Permit | null {
  const id = raw.permit_number?.trim();
  if (!id) return null;
  return {
    id,
    address: raw.original_address1 ?? raw.permit_location ?? "",
    city: raw.original_city ?? "",
    zip: raw.original_zip ?? "",
    type: raw.permit_type_desc ?? "",
    workClass: raw.work_class ?? "",
    description: raw.description ?? "",
    sqft: sumNumeric(raw.total_new_add_bldg_sqft, raw.remodel_repair_sqft),
    valuation: pickValuation(raw),
    filedAt: raw.applieddate ?? raw.issue_date ?? null,
    applicant: raw.applicant_full_name ?? raw.contractor_company_name ?? null,
    contractor: raw.contractor_company_name ?? raw.contractor_full_name ?? null,
    status: raw.status_current ?? null,
    jurisdiction: raw.jurisdiction ?? null,
    latitude: toNumber(raw.latitude),
    longitude: toNumber(raw.longitude),
    // Public dataset row deep-link. Permit numbers contain a space (e.g.
    // "2026-064079 PP") so encode them.
    sourceUrl: `https://data.austintexas.gov/resource/${AUSTIN_PERMITS_RESOURCE}.json?permit_number=${encodeURIComponent(id)}`,
  };
}

/**
 * Pull recent permits matching TESLA in the address from the City of Austin SODA endpoint.
 *
 * @param lookbackDays - how far back to look for newly-applied permits. Defaults to 14d.
 *   The cron runs every 4 hours, so 14d is huge overkill, but it makes the system robust
 *   to extended outages without missing permits.
 */
export async function fetchTravisPermits(lookbackDays = 14): Promise<Permit[]> {
  const sinceMs = Date.now() - lookbackDays * 24 * 60 * 60 * 1000;
  const sinceIso = new Date(sinceMs).toISOString().slice(0, 10); // YYYY-MM-DD
  // SODA query:
  //  - address LIKE %TESLA%
  //  - applieddate >= sinceIso  (catch newly-filed permits even if not yet issued)
  //  - order by applieddate DESC, then issue_date DESC, then permit_number DESC for
  //    stable ordering when applieddate ties.
  //  - limit 200 — Tesla Road averages 1-3 permits/month, so 200 covers years.
  const whereClause = encodeURIComponent(
    `upper(original_address1) like '%TESLA%' AND applieddate >= '${sinceIso}T00:00:00.000'`,
  );
  const orderClause = encodeURIComponent("applieddate DESC, issue_date DESC, permit_number DESC");
  const url = `${AUSTIN_SODA_BASE}?$where=${whereClause}&$order=${orderClause}&$limit=200`;

  const res = await fetch(url, {
    // SODA caches at the CDN; bypass to ensure freshness on each cron tick.
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`SODA fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as RawAustinPermit[];
  if (!Array.isArray(data)) return [];

  const normalized: Permit[] = [];
  for (const raw of data) {
    const p = normalize(raw);
    if (p) normalized.push(p);
  }
  return normalized;
}

function isGigaTexasMatch(p: Permit): boolean {
  const addr = (p.address || "").toUpperCase();
  const desc = (p.description || "").toUpperCase();
  // Primary: address contains TESLA — the SODA query already enforces this,
  // but we re-check defensively in case the caller passes in permits from a
  // different source.
  if (addr.includes("TESLA")) return true;
  // Secondary: description mentions Giga / Tesla — covers permits whose
  // address might be a contractor's staging yard rather than 1 Tesla Rd.
  if (desc.includes("GIGA") && desc.includes("TESLA")) return true;
  // Tertiary: lat/lon falls inside a small bounding box around the Giga Texas
  // centroid. Useful for permits where the address is "BLDG GAR" or similar
  // with no street info but the geocode is correct.
  if (p.latitude !== null && p.longitude !== null) {
    const dLat = Math.abs(p.latitude - GIGA_TEXAS_LAT);
    const dLon = Math.abs(p.longitude - GIGA_TEXAS_LON);
    if (dLat <= GEO_BOX_HALF_DEG + GEO_BOX_EPS && dLon <= GEO_BOX_HALF_DEG + GEO_BOX_EPS) {
      return true;
    }
  }
  return false;
}

/** Filter a list of normalized permits down to those at Giga Texas. */
export function filterGigaTexas(permits: Permit[]): Permit[] {
  return permits.filter(isGigaTexasMatch);
}

/** Convenience: source label for emails / debug output. */
export const PERMIT_SOURCE_LABEL = "City of Austin Open Data (Issued Construction Permits)";
