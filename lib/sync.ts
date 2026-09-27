/**
 * Merge logic for the live data pipeline (§12): approved `staging` rows from the
 * Google Sheet -> /data JSON. Pure (no I/O) so it can be unit tested; the CLI is
 * scripts/sync-from-sheet.ts.
 */
import { isAllowedSource } from "../scripts/allowed-domains";

/** The Sheet contract: `staging` tab columns, in order. */
export const STAGING_COLUMNS = [
  "recordType",
  "recordId",
  "fieldPath",
  "oldValue",
  "newValue",
  "sourceUrl",
  "evidenceNote",
  "detectedAt",
  "agentConfidence",
  "status",
  "reviewedBy",
  "reviewedAt",
] as const;

export type StagingRow = Record<(typeof STAGING_COLUMNS)[number], string> & { rowNumber: number };

export const RECORD_FILES = {
  program: "programs.json",
  profession: "professions.json",
  institution: "institutions.json",
  regulator: "regulators.json",
} as const;
export type RecordType = keyof typeof RECORD_FILES;

export type DataFiles = Record<RecordType, Record<string, unknown>[]>;

/** Changes to these paths are labelled `high-risk` on the PR (§12 Guardrails). */
const HIGH_RISK_PREFIXES = ["eligibility", "academic.prerequisites", "published"];
/** Never editable through the pipeline. */
const LOCKED_PREFIXES = ["id", "slug", "provenance"];

const startsWithPath = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}.`);

export const isHighRisk = (fieldPath: string) =>
  HIGH_RISK_PREFIXES.some((p) => startsWithPath(fieldPath, p));

export interface AppliedChange {
  row: StagingRow;
  file: string;
  oldValue: unknown;
  newValue: unknown;
  highRisk: boolean;
}

export interface RejectedRow {
  row: StagingRow;
  reason: string;
}

export interface SyncResult {
  data: DataFiles;
  applied: AppliedChange[];
  rejected: RejectedRow[];
  /** Rows not approved (pending/rejected in the Sheet): left alone. */
  skipped: number;
}

/** Turns a Sheet/CSV value grid (header row first) into rows keyed by column name. */
export function parseStagingValues(values: string[][]): StagingRow[] {
  if (values.length === 0) return [];
  const header = values[0].map((h) => h.trim());
  const missing = STAGING_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`staging tab is missing columns: ${missing.join(", ")}`);
  return values.slice(1).map((cells, i) => {
    const row = { rowNumber: i + 2 } as StagingRow;
    for (const col of STAGING_COLUMNS) row[col] = (cells[header.indexOf(col)] ?? "").trim();
    return row;
  });
}

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, newlines in quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Cells hold JSON when they can (numbers, arrays, null); otherwise they're plain strings. */
export function parseCell(cell: string): unknown {
  if (cell === "") return null;
  try {
    return JSON.parse(cell);
  } catch {
    return cell;
  }
}

const get = (obj: unknown, segs: string[]) =>
  segs.reduce<unknown>(
    (cur, s) =>
      cur !== null && typeof cur === "object" ? (cur as Record<string, unknown>)[s] : undefined,
    obj,
  );

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function applyStagingRows(
  input: DataFiles,
  rows: readonly StagingRow[],
  allowList: readonly string[],
): SyncResult {
  const data = structuredClone(input);
  const applied: AppliedChange[] = [];
  const rejected: RejectedRow[] = [];
  let skipped = 0;

  for (const row of rows) {
    if (row.status.toLowerCase() !== "approved") {
      skipped++;
      continue;
    }
    const reject = (reason: string) => rejected.push({ row, reason });

    if (!(row.recordType in RECORD_FILES)) {
      reject(`unknown recordType "${row.recordType}"`);
      continue;
    }
    const type = row.recordType as RecordType;
    if (!row.sourceUrl) {
      reject("missing sourceUrl");
      continue;
    }
    if (!isAllowedSource(row.sourceUrl, allowList)) {
      reject(`sourceUrl is not on an allowed official domain: ${row.sourceUrl}`);
      continue;
    }
    if (!row.reviewedBy) {
      reject("approved row has no reviewedBy");
      continue;
    }
    const record = data[type].find((r) => r.id === row.recordId);
    if (!record) {
      reject(`no ${type} with id "${row.recordId}" (new records are added by hand, not by sync)`);
      continue;
    }
    const segs = row.fieldPath.split(".").filter(Boolean);
    if (segs.length === 0 || LOCKED_PREFIXES.some((p) => startsWithPath(row.fieldPath, p))) {
      reject(`fieldPath "${row.fieldPath}" cannot be changed by the pipeline`);
      continue;
    }
    const parent = get(record, segs.slice(0, -1));
    const key = segs.at(-1)!;
    if (parent === null || typeof parent !== "object") {
      reject(`fieldPath "${row.fieldPath}" does not exist on ${type} "${row.recordId}"`);
      continue;
    }

    const current = (parent as Record<string, unknown>)[key];
    const expectedOld = parseCell(row.oldValue);
    if (!same(current ?? null, expectedOld)) {
      reject(
        `oldValue does not match the current value (${JSON.stringify(current ?? null)}); the data changed since this row was written`,
      );
      continue;
    }
    const newValue = parseCell(row.newValue);
    const p = parent as Record<string, unknown>;
    p[key] = newValue;
    // Keep the fact and its provenance together (§2 Rule 2).
    if ("sourceUrl" in p && key !== "sourceUrl" && newValue !== null) p.sourceUrl = row.sourceUrl;

    // The field is now sourced: drop it (and its Sourced parent) from needsVerification.
    const provenance = record.provenance as { needsVerification: string[] } | undefined;
    if (provenance && newValue !== null) {
      const parentPath = segs.slice(0, -1).join(".");
      provenance.needsVerification = provenance.needsVerification.filter(
        (nv) => nv !== row.fieldPath && !(key === "value" && nv === parentPath),
      );
    }

    applied.push({
      row,
      file: RECORD_FILES[type],
      oldValue: current ?? null,
      newValue,
      highRisk: isHighRisk(row.fieldPath),
    });
  }

  return { data, applied, rejected, skipped };
}

const cell = (v: unknown) =>
  `\`${(typeof v === "string" ? v : JSON.stringify(v)).replace(/`/g, "'").replace(/\|/g, "\\|").slice(0, 120)}\``;

