/** Course matching and gap analysis against a program's prerequisites. */
import type { Prerequisite } from "./schema";

export interface PrereqMatch {
  /** Prerequisite groups the student has covered. */
  met: Prerequisite[];
  /** Prerequisite groups the student is missing. */
  missing: Prerequisite[];
  total: number;
  metCount: number;
  /** True when the program lists no prerequisites (usually: not yet verified). */
  unknown: boolean;
}

/** A group is met when the student has its course ("required") or any one of its courses ("anyOf"). */
export const isPrereqMet = (p: Prerequisite, courses: ReadonlySet<string>) =>
  p.courses.some((c) => courses.has(c));

export function matchPrereqs(
  prerequisites: readonly Prerequisite[],
  courses: Iterable<string>,
): PrereqMatch {
  const have = new Set(courses);
  const met = prerequisites.filter((p) => isPrereqMet(p, have));
  const missing = prerequisites.filter((p) => !isPrereqMet(p, have));
  return {
    met,
    missing,
    total: prerequisites.length,
    metCount: met.length,
    unknown: prerequisites.length === 0,
  };
}

/** "SCH4U" or "MHF4U or MCV4U" */
export const describePrereq = (p: Prerequisite) => p.courses.join(" or ");

export type PrereqStatus = "met" | "fixable" | "blocked";

/**
 * §8 step 2: met = nothing missing; fixable = missing 1–2 while in Grade 11, or 1 in Grade 12;
 * blocked = more than that. An unknown grade is treated as Grade 12 (the stricter case).
 */
export function prereqStatus(missingCount: number, grade: 11 | 12 | null): PrereqStatus {
  if (missingCount === 0) return "met";
  const allowance = grade === 11 ? 2 : 1;
  return missingCount <= allowance ? "fixable" : "blocked";
}
