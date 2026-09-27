import { describe, expect, it } from "vitest";
import { checkTimelineOrder, validateData, type RawData } from "@/lib/validate";
import type { Profession, Program } from "@/lib/schema";
import courses from "@/data/courses.json";
import institutions from "@/data/institutions.json";
import professions from "@/data/professions.json";
import programs from "@/data/programs.json";
import regulators from "@/data/regulators.json";
import { ineligibleProgram } from "../fixtures/programs";

/** Fresh deep copy of the real seed data, safe to mutate per test. */
const seed = () =>
  structuredClone({ regulators, institutions, professions, programs, courses }) as unknown as {
    regulators: unknown[];
    institutions: unknown[];
    professions: Profession[];
    programs: Program[];
    courses: typeof courses;
  };

const TODAY = new Date("2026-09-26T00:00:00Z");
const run = (raw: RawData) => validateData(raw, TODAY);

describe("validateData on the seed data", () => {
  it("passes with no errors", () => {
    const r = run(seed());
    expect(r.errors).toEqual([]);
    expect(r.data?.programs).toHaveLength(7);
  });

  it("reports needsVerification for every seed record", () => {
    const r = run(seed());
    expect(r.needsVerification.map((v) => v.record)).toContain("program:humber-practical-nursing");
    expect(r.needsVerification.every((v) => v.paths.length > 0)).toBe(true);
  });

  it("has no unflagged null fields", () => {
    expect(run(seed()).warnings).toEqual([]);
  });
});

describe("validateData failures", () => {
  it("fails on schema errors", () => {
    const d = seed();
    (d.programs[0] as unknown as Record<string, unknown>).credential = "certificate";
    const r = run(d);
    expect(r.data).toBeNull();
    expect(r.errors[0]).toMatch(/programs\.json failed schema validation/);
  });

  it("fails when a published program fails the eligibility gate", () => {
    const d = seed();
    d.programs.push({
      ...structuredClone(d.programs[0]),
      id: "bad",
      slug: "bad",
      eligibility: ineligibleProgram.eligibility,
    });
    expect(run(d).errors).toContainEqual(
      expect.stringMatching(/"bad" is published but fails isEligible/),
    );
  });

  it("allows an ineligible program that is not published", () => {
    const d = seed();
    d.programs.push({
      ...structuredClone(d.programs[0]),
      id: "bad",
      slug: "bad",
      eligibility: ineligibleProgram.eligibility,
      published: false,
    });
    expect(run(d).errors).toEqual([]);
  });

  it("fails on unresolved references", () => {
    const d = seed();
    d.programs[0].professionId = "nope";
    d.programs[1].institutionIds = ["nowhere"];
    d.professions[0].regulatorId = "ghost";
    const errors = run(d).errors.join("\n");
    expect(errors).toMatch(/professionId "nope" not found/);
    expect(errors).toMatch(/institutionId "nowhere" not found/);
    expect(errors).toMatch(/regulatorId "ghost" not found/);
  });

  it("fails on course codes missing from courses.json", () => {
    const d = seed();
    d.programs[0].academic.prerequisites = [{ kind: "required", courses: ["XYZ4U"] }];
    expect(run(d).errors).toContainEqual(expect.stringMatching(/"XYZ4U" is not in courses.json/));
  });

  it("fails on duplicate ids", () => {
    const d = seed();
    d.programs[1].id = d.programs[0].id;
    expect(run(d).errors).toContainEqual(expect.stringMatching(/Duplicate program id/));
  });

  it("fails when a Sourced value has no sourceUrl", () => {
    const d = seed();
    d.programs[0].application.programCode = { value: "ABC1", sourceUrl: null };
    expect(run(d).errors).toContainEqual(
      expect.stringMatching(/application\.programCode" has a value but no sourceUrl/),
    );
  });

  it("rejects an admission average without a cycle", () => {
    const d = seed();
    d.programs[0].academic.admissionAverage = {
      low: 80,
      high: 85,
      type: "competitive",
      cycle: null,
      sourceUrl: "https://example.ca",
    };
    expect(run(d).errors[0]).toMatch(/cycle and sourceUrl/);
  });

  it("warns (not fails) about null fields missing from needsVerification", () => {
    const d = seed();
    d.programs[0].provenance.needsVerification = [];
    const r = run(d);
    expect(r.errors).toEqual([]);
    expect(r.warnings.some((w) => w.includes("application.programCode.value"))).toBe(true);
  });

  it("flags records verified more than 90 days ago as stale", () => {
    const d = seed();
    d.programs[0].provenance = {
      lastVerified: "2026-01-01",
      verifiedBy: "human",
      needsVerification: [],
    };
    d.programs[1].provenance = {
      lastVerified: "2026-09-01",
      verifiedBy: "human",
      needsVerification: [],
    };
    const stale = run(d).stale.map((s) => s.record);
    expect(stale).toContain(`program:${d.programs[0].id}`);
    expect(stale).not.toContain(`program:${d.programs[1].id}`);
  });
});

describe("checkTimelineOrder", () => {
  const steps = (...phases: Program["timeline"][number]["phase"][]) =>
    phases.map((phase, i) => ({ order: i + 1, phase }));

  it("accepts the full path with placements interleaved", () => {
    expect(
      checkTimelineOrder(
        steps(
          "high_school",
          "application",
          "program",
          "placement",
          "program",
          "exam",
          "exam",
          "registration",
          "work",
        ),
        true,
      ),
    ).toBeNull();
  });

  it("requires an exam step only when the profession has exams", () => {
    const noExam = steps("high_school", "application", "program", "registration", "work");
    expect(checkTimelineOrder(noExam, false)).toBeNull();
    expect(checkTimelineOrder(noExam, true)).toMatch(/missing a "exam" step/);
  });

  it("rejects steps out of order", () => {
    expect(
      checkTimelineOrder(
        steps("high_school", "application", "exam", "program", "registration", "work"),
        true,
      ),
    ).toMatch(/"exam" step appears before/);
  });

  it("sorts by `order`, not array position", () => {
    const shuffled = [
      { order: 6, phase: "work" as const },
      { order: 1, phase: "high_school" as const },
      { order: 3, phase: "program" as const },
      { order: 2, phase: "application" as const },
      { order: 5, phase: "registration" as const },
      { order: 4, phase: "exam" as const },
    ];
    expect(checkTimelineOrder(shuffled, true)).toBeNull();
  });
});
