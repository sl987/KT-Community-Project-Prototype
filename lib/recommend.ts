/**
 * Recommendation engine (§8). Deterministic and explainable: every score has a
 * plain-language reason. No LLM, no network. Weights live in data/quiz.json.
 */
import type { ProgramSummary } from "./data";
import { isEligible } from "./eligibility";
import { OUTLOOK_SCORE } from "./format";
import {
  describePrereq,
  matchPrereqs,
  prereqStatus,
  type PrereqMatch,
  type PrereqStatus,
} from "./prereqs";
import {
  RiasecSchema,
  type AcademicFit,
  type MarkSubject,
  type Program,
  type QuizAnswers,
  type QuizConfig,
  type Riasec,
  type WorkStyleKey,
  type WorkStyleProfile,
} from "./schema";

const RIASEC_NAMES: Record<Riasec, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

const likertTo01 = (x: number) => (x - 1) / 4;

// ---------- Component scores ----------

/** Student's 0–1 interest level per Holland code (mean of that code's items). */
export function studentRiasec(
  answers: Pick<QuizAnswers, "interests">,
  config: Pick<QuizConfig, "interestItems">,
): Record<Riasec, number> | null {
  const sums = Object.fromEntries(RiasecSchema.options.map((c) => [c, [] as number[]])) as Record<
    Riasec,
    number[]
  >;
  for (const item of config.interestItems) {
    const a = answers.interests[item.id];
    if (a !== undefined) sums[item.code].push(likertTo01(a));
  }
  if (Object.values(sums).every((v) => v.length === 0)) return null;
  return Object.fromEntries(
    RiasecSchema.options.map((c) => [
      c,
      sums[c].length ? sums[c].reduce((a, b) => a + b, 0) / sums[c].length : 0,
    ]),
  ) as Record<Riasec, number>;
}

/** Cosine similarity between the student's RIASEC vector and the profession's ranked codes. */
export function interestFit(
  student: Record<Riasec, number> | null,
  professionCodes: readonly Riasec[],
  rankWeights: readonly number[],
): number {
  if (!student) return 0.5;
  const prof = Object.fromEntries(RiasecSchema.options.map((c) => [c, 0])) as Record<
    Riasec,
    number
  >;
  professionCodes.forEach((c, i) => (prof[c] = rankWeights[i] ?? 0));
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (const c of RiasecSchema.options) {
    dot += student[c] * prof[c];
    a2 += student[c] ** 2;
    b2 += prof[c] ** 2;
  }
  if (a2 === 0 || b2 === 0) return 0;
  return dot / Math.sqrt(a2 * b2);
}

export interface WorkStyleResult {
  score: number;
  hardMismatches: WorkStyleKey[];
}

/**
 * 1 − mean distance between the student's answers and the profession's profile.
 * "comfort" questions only penalize demand above the student's comfort; "preference"
 * questions penalize distance in either direction. Each hard mismatch (very
 * uncomfortable vs. a frequent demand) multiplies the score by the configured penalty.
 */
export function workStyleFit(
  answers: Pick<QuizAnswers, "workStyle">,
  profile: WorkStyleProfile,
  config: Pick<QuizConfig, "workStyleQuestions" | "hardMismatchMultiplier">,
): WorkStyleResult {
  const dists: number[] = [];
  const hardMismatches: WorkStyleKey[] = [];
  for (const q of config.workStyleQuestions) {
    const a = answers.workStyle[q.key];
    if (a === undefined) continue;
    const s = likertTo01(a);
    const d = profile[q.key] / 2;
    if (q.kind === "comfort") {
      dists.push(Math.max(0, d - s));
      if (a === 1 && profile[q.key] === 2) hardMismatches.push(q.key);
    } else {
      dists.push(Math.abs(d - s));
    }
  }
  if (dists.length === 0) return { score: 0.5, hardMismatches };
  const base = 1 - dists.reduce((x, y) => x + y, 0) / dists.length;
  return { score: base * config.hardMismatchMultiplier ** hardMismatches.length, hardMismatches };
}

