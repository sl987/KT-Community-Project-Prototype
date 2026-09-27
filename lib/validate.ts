/**
 * Data validation rules (BUILD_PLAN.md §2, §5). Pure functions so they can be
 * unit tested; scripts/validate-data.ts is the CLI wrapper that runs as `prebuild`.
 *
 * Errors fail the build. Warnings (unverified or stale data) are reported only.
 */
import { z } from "zod";
import { isEligible } from "./eligibility";
import {
  CoursesFileSchema,
  InstitutionsFileSchema,
  ProfessionsFileSchema,
  ProgramsFileSchema,
  RegulatorsFileSchema,
  type CoursesFile,
  type Institution,
  type Profession,
  type Program,
  type Provenance,
  type RegulatoryBody,
  type StepPhase,
} from "./schema";

export const STALE_AFTER_DAYS = 90;

export interface RawData {
  regulators: unknown;
  institutions: unknown;
  professions: unknown;
  programs: unknown;
  courses: unknown;
}

export interface ParsedData {
  regulators: RegulatoryBody[];
  institutions: Institution[];
  professions: Profession[];
  programs: Program[];
  courses: CoursesFile;
}

export interface VerificationItem {
  record: string;
  paths: string[];
}

export interface StaleItem {
  record: string;
  lastVerified: string | null;
  verifiedBy: Provenance["verifiedBy"];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  needsVerification: VerificationItem[];
  stale: StaleItem[];
  data: ParsedData | null;
}

type Path = (string | number)[];

// ---------- Helpers ----------

const pathToString = (path: Path) => path.join(".");

/** True when `path` equals a listed path or sits underneath one. */
const isCovered = (path: string, listed: readonly string[]) =>
  listed.some((p) => path === p || path.startsWith(`${p}.`));

const pathExists = (obj: unknown, dotted: string): boolean => {
  let cur: unknown = obj;
  for (const seg of dotted.split(".")) {
    if (cur === null || typeof cur !== "object" || !(seg in cur)) return false;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return true;
};

/** Every path in `obj` whose value is `null`, ignoring the provenance block itself. */
const nullPaths = (obj: unknown, prefix: Path = []): string[] => {
  if (obj === null) return [pathToString(prefix)];
  if (typeof obj !== "object") return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    prefix.length === 0 && k === "provenance" ? [] : nullPaths(v, [...prefix, k]),
  );
};

const isSourcedShape = (v: unknown): v is { value: unknown; sourceUrl: unknown } =>
  v !== null &&
  typeof v === "object" &&
  Object.keys(v).length === 2 &&
  "value" in v &&
  "sourceUrl" in v;

/** Rule 2: any `{ value, sourceUrl }` pair with a value must also carry its source. */
const unsourcedValues = (obj: unknown, prefix: Path = []): string[] => {
  if (obj === null || typeof obj !== "object") return [];
  if (isSourcedShape(obj)) {
    return obj.value !== null && obj.sourceUrl === null ? [pathToString(prefix)] : [];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    unsourcedValues(v, [...prefix, k]),
  );
};

const duplicates = (values: readonly string[]) => [
  ...new Set(values.filter((v, i) => values.indexOf(v) !== i)),
];

const daysBetween = (isoDate: string, today: Date) =>
  Math.floor((today.getTime() - new Date(`${isoDate}T00:00:00Z`).getTime()) / 86_400_000);

// ---------- Timeline ----------

/**
 * The phases a timeline must contain, in this relative order. `exam` is only
 * required when the profession has licensing exams.
 */
export const requiredPhases = (hasExams: boolean): StepPhase[] =>
  hasExams
    ? ["high_school", "application", "program", "exam", "registration", "work"]
    : ["high_school", "application", "program", "registration", "work"];

/** Returns the first required phase that is missing or out of order, or null if OK. */
export const checkTimelineOrder = (
  timeline: Pick<Program["timeline"][number], "order" | "phase">[],
  hasExams: boolean,
): string | null => {
  const phases = [...timeline].sort((a, b) => a.order - b.order).map((s) => s.phase);
  let from = 0;
  for (const phase of requiredPhases(hasExams)) {
    const at = phases.indexOf(phase, from);
    if (at === -1) {
      return phases.includes(phase)
        ? `"${phase}" step appears before an earlier required phase`
        : `missing a "${phase}" step`;
    }
    from = at + 1;
  }
  return null;
};

// ---------- Main ----------

