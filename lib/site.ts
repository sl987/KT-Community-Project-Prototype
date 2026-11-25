/** Site-wide settings from environment variables. */

/** Brand. */
export const siteName = "PAHSSION";
export const siteLongName = "Professional Allied Health and Secondary Students in Ontario Network";
export const siteSlogan = "Every career has a story. Ask the people living it.";

/** LinkedIn's own terms, which everyone using the Connect features must follow. */
export const linkedinUserAgreementUrl = "https://www.linkedin.com/legal/user-agreement";
export const linkedinCommunityPoliciesUrl =
  "https://www.linkedin.com/legal/professional-community-policies";

/** How partners are checked before being listed (Connect, directory, About). */
export const partnerVerificationText =
  "Every partner is verified before being listed: working professionals are registered members of their Ontario regulatory college, and student partners are confirmed as current students of their program.";

/** The PAHSSION LinkedIn community page. Unset shows a "coming soon" state. */
export const communityUrl = process.env.NEXT_PUBLIC_LINKEDIN_COMMUNITY_URL || null;

/**
 * Public base URL, used for sitemap, robots, and OG image URLs. No trailing slash.
 * Falls back to Vercel's production domain, then the deployment URL, then localhost.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000"
).replace(/\/+$/, "");

/** Vercel preview/development deployments should not be indexed. */
export const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

/**
 * Where "Report an error" links go (§11): a mailto: address or a form URL.
 * Unset means the link points to the About page's reporting section.
 */
/** Where reports go when NEXT_PUBLIC_REPORT_ERROR_URL isn't set. */
export const reportEmail = "ildem.gur@mail.utoronto.ca";
export const reportErrorTarget: string | null =
  process.env.NEXT_PUBLIC_REPORT_ERROR_URL || `mailto:${reportEmail}`;

/** Anonymous Google Form for first-time and early users. */
export const feedbackFormUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSc5fyzRgjZ4T-MK8mAzlex64ANmdYiAed84hC0tDhSUvu0mrg/viewform?usp=dialog";

export function reportErrorHref(context: string, subject = `Data error: ${context}`) {
  if (!reportErrorTarget) return "/about#report";
  if (reportErrorTarget.startsWith("mailto:")) {
    const sep = reportErrorTarget.includes("?") ? "&" : "?";
    return `${reportErrorTarget}${sep}subject=${encodeURIComponent(subject)}`;
  }
  return reportErrorTarget;
}
