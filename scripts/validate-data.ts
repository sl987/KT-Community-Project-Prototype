/**
 * Validates /data/*.json. Runs as `prebuild` and in CI (`npm run validate`).
 * Exits non-zero on any error; unverified and stale data are reported as warnings.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STALE_AFTER_DAYS, validateData } from "../lib/validate";

const dataDir = join(__dirname, "..", "data");
const load = (file: string): unknown => {
  try {
    // Strip a UTF-8 BOM: some Windows editors add one, and JSON.parse rejects it.
    return JSON.parse(readFileSync(join(dataDir, file), "utf8").replace(/^﻿/, ""));
  } catch (err) {
    console.error(`✖ Could not read data/${file}: ${(err as Error).message}`);
    process.exit(1);
  }
};

const result = validateData({
  regulators: load("regulators.json"),
  institutions: load("institutions.json"),
  professions: load("professions.json"),
  programs: load("programs.json"),
  courses: load("courses.json"),
});

const section = (title: string) =>
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 60 - title.length))}`);

if (result.data) {
  const { programs, professions, institutions, regulators, courses } = result.data;
  section("Data loaded");
  console.log(
    `${programs.length} programs (${programs.filter((p) => p.published).length} published), ` +
      `${professions.length} professions, ${institutions.length} institutions, ` +
      `${regulators.length} regulators, ${courses.courses.length} courses`,
  );
}

if (result.needsVerification.length > 0) {
  const total = result.needsVerification.reduce((n, r) => n + r.paths.length, 0);
  section(`Needs verification (${total} fields in ${result.needsVerification.length} records)`);
  for (const { record, paths } of result.needsVerification) {
    console.log(`  ${record}`);
    for (const p of paths) console.log(`    • ${p}`);
  }
}

if (result.stale.length > 0) {
  section(`Not verified in the last ${STALE_AFTER_DAYS} days (${result.stale.length})`);
  for (const s of result.stale) {
    const when = s.lastVerified
      ? `last verified ${s.lastVerified} by ${s.verifiedBy ?? "unknown"}`
      : "never verified";
    console.log(`  ${s.record} — ${when}`);
  }
}

if (result.warnings.length > 0) {
  section(`Warnings (${result.warnings.length})`);
  for (const w of result.warnings) console.log(`  ⚠ ${w}`);
}

if (result.errors.length > 0) {
  section(`Errors (${result.errors.length})`);
  for (const e of result.errors) console.error(`  ✖ ${e}`);
  console.error("\nData validation FAILED.\n");
  process.exit(1);
}

console.log("\n✔ Data validation passed (warnings above are informational).\n");
