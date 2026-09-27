import type { ProgramSummary } from "@/lib/data";
import { DEFAULT_ANSWERS } from "@/lib/quiz-encoding";
import type { QuizAnswers, WorkStyleProfile } from "@/lib/schema";

const flatStyle: WorkStyleProfile = {
  bloodAndBodyFluids: 1,
  needles: 1,
  physicalDemand: 1,
  shiftWork: 1,
  acuteEmergency: 1,
  techEquipment: 1,
  patientInteraction: 1,
  independence: 1,
};

type Overrides = Omit<Partial<ProgramSummary>, "profession"> & {
  profession?: Partial<ProgramSummary["profession"]>;
};

/** A fully-populated, eligible program summary; override what each test needs. */
export function summary(o: Overrides = {}): ProgramSummary {
  const slug = o.slug ?? "prog-a";
  const { profession, ...rest } = o;
  return {
    id: slug,
    slug,
    name: `Program ${slug}`,
    credential: "diploma",
    durationYears: 2,
    coop: false,
    portal: "OCAS",
    programCode: null,
    institutions: [
      { id: "c1", name: "College One", city: "Toronto", region: "GTA", type: "college" },
    ],
    regions: ["GTA"],
    french: false,
    medianWage: 30,
    outlook: "good",
    prerequisites: [
      { kind: "required", courses: ["ENG4C"] },
      { kind: "required", courses: ["SBI3C"] },
    ],
    prereqsVerified: true,
    admissionAverage: {
      low: 70,
      high: 80,
      type: "competitive",
      cycle: "2026 entry",
      sourceUrl: "https://example.ca",
    },
    supplementary: [],
    nonAcademic: [],
    humanVerified: true,
    eligibility: {
      directEntryFromHighSchool: true,
      singleCredentialToPractice: true,
      requiresFurtherEducation: false,
      rationale: "fixture",
      sourceUrl: null,
    },
    ...rest,
    profession: {
      id: `prof-${slug}`,
      slug: `prof-${slug}`,
      title: `Profession ${slug}`,
      domain: "nursing",
      contactLevel: "high",
      riasec: ["S", "I"],
      workStyle: flatStyle,
      exams: ["Exam"],
      jurisprudence: false,
      ...profession,
    },
  };
}

export const answers = (o: Partial<QuizAnswers> = {}): QuizAnswers => ({
  ...DEFAULT_ANSWERS,
  grade: 12,
  ...o,
});
