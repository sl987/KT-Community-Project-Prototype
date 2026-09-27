import { describe, expect, it } from "vitest";
import quizJson from "@/data/quiz.json";
import { programSummaries } from "@/lib/data";
import {
  academicFit,
  interestFit,
  preferenceFit,
  recommend,
  studentRiasec,
  workStyleFit,
} from "@/lib/recommend";
import { QuizConfigSchema } from "@/lib/schema";
import { answers, summary } from "../fixtures/summaries";

const config = QuizConfigSchema.parse(quizJson);

describe("academicFit", () => {
  const range = { low: 80, high: 85 };
  it("maps averages to fit bands", () => {
    expect(academicFit(90, range)).toBe("likely");
    expect(academicFit(85, range)).toBe("likely");
    expect(academicFit(82, range)).toBe("possible");
    expect(academicFit(76, range)).toBe("reach");
    expect(academicFit(75, range)).toBe("reach");
    expect(academicFit(74.9, range)).toBe("unlikely");
  });
  it("is unknown when the average or range is missing", () => {
    expect(academicFit(null, range)).toBe("unknown");
    expect(academicFit(90, { low: null, high: null })).toBe("unknown");
  });
});

describe("interestFit", () => {
  it("is 1 for a perfectly aligned student and lower for a mismatch", () => {
    const s = { R: 0, I: 0.67, A: 0, S: 1, E: 0, C: 0 };
    expect(interestFit(s, ["S", "I"], [1, 0.67])).toBeCloseTo(1, 5);
    const opposite = { R: 0, I: 0, A: 1, S: 0, E: 1, C: 0 };
    expect(interestFit(opposite, ["S", "I"], [1, 0.67])).toBe(0);
  });
  it("is neutral (0.5) when no interest questions were answered", () => {
    expect(interestFit(studentRiasec({ interests: {} }, config), ["S"], [1])).toBe(0.5);
  });
});

describe("workStyleFit", () => {
  const profile = { ...summary().profession.workStyle, bloodAndBodyFluids: 2 as const };

  it("heavily penalizes a hard mismatch (very uncomfortable vs. frequent)", () => {
    const comfy = workStyleFit({ workStyle: { bloodAndBodyFluids: 5 } }, profile, config);
    const soft = workStyleFit({ workStyle: { bloodAndBodyFluids: 2 } }, profile, config);
    const hard = workStyleFit({ workStyle: { bloodAndBodyFluids: 1 } }, profile, config);
    expect(comfy.score).toBe(1);
    expect(hard.hardMismatches).toEqual(["bloodAndBodyFluids"]);
    expect(soft.hardMismatches).toEqual([]);
    expect(hard.score).toBeLessThanOrEqual(soft.score * config.hardMismatchMultiplier);
  });

  it("does not penalize comfort above what the job needs", () => {
    const low = { ...profile, needles: 0 as const };
    expect(workStyleFit({ workStyle: { needles: 5 } }, low, config).score).toBe(1);
  });

  it("penalizes preference distance in both directions", () => {
    const p = { ...profile, patientInteraction: 2 as const };
    expect(workStyleFit({ workStyle: { patientInteraction: 1 } }, p, config).score).toBe(0);
    expect(workStyleFit({ workStyle: { patientInteraction: 5 } }, p, config).score).toBe(1);
  });
});

describe("preferenceFit", () => {
  it("rewards matching length and institution type", () => {
    const p = summary({ durationYears: 2 });
    const base = {
      institutionType: "any",
      french: false,
      salaryImportance: 1,
      demandImportance: 1,
    } as const;
    expect(preferenceFit({ ...base, length: "short" }, p, null)).toBe(1);
    expect(preferenceFit({ ...base, length: "long" }, p, null)).toBe(0);
  });
});

