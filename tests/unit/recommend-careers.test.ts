import { describe, expect, it } from "vitest";
import quizJson from "@/data/quiz.json";
import { careerFields, quizCandidates } from "@/lib/data";
import { recommendCareers } from "@/lib/recommend";
import { QuizConfigSchema } from "@/lib/schema";
import { answers } from "../fixtures/summaries";

const config = QuizConfigSchema.parse(quizJson);

describe("quiz candidates", () => {
  it("include every featured profession and link it to its career page", () => {
    for (const f of careerFields) {
      const c = quizCandidates.find((q) => q.featured?.href === `/careers/${f.field}`);
      expect(c, f.field).toBeDefined();
    }
  });
  it("give non-featured professions a summary and a program search", () => {
    for (const c of quizCandidates.filter((q) => !q.featured)) {
      expect(c.summary.length).toBeGreaterThan(0);
      expect(c.search.length).toBeGreaterThan(0);
    }
  });
});

describe("recommendCareers", () => {
  it("ranks every profession, not just ones with program data", () => {
    const r = recommendCareers(answers(), quizCandidates, config);
    expect(r).toHaveLength(quizCandidates.length);
    expect(r.length).toBeGreaterThan(4);
  });

  it("filters by program type, keeping professions you can enter either way", () => {
    const r = recommendCareers(answers({ programType: "college" }), quizCandidates, config);
    expect(r.every((x) => x.candidate.entry !== "university")).toBe(true);
    expect(r.some((x) => x.candidate.entry === "either")).toBe(true);
  });

  it("puts emergency-care careers lower for students uncomfortable with emergencies", () => {
    const calm = recommendCareers(
      answers({ workStyle: { acuteEmergency: 1, bloodAndBodyFluids: 1, needles: 1 } }),
      quizCandidates,
      config,
    );
    const ids = calm.map((x) => x.candidate.id);
    expect(ids.indexOf("paramedic")).toBeGreaterThan(ids.length / 2);
    const para = calm.find((x) => x.candidate.id === "paramedic");
    expect(para?.watchOuts.length).toBeGreaterThan(0);
  });

  it("does not let courses or average change the order", () => {
    const a = recommendCareers(answers({ courses: [], average: null }), quizCandidates, config);
    const b = recommendCareers(
      answers({ courses: ["SBI4U", "SCH4U"], average: 95 }),
      quizCandidates,
      config,
    );
    expect(b.map((x) => x.candidate.id)).toEqual(a.map((x) => x.candidate.id));
  });
});
