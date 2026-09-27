"use client";

import { Analytics } from "@vercel/analytics/next";
import { stripPrivateUrl } from "@/lib/privacy";

/** Cookieless page-view analytics (§4) that never sees quiz answers. */
export function PrivacyAnalytics() {
  return <Analytics beforeSend={(event) => ({ ...event, url: stripPrivateUrl(event.url) })} />;
}