export function validateData(raw: RawData, today: Date = new Date()): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Schema parse. Stop here if anything is malformed: later checks assume valid shapes.
  const files = {
    "regulators.json": [RegulatorsFileSchema, raw.regulators],
    "institutions.json": [InstitutionsFileSchema, raw.institutions],
    "professions.json": [ProfessionsFileSchema, raw.professions],
    "programs.json": [ProgramsFileSchema, raw.programs],
    "courses.json": [CoursesFileSchema, raw.courses],
  } as const;
  const parsed: Record<string, unknown> = {};
  for (const [file, [schema, value]] of Object.entries(files)) {
    const r = (schema as z.ZodType).safeParse(value);
    if (r.success) parsed[file] = r.data;
    else errors.push(`${file} failed schema validation:\n${z.prettifyError(r.error)}`);
  }
  if (errors.length > 0) return { errors, warnings, needsVerification: [], stale: [], data: null };

  const data: ParsedData = {
    regulators: parsed["regulators.json"] as RegulatoryBody[],
    institutions: parsed["institutions.json"] as Institution[],
    professions: parsed["professions.json"] as Profession[],
    programs: parsed["programs.json"] as Program[],
    courses: parsed["courses.json"] as CoursesFile,
  };
  const { regulators, institutions, professions, programs, courses } = data;

  // 2. Unique ids and slugs.
  const uniqueChecks: [string, string[]][] = [
    ["regulator id", regulators.map((r) => r.id)],
    ["institution id", institutions.map((i) => i.id)],
    ["profession id", professions.map((p) => p.id)],
    ["profession slug", professions.map((p) => p.slug)],
    ["program id", programs.map((p) => p.id)],
    ["program slug", programs.map((p) => p.slug)],
    ["course code", courses.courses.map((c) => c.code)],
  ];
  for (const [label, values] of uniqueChecks) {
    for (const dup of duplicates(values)) errors.push(`Duplicate ${label}: "${dup}"`);
  }

  // 3. References resolve.
  const regulatorIds = new Set(regulators.map((r) => r.id));
  const institutionIds = new Set(institutions.map((i) => i.id));
  const professionsById = new Map(professions.map((p) => [p.id, p]));
  const courseCodes = new Set(courses.courses.map((c) => c.code));

  for (const prof of professions) {
    if (!regulatorIds.has(prof.regulatorId)) {
      errors.push(`Profession "${prof.id}": regulatorId "${prof.regulatorId}" not found`);
    }
    for (const tc of prof.teamConnections) {
      if (!professionsById.has(tc.professionId)) {
        errors.push(
          `Profession "${prof.id}": teamConnections references unknown profession "${tc.professionId}"`,
        );
      }
    }
  }

  for (const prog of programs) {
    const where = `Program "${prog.id}"`;
    const prof = professionsById.get(prog.professionId);
    if (!prof) errors.push(`${where}: professionId "${prog.professionId}" not found`);
    for (const instId of prog.institutionIds) {
      if (!institutionIds.has(instId)) errors.push(`${where}: institutionId "${instId}" not found`);
    }

    // 4. Course codes exist.
    for (const prereq of prog.academic.prerequisites) {
      for (const code of prereq.courses) {
        if (!courseCodes.has(code))
          errors.push(`${where}: prerequisite course "${code}" is not in courses.json`);
      }
    }

    // 5. Timeline covers the full path, in order.
    const orders = prog.timeline.map((s) => String(s.order));
    for (const dup of duplicates(orders)) errors.push(`${where}: duplicate timeline order ${dup}`);
    if (prof) {
      const problem = checkTimelineOrder(prog.timeline, prof.licensing.exams.length > 0);
      if (problem) errors.push(`${where}: timeline ${problem}`);
    }

    // 6. The eligibility gate.
    if (prog.published && !isEligible(prog)) {
      errors.push(
        `${where} is published but fails isEligible(). Unpublish it or fix its eligibility data.`,
      );
    }
  }

  // 7. Provenance: facts need sources; nulls must be flagged; report unverified + stale.
  const records: [string, { provenance: Provenance }][] = [
    ...regulators.map((r) => [`regulator:${r.id}`, r] as [string, RegulatoryBody]),
    ...institutions.map((i) => [`institution:${i.id}`, i] as [string, Institution]),
    ...professions.map((p) => [`profession:${p.id}`, p] as [string, Profession]),
    ...programs.map((p) => [`program:${p.id}`, p] as [string, Program]),
    ["courses.json", courses],
  ];

  const needsVerification: VerificationItem[] = [];
  const stale: StaleItem[] = [];

  for (const [key, record] of records) {
    const { needsVerification: listed, lastVerified, verifiedBy } = record.provenance;

    for (const path of unsourcedValues(record)) {
      errors.push(`${key}: "${path}" has a value but no sourceUrl (Data Integrity Rule 2)`);
    }
    for (const path of nullPaths(record)) {
      if (!isCovered(path, listed)) {
        warnings.push(`${key}: "${path}" is null but not listed in provenance.needsVerification`);
      }
    }
    for (const path of listed) {
      if (!pathExists(record, path)) {
        warnings.push(`${key}: needsVerification path "${path}" does not exist on the record`);
      }
    }

    if (listed.length > 0) needsVerification.push({ record: key, paths: listed });
    if (lastVerified === null || daysBetween(lastVerified, today) > STALE_AFTER_DAYS) {
      stale.push({ record: key, lastVerified, verifiedBy });
    }
  }

  return { errors, warnings, needsVerification, stale, data };
}
