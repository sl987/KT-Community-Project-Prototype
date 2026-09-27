/**
 * Typed, gate-enforced access to /data for the app. JSON is parsed through Zod
 * at import time, so malformed data throws during the build even if
 * validate-data was skipped.
 */
import coursesJson from "@/data/courses.json";
import institutionsJson from "@/data/institutions.json";
import professionsJson from "@/data/professions.json";
import programsJson from "@/data/programs.json";
import regulatorsJson from "@/data/regulators.json";
import { shownPrograms } from "./eligibility";
import {
  CoursesFileSchema,
  InstitutionsFileSchema,
  ProfessionsFileSchema,
  ProgramsFileSchema,
  RegulatorsFileSchema,
} from "./schema";

export const regulators = RegulatorsFileSchema.parse(regulatorsJson);
export const institutions = InstitutionsFileSchema.parse(institutionsJson);
export const professions = ProfessionsFileSchema.parse(professionsJson);
export const courses = CoursesFileSchema.parse(coursesJson).courses;

/** Only published programs that pass isEligible(). Never read programs.json directly. */
export const programs = shownPrograms(ProgramsFileSchema.parse(programsJson));

export const getProfession = (id: string) => professions.find((p) => p.id === id);
export const getInstitution = (id: string) => institutions.find((i) => i.id === id);
export const getRegulator = (id: string) => regulators.find((r) => r.id === id);
