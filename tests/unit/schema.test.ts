import { describe, expect, it } from "vitest";
import { PrerequisiteSchema, ProgramSchema } from "@/lib/schema";
import { eligibleProgram, ineligibleProgram } from "../fixtures/programs";

describe("ProgramSchema", () => {
  it("accepts both fixtures", () => {
    expect(ProgramSchema.safeParse(eligibleProgram).success).toBe(true);
    expect(ProgramSchema.safeParse(ineligibleProgram).success).toBe(true);
  });

  it("rejects a malformed course code", () => {
    const p = {
      ...eligibleProgram,
      academic: {
        ...eligibleProgram.academic,
        prerequisites: [{ kind: "required", courses: ["chem12"] }],
      },
    };
    expect(ProgramSchema.safeParse(p).success).toBe(false);
  });

  it("rejects an average range where low > high", () => {
    const p = {
      ...eligibleProgram,
      academic: {
        ...eligibleProgram.academic,
        admissionAverage: {
          low: 90,
          high: 80,
          type: "competitive",
          cycle: "2025 entry",
          sourceUrl: "https://example.ca",
        },
      },
    };
    expect(ProgramSchema.safeParse(p).success).toBe(false);
  });
});

describe("PrerequisiteSchema", () => {
  it('requires exactly one course for kind "required"', () => {
    expect(
      PrerequisiteSchema.safeParse({ kind: "required", courses: ["MHF4U", "MCV4U"] }).success,
    ).toBe(false);
    expect(
      PrerequisiteSchema.safeParse({ kind: "anyOf", courses: ["MHF4U", "MCV4U"] }).success,
    ).toBe(true);
  });
});
