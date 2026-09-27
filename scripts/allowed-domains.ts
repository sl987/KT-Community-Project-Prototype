/**
 * Official domains the data pipeline accepts as a `sourceUrl` (§2 Rule 4, §12).
 * A row whose source is not on one of these domains (or a subdomain) is rejected.
 *
 * Regulator and institution domains are added automatically from
 * data/regulators.json and data/institutions.json, so adding a school or
 * regulator to the data also allows its website.
 */

/** Government, portal, and statistics sources named in BUILD_PLAN.md §2. */
export const STATIC_ALLOWED_DOMAINS = [
  "ontario.ca",
  "ouac.on.ca",
  "ontariocolleges.ca",
  "jobbank.gc.ca",
  "canada.ca",
  "cihi.ca",
  "statcan.gc.ca",
] as const;

/**
 * Other official sources, e.g. national exam bodies (CAMRT, CSMLS, PEBC, ...).
 * Add each one only after confirming its real domain on the regulator's website.
 */
export const EXTRA_ALLOWED_DOMAINS: string[] = [];

export const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
};

export function buildAllowList(dataUrls: readonly string[]): string[] {
  const derived = dataUrls.map(hostOf).filter((h): h is string => h !== null);
  return [...new Set([...STATIC_ALLOWED_DOMAINS, ...EXTRA_ALLOWED_DOMAINS, ...derived])];
}

/** True for https URLs on an allowed domain or one of its subdomains. */
export function isAllowedSource(url: string, allowList: readonly string[]): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  return allowList.some((d) => host === d || host.endsWith(`.${d}`));
}
