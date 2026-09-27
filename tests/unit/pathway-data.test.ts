import { describe, expect, it } from "vitest";
import quizJson from "@/data/quiz.json";
import {
  getProfession,
  getRegulator,
  listedProfessions,
  programSummaries,
  programs,
} from "@/lib/data";
import { isEligible } from "@/lib/eligibility";
import { buildPathway, collectSourceUrls } from "@/lib/pathway";
import { validateData } from "@/lib/validate";
import courses from "@/data/courses.json";
import institutions from "@/data/institutions.json";
import professions from "@/data/professions.json";
import programsJson from "@/data/programs.json";
import regulators from "@/data/regulators.json";

describe("lib/data", () => {
  it("only exposes published programs that pass the gate", () => {
    expect(programs.length).toBeGreaterThan(0);
    expect(programs.every((p) => p.published && isEligible(p))).toBe(true);
    expect(programSummaries.map((s) => s.slug)).toEqual(programs.map((p) => p.slug));
  });

  it("only lists professions that have a shown program", () => {
    for (const prof of listedProfessions) {
      expect(programs.some((p) => p.professionId === prof.id)).toBe(true);
    }
  });
});

describe("buildPathway", () => {
  const program = programs[0];
  const profession = getProfession(program.professionId)!;
  const regulator = getRegulator(profession.regulatorId);

  it("keeps timeline order and attaches data to the right steps", () => {
    const steps = buildPathway(program, profession, regulator);
    expect(steps.map((s) => s.order)).toEqual([...steps.map((s) => s.order)].sort((a, b) => a - b));
    const app = steps.find((s) => s.phase === "application")!;
    expect(app.facts.find((f) => f.label === "Program code")).toBeDefined();
    const reg = steps.find((s) => s.phase === "registration")!;
    expect(reg.facts.find((f) => f.label === "Regulator")?.value).toBe(regulator?.name);
    const exam = steps.find((s) => s.phase === "exam" && !/jurisprudence/i.test(s.title))!;
    expect(exam.facts.some((f) => f.label.startsWith(profession.licensing.exams[0].name))).toBe(
      true,
    );
  });

  it("adds a jurisprudence step when required but missing from the timeline", () => {
    const trimmed = {
      ...program,
      timeline: program.timeline.filter((s) => !/jurisprudence/i.test(s.title)),
    };
    const withJuris = {
      ...profession,
      licensing: {
        ...profession.licensing,
        jurisprudenceExam: { required: true, sourceUrl: null },
      },
    };
    const steps = buildPathway(trimmed, withJuris, regulator);
    expect(steps.filter((s) => /jurisprudence/i.test(s.title))).toHaveLength(1);
  });

  it("places non-academic requirements at the step they're due", () => {
    const p = {
      ...program,
      nonAcademic: [
        { type: "vulnerable_sector_check" as const, label: "Police check", sourceUrl: null },
        {
          type: "health_form" as const,
          label: "Health form",
          stage: "before_start" as const,
          sourceUrl: null,
        },
      ],
    };
    const steps = buildPathway(p, profession, regulator);
    const placement = steps.find((s) => s.phase === "placement")!;
    const firstProgram = steps.find((s) => s.phase === "program")!;
    expect(placement.lists.find((l) => l.title === "Due before placements")?.items).toEqual([
      "Police check",
    ]);
    expect(firstProgram.lists.find((l) => l.title === "Due before you start")?.items).toEqual([
      "Health form",
    ]);
  });
});

describe("collectSourceUrls", () => {
  it("finds every sourceUrl, deduplicated", () => {
    expect(
      collectSourceUrls({
        a: { sourceUrl: "https://x" },
        b: [{ sourceUrl: "https://x" }, { sourceUrl: null }],
      }),
    ).toEqual(["https://x"]);
  });
});

describe("content validation", () => {
  const base = { regulators, institutions, professions, programs: programsJson, courses };

  it("accepts the real quiz config", () => {
    expect(validateData({ ...base, quiz: quizJson }).errors).toEqual([]);
  });

  it("rejects a quiz config missing a Holland code or a work-style question", () => {
    const quiz = structuredClone(quizJson);
    quiz.interestItems = quiz.interestItems.map((i) => (i.code === "E" ? { ...i, code: "S" } : i));
    quiz.workStyleQuestions = quiz.workStyleQuestions.filter((q) => q.key !== "needles");
    const errors = validateData({ ...base, quiz }).errors.join("\n");
    expect(errors).toMatch(/no interest item for Holland code "E"/);
    expect(errors).toMatch(/"needles" must have exactly one question/);
  });

  it("rejects journeys that reference unknown professions", () => {
    const journeys = [
      {
        id: "j",
        title: "J",
        summary: "S",
        steps: [
          { professionId: "ghost", label: "G", role: "R" },
          { professionId: null, label: "H", role: "R" },
        ],
      },
    ];
    expect(validateData({ ...base, journeys }).errors.join("\n")).toMatch(
      /unknown profession "ghost"/,
    );
  });
});
