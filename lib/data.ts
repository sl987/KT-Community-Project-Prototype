/**
 * Typed, gate-enforced access to /data for the app. JSON is parsed through Zod
 * at import time, so malformed data throws during the build even if
 * validate-data was skipped.
 *
 * Server-only in practice: client components receive the serializable
 * summaries below as props instead of importing this module.
 */
import coursesJson from "@/data/courses.json";
import guideJson from "@/data/guide.json";
import institutionsJson from "@/data/institutions.json";
import journeysJson from "@/data/journeys.json";
import professionsJson from "@/data/professions.json";
import programsJson from "@/data/programs.json";
import quizJson from "@/data/quiz.json";
import regulatorsJson from "@/data/regulators.json";
import { shownPrograms } from "./eligibility";
import { isFlagged, latestVerified } from "./provenance";
import {
  CoursesFileSchema,
  GuideSchema,
  InstitutionsFileSchema,
  JourneysFileSchema,
  ProfessionsFileSchema,
  ProgramsFileSchema,
  QuizConfigSchema,
  RegulatorsFileSchema,
  type Credential,
  type Domain,
  type ContactLevel,
  type OutlookRating,
  type Prerequisite,
  programTypeOf,
  type Program,
  type ProgramType,
  type Region,
  type Riasec,
  type WorkStyleProfile,
} from "./schema";

export const regulators = RegulatorsFileSchema.parse(regulatorsJson);
export const institutions = InstitutionsFileSchema.parse(institutionsJson);
export const professions = ProfessionsFileSchema.parse(professionsJson);
export const courses = CoursesFileSchema.parse(coursesJson).courses;
export const quizConfig = QuizConfigSchema.parse(quizJson);
export const guide = GuideSchema.parse(guideJson);
export const journeys = JourneysFileSchema.parse(journeysJson);

/** Only published programs that pass isEligible(). Never read programs.json directly. */
export const programs = shownPrograms(ProgramsFileSchema.parse(programsJson));

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
export const getProfession = (id: string) => professions.find((p) => p.id === id);
export const getProfessionBySlug = (slug: string) => professions.find((p) => p.slug === slug);
export const getInstitution = (id: string) => institutions.find((i) => i.id === id);
export const getRegulator = (id: string) => regulators.find((r) => r.id === id);

export const programsForProfession = (professionId: string) =>
  programs.filter((p) => p.professionId === professionId);

/** Professions with at least one shown program. Professions with none are not listed. */
export const listedProfessions = professions.filter((prof) =>
  programs.some((p) => p.professionId === prof.id),
);

export const programInstitutions = (p: Program) =>
  p.institutionIds.map((id) => getInstitution(id)).filter((i) => i !== undefined);

/** Newest verification date across all records ("Last data update" in the footer). */
export const lastDataUpdate = latestVerified([
  ...regulators,
  ...institutions,
  ...professions,
  ...programs,
  { provenance: CoursesFileSchema.parse(coursesJson).provenance },
  guide,
]);

// ---------- Serializable summaries for client components ----------

export interface ProgramSummary {
  id: string;
  slug: string;
  name: string;
  credential: Credential;
  /** University (incl. collaborative/joint degrees) or college. */
  programType: ProgramType;
  durationYears: number;
  coop: boolean;
  portal: "OUAC" | "OCAS";
  programCode: string | null;
  institutions: {
    id: string;
    name: string;
    city: string;
    region: Region;
    type: "university" | "college";
  }[];
  regions: Region[];
  profession: {
    id: string;
    slug: string;
    title: string;
    domain: Domain;
    contactLevel: ContactLevel;
    riasec: Riasec[];
    workStyle: WorkStyleProfile;
    exams: string[];
    jurisprudence: boolean;
  };
  medianWage: number | null;
  outlook: OutlookRating | null;
  prerequisites: Prerequisite[];
  /** False while the prerequisite list is flagged as unverified. */
  prereqsVerified: boolean;
  admissionAverage: Program["academic"]["admissionAverage"];
  supplementary: string[];
  nonAcademic: string[];
  humanVerified: boolean;
  /** Carried through so the recommender can re-check the gate (§1). */
  eligibility: Program["eligibility"];
}

export function summarizeProgram(p: Program): ProgramSummary {
  const prof = getProfession(p.professionId);
  if (!prof) throw new Error(`Program ${p.id}: unknown profession ${p.professionId}`);
  const insts = programInstitutions(p);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    credential: p.credential,
    programType: programTypeOf(p.credential),
    durationYears: p.durationYears,
    coop: p.coop,
    portal: p.application.portal,
    programCode: p.application.programCode.value,
    institutions: insts.map((i) => ({
      id: i.id,
      name: i.name,
      city: i.city,
      region: i.region,
      type: i.type,
    })),
    regions: [...new Set(insts.map((i) => i.region))],
    profession: {
      id: prof.id,
      slug: prof.slug,
      title: prof.title,
      domain: prof.domain,
      contactLevel: prof.contactLevel,
      riasec: prof.riasec,
      workStyle: prof.workStyle,
      exams: prof.licensing.exams.map((e) => e.name),
      jurisprudence: prof.licensing.jurisprudenceExam?.required ?? false,
    },
    medianWage: prof.labourMarket.wageOntario.median,
    outlook: prof.labourMarket.outlook.rating,
    prerequisites: p.academic.prerequisites,
    prereqsVerified: !isFlagged(p.provenance, "academic.prerequisites"),
    admissionAverage: p.academic.admissionAverage,
    supplementary: p.academic.supplementary.map((s) => s.label),
    nonAcademic: p.nonAcademic.map((n) => n.label),
    humanVerified: p.provenance.verifiedBy === "human",
    eligibility: p.eligibility,
  };
}

export const programSummaries: ProgramSummary[] = programs.map(summarizeProgram);

export interface CourseOption {
  code: string;
  name: string;
  grade: 12;
  subject: string;
}

export const courseOptions: CourseOption[] = courses.map((c) => ({
  code: c.code,
  name: c.name,
  grade: c.grade,
  subject: c.subject,
}));
