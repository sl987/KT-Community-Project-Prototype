import { describe, expect, it } from "vitest";
import { isEligible, shownPrograms } from "@/lib/eligibility";
import { eligibleProgram, ineligibleProgram } from "../fixtures/programs";

const withGate = (gate: Partial<typeof eligibleProgram.eligibility>) => ({
  ...eligibleProgram,
  eligibility: { ...eligibleProgram.eligibility, ...gate },
});

describe("isEligible", () => {
  it("passes a program that meets all three checks", () => {
    expect(isEligible(eligibleProgram)).toBe(true);
  });

  it("fails when not open to direct entry from high school", () => {
    expect(isEligible(withGate({ directEntryFromHighSchool: false }))).toBe(false);
  });

  it("fails when the credential alone does not qualify for registration", () => {
    expect(isEligible(withGate({ singleCredentialToPractice: false }))).toBe(false);
  });

  it("fails when further education is required to practise", () => {
    expect(isEligible(withGate({ requiresFurtherEducation: true }))).toBe(false);
  });

  it("fails every combination except the single passing one", () => {
    const bools = [true, false];
    for (const direct of bools)
      for (const single of bools)
        for (const further of bools) {
          const expected = direct && single && !further;
          const p = withGate({
            directEntryFromHighSchool: direct,
            singleCredentialToPractice: single,
            requiresFurtherEducation: further,
          });
          expect(isEligible(p)).toBe(expected);
        }
  });

  it("rejects the deliberately ineligible fixture", () => {
    expect(isEligible(ineligibleProgram)).toBe(false);
  });
});

describe("shownPrograms", () => {
  it("excludes the ineligible fixture even when it is marked published", () => {
    expect(ineligibleProgram.published).toBe(true);
    const shown = shownPrograms([eligibleProgram, ineligibleProgram]);
    expect(shown.map((p) => p.id)).toEqual([eligibleProgram.id]);
  });

  it("excludes unpublished programs even when eligible", () => {
    expect(shownPrograms([{ ...eligibleProgram, published: false }])).toEqual([]);
  });
});
