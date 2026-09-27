/**
 * Live data pipeline (§12): reads APPROVED rows from the Sheet's `staging` tab,
 * merges them into /data/*.json, re-runs validation, and writes a PR body +
 * labels for the GitHub Action to open a pull request. Never merges anything.
 *
 * Usage:
 *   npm run sync                        # read the Sheet, write /data + sync-output/
 *   npm run sync -- --dry-run           # read the Sheet, write only sync-output/
 *   npm run sync -- --csv file.csv --dry-run   # test without a Sheet
 *
 * Env: GOOGLE_SERVICE_ACCOUNT_JSON, SHEET_ID, optional SHEET_RANGE (default "staging!A:L").
 */
import { createSign } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { validateData } from "../lib/validate";
import {
  RECORD_FILES,
  applyStagingRows,
  formatPrBody,
  parseCsv,
  parseStagingValues,
  type DataFiles,
} from "../lib/sync";
import { buildAllowList } from "./allowed-domains";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

const dryRun = flag("--dry-run");
const csvPath = option("--csv");
const outDir = option("--out") ?? "sync-output";
const dataDir = join(__dirname, "..", "data");

const readJson = (file: string): unknown => {
  const text = readFileSync(join(dataDir, file), "utf8");
  return JSON.parse(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
};

// ---------- Input: CSV (tests/dry runs) or Google Sheets ----------

const b64url = (s: string | Buffer) =>
  Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function readSheet(): Promise<string[][]> {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.SHEET_ID;
  if (!saJson || !sheetId) {
    throw new Error("Set GOOGLE_SERVICE_ACCOUNT_JSON and SHEET_ID, or pass --csv <file>.");
  }
  const sa = JSON.parse(saJson) as { client_email: string; private_key: string };
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  )}`;
  const signature = b64url(createSign("RSA-SHA256").update(unsigned).sign(sa.private_key));

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!tokenRes.ok)
    throw new Error(`Google auth failed: ${tokenRes.status} ${await tokenRes.text()}`);
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const range = encodeURIComponent(process.env.SHEET_RANGE ?? "staging!A:L");
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  if (!res.ok) throw new Error(`Sheets read failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { values?: string[][] }).values ?? [];
}

// ---------- Main ----------

async function main() {
  const values = csvPath ? parseCsv(readFileSync(csvPath, "utf8")) : await readSheet();
  const rows = parseStagingValues(values);

  const data = Object.fromEntries(
    Object.entries(RECORD_FILES).map(([type, file]) => [type, readJson(file)]),
  ) as DataFiles;
  const allowList = buildAllowList(
    [...data.regulator, ...data.institution].map((r) => String(r.url ?? "")),
  );

  const result = applyStagingRows(data, rows, allowList);
  const validation = validateData({
    regulators: result.data.regulator,
    institutions: result.data.institution,
    professions: result.data.profession,
    programs: result.data.program,
    courses: readJson("courses.json"),
    quiz: readJson("quiz.json"),
    guide: readJson("guide.json"),
    journeys: readJson("journeys.json"),
  });

  const highRisk = result.applied.some((a) => a.highRisk);
  const labels = ["data-sync", ...(highRisk ? ["high-risk"] : [])];
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "pr-body.md"), formatPrBody(result, validation.errors));
  writeFileSync(join(outDir, "labels.txt"), labels.join("\n") + "\n");
  writeFileSync(
    join(outDir, "summary.json"),
    JSON.stringify(
      {
        applied: result.applied.length,
        rejected: result.rejected.length,
        skipped: result.skipped,
        highRisk,
        validationErrors: validation.errors,
      },
      null,
      2,
    ),
  );

  const changed = result.applied.length > 0 && validation.errors.length === 0;
  if (changed && !dryRun) {
    const touched = new Set(result.applied.map((a) => a.row.recordType as keyof DataFiles));
    for (const type of touched) {
      writeFileSync(
        join(dataDir, RECORD_FILES[type]),
        JSON.stringify(result.data[type], null, 2) + "\n",
      );
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `changed=${changed && !dryRun}\nhigh_risk=${highRisk}\nlabels=${labels.join(",")}\n`,
    );
  }

  console.log(
    `${dryRun ? "[dry run] " : ""}${result.applied.length} applied (${result.applied.filter((a) => a.highRisk).length} high-risk), ` +
      `${result.rejected.length} rejected, ${result.skipped} skipped. PR body: ${join(outDir, "pr-body.md")}`,
  );
  for (const r of result.rejected) console.log(`  ✖ row ${r.row.rowNumber}: ${r.reason}`);
  if (validation.errors.length) {
    console.error("\nMerged data failed validation. Nothing was written to /data.");
    for (const e of validation.errors) console.error(`  ✖ ${e}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
