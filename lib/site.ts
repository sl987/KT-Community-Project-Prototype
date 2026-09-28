/** Site-wide settings from environment variables. */

/**
 * Public base URL, used for sitemap, robots, and OG image URLs. No trailing slash.
 * Falls back to Vercel's production domain, then the deployment URL, then localhost.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000"
).replace(/\/+$/, "");

/** Vercel preview/development deployments should not be indexed. */
export const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

/**
 * Where "Report an error" links go (§11): a mailto: address or a form URL.
 * Unset means the link points to the About page's reporting section.
 */
export const reportErrorTarget = process.env.NEXT_PUBLIC_REPORT_ERROR_URL || null;

export function reportErrorHref(context: string) {
  if (!reportErrorTarget) return "/about#report";
  if (reportErrorTarget.startsWith("mailto:")) {
    const sep = reportErrorTarget.includes("?") ? "&" : "?";
    return `${reportErrorTarget}${sep}subject=${encodeURIComponent(`Data error: ${context}`)}`;
  }
  return reportErrorTarget;
}
