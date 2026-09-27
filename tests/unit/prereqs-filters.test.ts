import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, activeFilterCount, applyFilters } from "@/lib/filters";
import { matchPrereqs, prereqStatus } from "@/lib/prereqs";
import { summary } from "../fixtures/summaries";

describe("matchPrereqs", () => {
  const prereqs = [
    { kind: "required" as const, courses: ["ENG4U"] },
    { kind: "anyOf" as const, courses: ["MHF4U", "MCV4U"] },
    { kind: "required" as const, courses: ["SCH4U"] },
  ];

  it("counts required and any-of groups", () => {
    const m = matchPrereqs(prereqs, ["ENG4U", "MCV4U"]);
    expect(m.metCount).toBe(2);
    expect(m.total).toBe(3);
    expect(m.missing.map((p) => p.courses)).toEqual([["SCH4U"]]);
  });

  it("flags an empty prerequisite list as unknown, not met", () => {
    expect(matchPrereqs([], ["ENG4U"]).unknown).toBe(true);
  });
});

describe("prereqStatus", () => {
  it("allows 2 missing in Grade 11 but only 1 in Grade 12", () => {
    expect(prereqStatus(0, 12)).toBe("met");
    expect(prereqStatus(2, 11)).toBe("fixable");
    expect(prereqStatus(3, 11)).toBe("blocked");
    expect(prereqStatus(1, 12)).toBe("fixable");
    expect(prereqStatus(2, 12)).toBe("blocked");
  });

  it("treats an unknown grade as Grade 12", () => {
    expect(prereqStatus(2, null)).toBe("blocked");
  });
});

describe("applyFilters", () => {
  const a = summary({ slug: "a", durationYears: 2, medianWage: 30, outlook: "good" });
  const b = summary({
    slug: "b",
    credential: "degree",
    programType: "university",
    durationYears: 4,
    portal: "OUAC",
    coop: true,
    medianWage: null,
    outlook: null,
    regions: ["Eastern"],
    profession: { domain: "diagnostic_imaging", contactLevel: "technical" },
  });
  const all = [a, b];
  const ids = (f: Partial<typeof EMPTY_FILTERS>) =>
    applyFilters(all, { ...EMPTY_FILTERS, ...f }).map((p) => p.slug);

  it("returns everything with no filters", () => {
    expect(ids({})).toEqual(["a", "b"]);
  });

  it("filters by facets", () => {
    expect(ids({ domain: ["diagnostic_imaging"] })).toEqual(["b"]);
    expect(ids({ contact: ["high"] })).toEqual(["a"]);
    expect(ids({ credential: ["degree"] })).toEqual(["b"]);
    expect(ids({ maxYears: 3 })).toEqual(["a"]);
    expect(ids({ region: ["Eastern"] })).toEqual(["b"]);
    expect(ids({ portal: ["OCAS"] })).toEqual(["a"]);
    expect(ids({ coop: true })).toEqual(["b"]);
    expect(ids({ programType: ["university"] })).toEqual(["b"]);
    expect(ids({ programType: ["college"] })).toEqual(["a"]);
  });

  it("excludes unverified (null) values from wage and outlook filters", () => {
    expect(ids({ goodOutlook: true })).toEqual(["a"]);
    expect(ids({ minWage: 25 })).toEqual(["a"]);
    expect(ids({ maxWage: 25 })).toEqual([]);
  });

  it("'qualified' keeps only programs whose prerequisites are all met", () => {
    expect(ids({ qualified: true, courses: ["ENG4C", "SBI4U"] })).toEqual(["a", "b"]);
    expect(ids({ qualified: true, courses: ["ENG4C"] })).toEqual([]);
  });

  it("counts active filters", () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(
      activeFilterCount({ ...EMPTY_FILTERS, coop: true, domain: ["nursing"], minWage: 20 }),
    ).toBe(3);
  });
});
