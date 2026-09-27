import type { Program } from "./schema";

/**
 * The eligibility gate (BUILD_PLAN.md §1). Evaluated per program, never per profession.
 * A program that fails this must never render, whatever else the data says.
 */
export const isEligible = (p: Pick<Program, "eligibility">): boolean =>
  p.eligibility.directEntryFromHighSchool &&
  p.eligibility.singleCredentialToPractice &&
  !p.eligibility.requiresFurtherEducation;

/** Programs the site may show: owner-published AND passing the gate. */
export const shownPrograms = <P extends Pick<Program, "eligibility" | "published">>(
  programs: readonly P[],
): P[] => programs.filter((p) => p.published && isEligible(p));