/** Human-readable PR description. */
export function formatPrBody(result: SyncResult, validationErrors: string[] = []): string {
  const { applied, rejected, skipped } = result;
  const risky = applied.filter((a) => a.highRisk);
  const lines: string[] = [
    "## Data sync from the verification Sheet",
    "",
    `**${applied.length}** change(s) applied · **${rejected.length}** row(s) rejected · ${skipped} row(s) not approved (skipped).`,
    "",
    "> This PR was opened by the sync workflow. It is never auto-merged. Check each change against its source before merging.",
    "",
  ];
  if (risky.length) {
    lines.push(
      "### ⚠️ High-risk changes (eligibility or prerequisites)",
      "",
      "These can change which programs are shown or who qualifies. Verify them on the official page.",
      "",
      ...risky.map((a) => `- \`${a.row.recordType}:${a.row.recordId}\` → \`${a.row.fieldPath}\``),
      "",
    );
  }
  if (applied.length) {
    lines.push(
      "### Changes",
      "",
      "| Record | Field | Old | New | Source | Evidence | Confidence | Reviewed by |",
      "|---|---|---|---|---|---|---|---|",
      ...applied.map(
        (a) =>
          `| \`${a.row.recordType}:${a.row.recordId}\`${a.highRisk ? " ⚠️" : ""} | \`${a.row.fieldPath}\` | ${cell(a.oldValue)} | ${cell(a.newValue)} | [link](${a.row.sourceUrl}) | ${a.row.evidenceNote.replace(/\|/g, "\\|") || "—"} | ${a.row.agentConfidence || "—"} | ${a.row.reviewedBy} |`,
      ),
      "",
    );
  }
  if (rejected.length) {
    lines.push(
      "### Rejected rows",
      "",
      ...rejected.map(
        (r) =>
          `- Sheet row ${r.row.rowNumber} (\`${r.row.recordType}:${r.row.recordId}\` \`${r.row.fieldPath}\`): ${r.reason}`,
      ),
      "",
    );
  }
  if (validationErrors.length) {
    lines.push("### ❌ Validation errors", "", ...validationErrors.map((e) => `- ${e}`), "");
  }
  return lines.join("\n");
}
