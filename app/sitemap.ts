import type { MetadataRoute } from "next";
import { lastDataUpdate, listedProfessions, programs } from "@/lib/data";
import { siteUrl } from "@/lib/site";

/** Static routes only; /quiz/results is personal and excluded. */
export const STATIC_ROUTES = ["/", "/quiz", "/compare", "/guide", "/team", "/about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = lastDataUpdate ? new Date(lastDataUpdate) : undefined;
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${siteUrl}${path}`, lastModified })),
    ...listedProfessions.map((p) => ({ url: `${siteUrl}/professions/${p.slug}`, lastModified })),
    ...programs.map((p) => ({
      url: `${siteUrl}/programs/${p.slug}`,
      lastModified: p.provenance.lastVerified ? new Date(p.provenance.lastVerified) : undefined,
    })),
  ];
}
