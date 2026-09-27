import Link from "next/link";
import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { formatCAD } from "@/lib/format";
import type { NonAcademicRequirement } from "@/lib/schema";

const GROUPS = [
  { stage: "before_start", title: "Before you start" },
  { stage: "before_placement", title: "Before placement" },
  { stage: "ongoing", title: "Ongoing" },
] as const;

/** §6.6: grouped checklist of checks, vaccines, certifications, etc. */
export function NonAcademicChecklist({
  items,
  officialUrl,
}: {
  items: NonAcademicRequirement[];
  officialUrl: string | null;
}) {
  if (items.length === 0) {
    return (
      <div className="grid gap-2 text-sm">
        <UnverifiedField officialUrl={officialUrl} />
        <p className="text-muted-foreground">
          Most programs with clinical placements need things like a vulnerable sector check,
          immunizations, and CPR.{" "}
          <Link href="/guide#readiness" className="underline">
            Learn what these are
          </Link>
          .
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {GROUPS.map(({ stage, title }) => {
        const list = items.filter((i) => (i.stage ?? "before_placement") === stage);
        return (
          <div key={stage}>
            <h3 className="mb-2 font-medium">{title}</h3>
            {list.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing listed.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {list.map((i) => (
                  <li key={`${i.type}-${i.label}`} className="rounded-lg border p-3">
                    <p className="font-medium">{i.label}</p>
                    {i.details && <p className="text-muted-foreground">{i.details}</p>}
                    {i.timing && <p>When: {i.timing}</p>}
                    <p>
                      Estimated cost:{" "}
                      {i.estimatedCostCAD != null ? formatCAD(i.estimatedCostCAD) : "not listed"}
                    </p>
                    <SourceLink href={i.sourceUrl} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