/** §8 step 3. Never implies guaranteed admission. */
export function academicFit(
  average: number | null,
  range: Pick<Program["academic"]["admissionAverage"], "low" | "high">,
): AcademicFit {
  if (average === null) return "unknown";
  const lo = range.low ?? range.high;
  const hi = range.high ?? range.low;
  if (lo === null || hi === null) return "unknown";
  if (average >= hi) return "likely";
  if (average >= lo) return "possible";
  if (average >= lo - 5) return "reach";
  return "unlikely";
}

export function preferenceFit(
  answers: Pick<
    QuizAnswers,
    "length" | "institutionType" | "french" | "salaryImportance" | "demandImportance"
  >,
  p: ProgramSummary,
  wageRange: { min: number; max: number } | null,
): number {
  const parts: [weight: number, value: number][] = [];
  if (answers.length !== "any") {
    const short = p.durationYears <= 3;
    parts.push([1, (answers.length === "short") === short ? 1 : 0]);
  }
  if (answers.institutionType !== "any") {
    parts.push([1, p.institutions.some((i) => i.type === answers.institutionType) ? 1 : 0]);
  }
  if (answers.french) parts.push([1, p.french ? 1 : 0]);

  const wage =
    p.medianWage === null || wageRange === null
      ? 0.5
      : wageRange.max === wageRange.min
        ? 1
        : (p.medianWage - wageRange.min) / (wageRange.max - wageRange.min);
  parts.push([likertTo01(answers.salaryImportance), wage]);
  parts.push([likertTo01(answers.demandImportance), p.outlook ? OUTLOOK_SCORE[p.outlook] : 0.5]);

  const total = parts.reduce((s, [w]) => s + w, 0);
  return total === 0 ? 1 : parts.reduce((s, [w, v]) => s + w * v, 0) / total;
}

// ---------- Results ----------

export interface ProgramResult {
  program: ProgramSummary;
  prereq: PrereqMatch;
  prereqStatus: PrereqStatus;
  academicFit: AcademicFit;
  hardMismatches: WorkStyleKey[];
  scores: {
    interest: number;
    workStyle: number;
    preferences: number;
    academic: number;
    total: number;
  };
}

export interface ProfessionResult {
  professionId: string;
  slug: string;
  title: string;
  matchPercent: number;
  programs: ProgramResult[];
  why: string[];
  watchOuts: string[];
}

export interface Recommendation {
  top: ProfessionResult[];
  /** Programs with blocked prerequisites. Never mixed into `top`. */
  extraCourses: ProgramResult[];
}

const SUBJECT_PREFIX: [string, MarkSubject][] = [
  ["SBI", "biology"],
  ["SCH", "chemistry"],
  ["SPH", "physics"],
  ["ENG", "english"],
  ["M", "math"],
];
const subjectOf = (code: string) => SUBJECT_PREFIX.find(([p]) => code.startsWith(p))?.[1];

export function recommend(
  answers: QuizAnswers,
  allPrograms: readonly ProgramSummary[],
  config: QuizConfig,
): Recommendation {
  // 1. Hard filter: the eligibility gate (again), then excluded regions.
  const candidates = allPrograms.filter(
    (p) =>
      isEligible(p) &&
      (answers.regions.length === 0 || p.regions.some((r) => answers.regions.includes(r))),
  );

  const wages = allPrograms.map((p) => p.medianWage).filter((w): w is number => w !== null);
  const wageRange = wages.length ? { min: Math.min(...wages), max: Math.max(...wages) } : null;
  const student = studentRiasec(answers, config);
  const w = config.weights;
  const wSum = w.interest + w.workStyle + w.preferences + w.academic || 1;

  const results: ProgramResult[] = candidates.map((p) => {
    const prereq = matchPrereqs(p.prerequisites, answers.courses);
    const fit = academicFit(answers.average, p.admissionAverage);
    const ws = workStyleFit(answers, p.profession.workStyle, config);
    const scores = {
      interest: interestFit(student, p.profession.riasec, config.riasecRankWeights),
      workStyle: ws.score,
      preferences: preferenceFit(answers, p, wageRange),
      academic: config.academicFitScores[fit],
      total: 0,
    };
    scores.total =
      (w.interest * scores.interest +
        w.workStyle * scores.workStyle +
        w.preferences * scores.preferences +
        w.academic * scores.academic) /
      wSum;
    return {
      program: p,
      prereq,
      prereqStatus: prereqStatus(prereq.missing.length, answers.grade),
      academicFit: fit,
      hardMismatches: ws.hardMismatches,
      scores,
    };
  });

  const byScore = (a: ProgramResult, b: ProgramResult) =>
    b.scores.total - a.scores.total || a.program.slug.localeCompare(b.program.slug);

  const extraCourses = results.filter((r) => r.prereqStatus === "blocked").sort(byScore);
  const open = results.filter((r) => r.prereqStatus !== "blocked");

  const grouped = new Map<string, ProgramResult[]>();
  for (const r of open) {
    grouped.set(r.program.profession.id, [...(grouped.get(r.program.profession.id) ?? []), r]);
  }

  const top = [...grouped.values()]
    .map((list) => list.sort(byScore))
    .sort((a, b) => byScore(a[0], b[0]))
    .slice(0, config.topProfessions)
    .map((list): ProfessionResult => {
      const best = list[0];
      return {
        professionId: best.program.profession.id,
        slug: best.program.profession.slug,
        title: best.program.profession.title,
        matchPercent: Math.round(best.scores.total * 100),
        programs: list.slice(0, config.programsPerProfession),
        why: explainWhy(best, answers, config, student),
        watchOuts: explainWatchOuts(best, answers, config),
      };
    });

  return { top, extraCourses };
}