describe("recommend", () => {
  it("never recommends an ineligible program, even if it is in the input", () => {
    const bad = summary({
      slug: "bad",
      eligibility: { ...summary().eligibility, requiresFurtherEducation: true },
    });
    const r = recommend(
      answers({ courses: ["ENG4C", "SBI3C"] }),
      [bad, summary({ slug: "ok" })],
      config,
    );
    const all = [...r.top.flatMap((t) => t.programs), ...r.extraCourses].map((x) => x.program.slug);
    expect(all).toEqual(["ok"]);
  });

  it("puts blocked-prerequisite programs in extraCourses, never in top", () => {
    const blocked = summary({
      slug: "blocked",
      prerequisites: [
        { kind: "required", courses: ["SCH4U"] },
        { kind: "required", courses: ["SPH4U"] },
      ],
    });
    const r = recommend(answers({ grade: 12, courses: [] }), [blocked], config);
    expect(r.top).toEqual([]);
    expect(r.extraCourses.map((x) => x.program.slug)).toEqual(["blocked"]);
  });

  it("treats 2 missing courses in Grade 11 as fixable", () => {
    const p = summary({ slug: "p" });
    const r = recommend(answers({ grade: 11, courses: [] }), [p], config);
    expect(r.top[0].programs[0].prereqStatus).toBe("fixable");
    expect(r.top[0].watchOuts).toContain("Missing ENG4C");
  });

  it("drops programs outside the student's chosen regions", () => {
    const gta = summary({ slug: "gta" });
    const north = summary({ slug: "north", regions: ["Northern"] });
    const r = recommend(
      answers({ regions: ["Northern"], courses: ["ENG4C", "SBI3C"] }),
      [gta, north],
      config,
    );
    expect(r.top.flatMap((t) => t.programs.map((x) => x.program.slug))).toEqual(["north"]);
  });

  it("ranks the better interest match first and explains why", () => {
    const social = summary({ slug: "social", profession: { riasec: ["S"] } });
    const tech = summary({ slug: "tech", profession: { riasec: ["R", "C"] } });
    const likesPeople = answers({
      courses: ["ENG4C", "SBI3C"],
      interests: { s1: 5, s2: 5, s3: 5, r1: 1, r2: 1, r3: 1, c1: 1, c2: 1, c3: 1 },
    });
    const r = recommend(likesPeople, [tech, social], config);
    expect(r.top.map((t) => t.slug)).toEqual(["prof-social", "prof-tech"]);
    expect(r.top[0].why).toContain("Strong Social interests");
    expect(r.top[0].why).toContain("You have all 2 prerequisites");
    expect(r.top[0].matchPercent).toBeGreaterThan(r.top[1].matchPercent);
  });

  it("groups programs by profession, best first, and caps the list", () => {
    const progs = Array.from({ length: 5 }, (_, i) =>
      summary({
        slug: `p${i}`,
        medianWage: 20 + i,
        profession: { id: "same", slug: "same", title: "Same" },
      }),
    );
    const r = recommend(
      answers({ courses: ["ENG4C", "SBI3C"], salaryImportance: 5 }),
      progs,
      config,
    );
    expect(r.top).toHaveLength(1);
    expect(r.top[0].programs.map((p) => p.program.slug)).toEqual(["p4", "p3", "p2"]);
  });

  it("flags watch-outs for shift work and a high average", () => {
    const p = summary({
      slug: "p",
      admissionAverage: {
        low: 85,
        high: 90,
        type: "competitive",
        cycle: "2026 entry",
        sourceUrl: "https://example.ca",
      },
      profession: { workStyle: { ...summary().profession.workStyle, shiftWork: 2 } },
    });
    const r = recommend(
      answers({ average: 70, courses: ["ENG4C", "SBI3C"], workStyle: { shiftWork: 2 } }),
      [p],
      config,
    );
    expect(r.top[0].watchOuts).toEqual(
      expect.arrayContaining([
        "Competitive average is above your current average",
        "Involves shift work (nights, weekends, holidays)",
      ]),
    );
  });

  it("works on the real seed data and only returns shown programs", () => {
    const r = recommend(answers(), programSummaries, config);
    const slugs = new Set(programSummaries.map((p) => p.slug));
    for (const t of r.top) for (const p of t.programs) expect(slugs.has(p.program.slug)).toBe(true);
    expect(r.top.length).toBeGreaterThan(0);
  });

  it("is deterministic", () => {
    const a = answers({ interests: { s1: 4, i1: 5 }, workStyle: { needles: 3 } });
    expect(recommend(a, programSummaries, config)).toEqual(recommend(a, programSummaries, config));
  });
});
