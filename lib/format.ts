/** Plain-language labels and number formatting shared across the UI. */
import type {
  ContactLevel,
  Credential,
  Domain,
  OutlookRating,
  Region,
  Riasec,
  StepPhase,
  WorkSetting,
} from "./schema";

export const DOMAIN_LABELS: Record<Domain, string> = {
  diagnostic_imaging: "Diagnostic imaging",
  lab_pathology: "Lab & pathology",
  therapeutics_rehab: "Therapy & rehab",
  maternal_newborn: "Pregnancy & newborns",
  cardiopulmonary_critical: "Heart, lungs & critical care",
  oral_health: "Oral health",
  pharmacy: "Pharmacy",
  nursing: "Nursing",
  emergency: "Emergency care",
  vision: "Vision",
};

export const CONTACT_LABELS: Record<ContactLevel, string> = {
  high: "Lots of patient contact",
  moderate: "Some patient contact",
  technical: "Mostly technical / behind the scenes",
};

export const CREDENTIAL_LABELS: Record<Credential, string> = {
  diploma: "Diploma",
  advanced_diploma: "Advanced diploma",
  degree: "Degree",
  collaborative_degree: "Collaborative degree",
};

export const REGION_LABELS: Record<Region, string> = {
  GTA: "Greater Toronto Area",
  Central: "Central Ontario",
  Eastern: "Eastern Ontario",
  Southwestern: "Southwestern Ontario",
  Northern: "Northern Ontario",
};

export const OUTLOOK_LABELS: Record<OutlookRating, string> = {
  very_good: "Very good",
  good: "Good",
  moderate: "Moderate",
  limited: "Limited",
  very_limited: "Very limited",
  undetermined: "Undetermined",
};

/** 0–1 score for an outlook rating; used by the recommender and the demand meter. */
export const OUTLOOK_SCORE: Record<OutlookRating, number> = {
  very_good: 1,
  good: 0.8,
  moderate: 0.5,
  limited: 0.25,
  very_limited: 0,
  undetermined: 0.5,
};

export const WORK_SETTING_LABELS: Record<WorkSetting, string> = {
  hospital: "Hospitals",
  outpatient_clinic: "Outpatient clinics",
  community: "Community settings",
  private_practice: "Private practice",
  long_term_care: "Long-term care",
  lab: "Laboratories",
  pre_hospital: "Pre-hospital (ambulance)",
};

export const RIASEC_LABELS: Record<Riasec, string> = {
  R: "Realistic (hands-on)",
  I: "Investigative (problem-solving)",
  A: "Artistic (creative)",
  S: "Social (helping)",
  E: "Enterprising (leading)",
  C: "Conventional (organizing)",
};

export const PHASE_LABELS: Record<StepPhase, string> = {
  high_school: "High school",
  application: "Apply",
  program: "Program",
  placement: "Placement",
  exam: "Licensing exam",
  registration: "Registration",
  work: "Work",
};

export const PORTAL_LABELS = { OUAC: "OUAC (universities)", OCAS: "ontariocolleges.ca" } as const;

const cad0 = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const cad2 = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCAD = (n: number) => cad0.format(n);
export const formatHourly = (n: number) => `${cad2.format(n)}/hr`;
export const formatYears = (n: number) => `${n} ${n === 1 ? "year" : "years"}`;
export const formatNumber = (n: number) => n.toLocaleString("en-CA");

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

export const formatAverageRange = (low: number | null, high: number | null) => {
  if (low !== null && high !== null) return low === high ? `${low}%` : `${low}–${high}%`;
  if (low !== null) return `${low}%+`;
  if (high !== null) return `up to ${high}%`;
  return null;
};