// ---------- Explanations ----------

export function explainWhy(
  r: ProgramResult,
  answers: QuizAnswers,
  config: QuizConfig,
  student: Record<Riasec, number> | null,
): string[] {
  const why: string[] = [];
  const prof = r.program.profession;

  if (student) {
    const shared = prof.riasec.filter((c) => student[c] >= 0.6).slice(0, 2);
    if (shared.length) {
      why.push(`Strong ${shared.map((c) => RIASEC_NAMES[c]).join(" + ")} interests`);
    }
  }

  const comfortMatches = config.workStyleQuestions.filter((q) => {
    const a = answers.workStyle[q.key];
    if (a === undefined) return false;
    if (q.kind === "comfort") return prof.workStyle[q.key] === 2 && a >= 4;
    return Math.abs(prof.workStyle[q.key] / 2 - likertTo01(a)) <= 0.25;
  });
  for (const q of comfortMatches.slice(0, 2)) why.push(q.matchPhrase);

  if (r.prereqStatus === "met" && r.prereq.total > 0) {
    why.push(
      r.prereq.total === 1
        ? "You have the prerequisite course"
        : `You have all ${r.prereq.total} prerequisites`,
    );
  }
  if (r.academicFit === "likely") {
    why.push("Your average is at or above the program's recent range");
  }
  if (why.length < 2 && r.scores.preferences >= 0.75) {
    why.push("Fits your practical preferences (length, school type, pay, demand)");
  }
  return why.slice(0, 4);
}

export function explainWatchOuts(
  r: ProgramResult,
  answers: QuizAnswers,
  config: QuizConfig,
): string[] {
  const out: string[] = [];
  const prof = r.program.profession;

  for (const m of r.prereq.missing) out.push(`Missing ${describePrereq(m)}`);
  if (r.prereq.unknown || !r.program.prereqsVerified) {
    out.push("Prerequisites not yet verified. Check the official program page");
  }

  for (const pre of r.program.prerequisites) {
    if (pre.minMark == null) continue;
    for (const code of pre.courses) {
      const subject = subjectOf(code);
      const mark = subject ? answers.marks[subject] : undefined;
      if (mark !== undefined && mark < pre.minMark) {
        out.push(`Needs at least ${pre.minMark}% in ${code}`);
      }
    }
  }

  if (r.academicFit === "reach" || r.academicFit === "unlikely") {
    out.push("Competitive average is above your current average");
  } else if (r.academicFit === "unknown" && answers.average !== null) {
    out.push("Admission average not yet verified");
  }

  for (const q of config.workStyleQuestions) {
    const a = answers.workStyle[q.key];
    if (a === undefined) continue;
    const mismatch =
      q.kind === "comfort"
        ? prof.workStyle[q.key] === 2 && a <= 2
        : Math.abs(prof.workStyle[q.key] / 2 - likertTo01(a)) >= 0.75;
    if (mismatch) out.push(q.watchOutPhrase);
  }
  return out;
}
