import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import institutions from "@/data/institutions.json";
import professions from "@/data/professions.json";
import programs from "@/data/programs.json";
import regulators from "@/data/regulators.json";
import {
  applyStagingRows,
  formatPrBody,
  isHighRisk,
  parseCell,
  parseCsv,
  parseStagingValues,
  type DataFiles,
  type StagingRow,
} from "@/lib/sync";
import { buildAllowList, isAllowedSource } from "@/scripts/allowed-domains";

const data = () =>
  structuredClone({
    program: programs,
    profession: professions,
    institution: institutions,
    regulator: regulators,
  }) as unknown as DataFiles;

const allow = buildAllowList([...regulators, ...institutions].map((r) => r.url));

const row = (o: Partial<StagingRow>): StagingRow => ({
  rowNumber: 2,
  recordType: "program",
  recordId: "humber-practical-nursing",
  fieldPath: "application.programCode.value",
  oldValue: "",
  newValue: '"ABC"',
  sourceUrl: "https://humber.ca/page",
  evidenceNote: "",
  detectedAt: "2026-09-01",
  agentConfidence: "0.9",
  status: "approved",
  reviewedBy: "owner",
  reviewedAt: "2026-09-02",
  ...o,
});

describe("allowed domains", () => {
  it("allows official domains and their subdomains over https only", () => {
    expect(isAllowedSource("https://www.jobbank.gc.ca/x", allow)).toBe(true);
    expect(isAllowedSource("https://humber.ca/x", allow)).toBe(true);
    expect(isAllowedSource("https://sub.humber.ca/x", allow)).toBe(true);
    expect(isAllowedSource("http://humber.ca/x", allow)).toBe(false);
    expect(isAllowedSource("https://www.reddit.com/r/x", allow)).toBe(false);
    expect(isAllowedSource("https://humber.ca.evil.com/x", allow)).toBe(false);
    expect(isAllowedSource("not a url", allow)).toBe(false);
  });
});

describe("parsing", () => {
  it("parses quoted CSV with escaped quotes and JSON cells", () => {
    const rows = parseCsv('a,b\n"x,1","[{""k"":1}]"\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["x,1", '[{"k":1}]'],
    ]);
  });

  it("parses cells as JSON when possible", () => {
    expect(parseCell("")).toBeNull();
    expect(parseCell("82")).toBe(82);
    expect(parseCell('"MHF4U"')).toBe("MHF4U");
    expect(parseCell("MHF4U")).toBe("MHF4U");
  });

  it("requires every staging column", () => {
    expect(() => parseStagingValues([["recordType"]])).toThrow(/missing columns/);
  });
});

describe("applyStagingRows", () => {
  it("applies an approved row, sets its source, and clears needsVerification", () => {
    const d = data();
    const prog = d.program[0] as { provenance: { needsVerification: string[] } };
    prog.provenance.needsVerification.push("application.programCode");
    const r = applyStagingRows(d, [row({})], allow);
    expect(r.applied).toHaveLength(1);
    const out = r.data.program[0] as {
      application: { programCode: { value: string; sourceUrl: string } };
      provenance: { needsVerification: string[] };
    };
    expect(out.application.programCode).toEqual({
      value: "ABC",
      sourceUrl: "https://humber.ca/page",
    });
    expect(out.provenance.needsVerification).not.toContain("application.programCode");
    // Input is not mutated.
    expect((d.program[0] as typeof out).application.programCode.value).toBeNull();
  });

  it("rejects rows without an official source", () => {
    const r = applyStagingRows(
      data(),
      [row({ sourceUrl: "" }), row({ sourceUrl: "https://blog.example.com" })],
      allow,
    );
    expect(r.applied).toHaveLength(0);
    expect(r.rejected.map((x) => x.reason)).toEqual([
      "missing sourceUrl",
      expect.stringMatching(/not on an allowed official domain/),
    ]);
  });

  it("skips rows that are not approved", () => {
    const r = applyStagingRows(
      data(),
      [row({ status: "pending" }), row({ status: "rejected" })],
      allow,
    );
    expect(r.skipped).toBe(2);
    expect(r.applied).toHaveLength(0);
  });

  it("rejects stale oldValue, unknown records, and locked fields", () => {
    const r = applyStagingRows(
      data(),
      [
        row({ fieldPath: "durationYears", oldValue: "9", newValue: "3" }),
        row({ recordId: "nope" }),
        row({ fieldPath: "slug", oldValue: '"humber-practical-nursing"', newValue: '"x"' }),
        row({ fieldPath: "provenance.verifiedBy", oldValue: '"agent"', newValue: '"human"' }),
        row({ fieldPath: "no.such.path" }),
        row({ reviewedBy: "" }),
      ],
      allow,
    );
    expect(r.applied).toHaveLength(0);
    expect(r.rejected).toHaveLength(6);
  });

  it("labels eligibility and prerequisite changes high-risk", () => {
    expect(isHighRisk("eligibility.directEntryFromHighSchool")).toBe(true);
    expect(isHighRisk("academic.prerequisites")).toBe(true);
    expect(isHighRisk("published")).toBe(true);
    expect(isHighRisk("academic.admissionAverage.low")).toBe(false);
    const r = applyStagingRows(
      data(),
      [
        row({
          fieldPath: "academic.prerequisites",
          oldValue: "[]",
          newValue: '[{"kind":"required","courses":["ENG4C"]}]',
        }),
      ],
      allow,
    );
    expect(r.applied[0].highRisk).toBe(true);
    expect(formatPrBody(r)).toMatch(/High-risk changes/);
  });

  it("handles the sample CSV used by `npm run sync:dry-run`", () => {
    const csv = readFileSync(join(__dirname, "../fixtures/staging-sample.csv"), "utf8");
    const r = applyStagingRows(data(), parseStagingValues(parseCsv(csv)), allow);
    expect(r.applied).toHaveLength(2);
    expect(r.applied.filter((a) => a.highRisk)).toHaveLength(1);
    expect(r.rejected).toHaveLength(3);
    expect(r.skipped).toBe(1);
  });
});
