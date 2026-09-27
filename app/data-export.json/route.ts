/**
 * Static JSON snapshot of the published data, so the verification agent (§12)
 * can read current values when it fills `oldValue` in the Sheet's staging tab.
 * Contains only what the site already shows publicly.
 */
import { institutions, listedProfessions, programs, regulators } from "@/lib/data";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    generatedAt: new Date().toISOString(),
    programs,
    professions: listedProfessions,
    institutions,
    regulators,
  });
}
