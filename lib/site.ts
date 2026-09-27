/** Site-wide settings from environment variables. */

/** Public base URL, used for sitemap, robots, and OG image URLs. */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Where "Report an error" links go (§11): a mailto: address or a form URL.
 * Unset means the link points to the About page's reporting section.
 */
export const reportErrorTarget = process.env.NEXT_PUBLIC_REPORT_ERROR_URL ?? null;

export function reportErrorHref(context: string) {
  if (!reportErrorTarget) return "/about#report";
  if (reportErrorTarget.startsWith("mailto:")) {
    const sep = reportErrorTarget.includes("?") ? "&" : "?";
    return `${reportErrorTarget}${sep}subject=${encodeURIComponent(`Data error: ${context}`)}`;
  }
  return reportErrorTarget;
}
