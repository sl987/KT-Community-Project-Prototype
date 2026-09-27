/** Discovery-hub filtering (§7.3). Pure, so it can be unit tested and shared. */
import type { ProgramSummary } from "./data";
import { matchPrereqs } from "./prereqs";
import type { ContactLevel, Credential, Domain, Portal, Region } from "./schema";

export interface Filters {
  courses: string[];
  /** Only programs whose prerequisites the student fully has. */
  qualified: boolean;
  domain: Domain[];
  contact: ContactLevel[];
  credential: Credential[];
  maxYears: number | null;
  region: Region[];
  portal: Portal[];
  coop: boolean;
  french: boolean;
  /** Outlook "good" or better. */
  goodOutlook: boolean;
  minWage: number | null;
  maxWage: number | null;
}

export const EMPTY_FILTERS: Filters = {
  courses: [],
  qualified: false,
  domain: [],
  contact: [],
  credential: [],
  maxYears: null,
  region: [],
  portal: [],
  coop: false,
  french: false,
  goodOutlook: false,
  minWage: null,
  maxWage: null,
};

const anyOf = <T>(selected: readonly T[], value: T) =>
  selected.length === 0 || selected.includes(value);

/**
 * Returns programs matching every active filter. Programs with an unverified
 * (null) value are excluded by filters on that value, since we cannot confirm a match.
 */
export function applyFilters(programs: readonly ProgramSummary[], f: Filters): ProgramSummary[] {
  return programs.filter((p) => {
    if (!anyOf(f.domain, p.profession.domain)) return false;
    if (!anyOf(f.contact, p.profession.contactLevel)) return false;
    if (!anyOf(f.credential, p.credential)) return false;
    if (f.maxYears !== null && p.durationYears > f.maxYears) return false;
    if (f.region.length > 0 && !p.regions.some((r) => f.region.includes(r))) return false;
    if (!anyOf(f.portal, p.portal)) return false;
    if (f.coop && !p.coop) return false;
    if (f.french && !p.french) return false;
    if (f.goodOutlook && p.outlook !== "good" && p.outlook !== "very_good") return false;
    if (f.minWage !== null && (p.medianWage === null || p.medianWage < f.minWage)) return false;
    if (f.maxWage !== null && (p.medianWage === null || p.medianWage > f.maxWage)) return false;
    if (f.qualified) {
      const m = matchPrereqs(p.prerequisites, f.courses);
      if (m.unknown || m.missing.length > 0) return false;
    }
    return true;
  });
}

/** Number of active filters, excluding the course selection itself. */
export const activeFilterCount = (f: Filters) =>
  [
    f.qualified,
    f.domain.length > 0,
    f.contact.length > 0,
    f.credential.length > 0,
    f.maxYears !== null,
    f.region.length > 0,
    f.portal.length > 0,
    f.coop,
    f.french,
    f.goodOutlook,
    f.minWage !== null || f.maxWage !== null,
  ].filter(Boolean).length;
