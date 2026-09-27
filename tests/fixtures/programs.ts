import type { Program } from "@/lib/schema";

/** A minimal, schema-valid program that passes the eligibility gate. */
export const eligibleProgram: Program = {
  id: "fixture-eligible",
  slug: "fixture-eligible",
  professionId: "fixture-profession",
  institutionIds: ["fixture-college"],
  name: "Fixture Eligible Program",
  credential: "diploma",
  credentialName: "Ontario College Diploma",
  durationYears: 2,
  coop: false,
  accredited: { byBody: null, sourceUrl: null },
  application: {
    portal: "OCAS",
    programCode: { value: null, sourceUrl: null },
    intakes: ["fall"],
  },
  academic: {
    prerequisites: [{ kind: "required", courses: ["ENG4C"] }],
    admissionAverage: { low: null, high: null, type: "competitive", cycle: null, sourceUrl: null },
    supplementary: [],
    programRequirements: [],
  },
  nonAcademic: [],
  clinicalPlacements: { description: "Fixture placements.", sourceUrl: null },
  timeline: [
    { order: 1, phase: "high_school", title: "HS", description: "HS" },
    { order: 2, phase: "application", title: "Apply", description: "Apply" },
    { order: 3, phase: "program", title: "Year 1", description: "Year 1" },
    { order: 4, phase: "exam", title: "Exam", description: "Exam" },
    { order: 5, phase: "registration", title: "Register", description: "Register" },
    { order: 6, phase: "work", title: "Work", description: "Work" },
  ],
  eligibility: {
    directEntryFromHighSchool: true,
    singleCredentialToPractice: true,
    requiresFurtherEducation: false,
    rationale: "Fixture: passes all three checks.",
    sourceUrl: null,
  },
  published: true,
  provenance: {
    lastVerified: null,
    verifiedBy: null,
    needsVerification: ["accredited", "application", "academic", "clinicalPlacements"],
  },
};

/**
 * Deliberately ineligible: a program that requires prior university study
 * (like a post-degree accelerated track). It must never be shown.
 */
export const ineligibleProgram: Program = {
  ...eligibleProgram,
  id: "fixture-ineligible-post-degree",
  slug: "fixture-ineligible-post-degree",
  name: "Fixture Post-Degree Program (ineligible)",
  eligibility: {
    directEntryFromHighSchool: false,
    singleCredentialToPractice: true,
    requiresFurtherEducation: false,
    rationale: "Fixture: requires a prior university degree, so fails check 1.",
    sourceUrl: null,
  },
};
