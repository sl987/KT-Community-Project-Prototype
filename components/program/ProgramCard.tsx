import { CircleCheck, CircleHelp, CircleX, Clock, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";
import type { ProgramSummary } from "@/lib/data";
import { CREDENTIAL_LABELS, OUTLOOK_LABELS, formatHourly, formatYears } from "@/lib/format";
import { matchPrereqs } from "@/lib/prereqs";

export function PrereqIndicator({
  program,
  courses,
}: {
  program: Pick<ProgramSummary, "prerequisites" | "prereqsVerified">;
  courses: string[] | null;
}) {
  const m = matchPrereqs(program.prerequisites, courses ?? []);
  if (m.unknown || !program.prereqsVerified) {
    return (
      <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
        <CircleHelp className="size-4" aria-hidden />
        Prerequisites not yet verified
      </span>
    );
  }
  if (!courses || courses.length === 0) {
    return (
      <span>
        {m.total} prerequisite{m.total === 1 ? "" : "s"}
      </span>
    );
  }
  const all = m.metCount === m.total;
  return (
    <span
      className={
        all
          ? "inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300"
          : "inline-flex items-center gap-1"
      }
    >
      {all ? (
        <CircleCheck className="size-4" aria-hidden />
      ) : (
        <CircleX className="size-4" aria-hidden />
      )}
      You have {m.metCount}/{m.total} prereqs
    </span>
  );
}

export function ProgramCard({
  program: p,
  courses,
  href,
  compare,
}: {
  program: ProgramSummary;
  courses?: string[] | null;
  href?: string;
  compare?: { checked: boolean; disabled: boolean; onChange: () => void };
}) {
  const inst = p.institutions.map((i) => i.name).join(" & ");
  const where = [...new Set(p.institutions.map((i) => i.city))].join(", ");
  return (
    <article className="bg-card text-card-foreground focus-within:ring-ring relative flex flex-col gap-3 rounded-xl border p-4 shadow-xs transition-shadow focus-within:ring-2 hover:shadow-md">
      <div>
        <p className="text-muted-foreground text-sm">{p.profession.title}</p>
        <h3 className="text-lg leading-snug font-semibold">
          <Link
            href={href ?? `/programs/${p.slug}`}
            className="outline-none after:absolute after:inset-0 after:rounded-xl"
          >
            {p.name}
          </Link>
        </h3>
        <p className="text-sm">{inst}</p>
      </div>
      <ul className="text-muted-foreground grid gap-1 text-sm">
        <li className="flex items-center gap-1.5">
          <GraduationCap className="size-4" aria-hidden />
          {CREDENTIAL_LABELS[p.credential]} · <Clock className="size-4" aria-hidden />
          {formatYears(p.durationYears)}
        </li>
        <li className="flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {where}
        </li>
      </ul>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs">Median wage</dt>
          <dd className="font-medium">
            {p.medianWage !== null ? formatHourly(p.medianWage) : "Not yet verified"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs">Job outlook</dt>
          <dd className="font-medium">
            {p.outlook ? OUTLOOK_LABELS[p.outlook] : "Not yet verified"}
          </dd>
        </div>
      </dl>
      <p className="text-sm">
        <PrereqIndicator program={p} courses={courses ?? null} />
      </p>
      {compare && (
        // Sits above the card's full-size link overlay.
        <label className="relative z-10 flex min-h-8 cursor-pointer items-center gap-2 self-start rounded-md text-sm">
          <input
            type="checkbox"
            checked={compare.checked}
            disabled={compare.disabled}
            onChange={compare.onChange}
            className="accent-primary size-4"
          />
          Compare
          {compare.disabled && <span className="sr-only">(maximum of 3 selected)</span>}
        </label>
      )}
    </article>
  );
}
