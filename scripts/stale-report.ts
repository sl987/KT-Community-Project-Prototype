/**
 * Stale-data report (Phase 4): Markdown list of unverified fields and records
 * not verified in the last 90 days. Printed to stdout; in GitHub Actions it is
 * also appended to the job summary.
 */
import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { STALE_AFTER_DAYS, validateData } from "../lib/validate";

const dataDir = join(__dirname, "..", "data");
const load = (file: string): unknown => {
  const text = readFileSync(join(dataDir, file), "utf8");
  return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
};

const r = validateData({
  regulators: load("regulators.json"),
  institutions: load("institutions.json"),
  professions: load("professions.json"),
  programs: load("programs.json"),
  courses: load("courses.json"),
  quiz: load("quiz.json"),
  guide: load("guide.json"),
  journeys: load("journeys.json"),
});

const total = r.needsVerification.reduce((n, v) => n + v.paths.length, 0);
const md = [
  "# Data freshness report",
  "",
  `- **${r.stale.length}** record(s) not verified in the last ${STALE_AFTER_DAYS} days`,
  `- **${total}** field(s) still need verification across ${r.needsVerification.length} record(s)`,
  `- **${r.errors.length}** validation error(s)`,
  "",
  "## Stale records",
  "",
  ...(r.stale.length
    ? r.stale.map(
        (s) =>
          `- \`${s.record}\`: ${s.lastVerified ? `last verified ${s.lastVerified} (${s.verifiedBy})` : "never verified"}`,
      )
    : ["None."]),
  "",
  "## Fields needing verification",
  "",
  ...(r.needsVerification.length
    ? r.needsVerification.map(
        (v) => `- \`${v.record}\`: ${v.paths.map((p) => `\`${p}\``).join(", ")}`,
      )
    : ["None."]),
  "",
  ...(r.errors.length ? ["## Validation errors", "", ...r.errors.map((e) => `- ${e}`), ""] : []),
].join("\n");

console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
