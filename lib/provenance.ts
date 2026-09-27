import type { Provenance } from "./schema";

/** True when `path` (or one of its parents) is listed in needsVerification. */
export const isFlagged = (provenance: Provenance, path: string) =>
  provenance.needsVerification.some((p) => path === p || path.startsWith(`${p}.`));

/** Newest lastVerified date across records, or null when nothing has been verified. */
export const latestVerified = (records: readonly { provenance: Provenance }[]) =>
  records
    .map((r) => r.provenance.lastVerified)
    .filter((d): d is string => d !== null)
    .sort()
    .at(-1) ?? null;
