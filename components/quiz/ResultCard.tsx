import { CircleAlert, CircleCheck } from "lucide-react";
import Link from "next/link";
import type { ProfessionResult, ProgramResult } from "@/lib/recommend";
import type { AcademicFit } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const PREREQ_BADGE: Record<ProgramResult["prereqStatus"], string> = {
  met: "Has the prerequisites",
  fixable: "Missing a course (fixable)",
  blocked: "Needs extra courses",
};

export const FIT_BADGE: Record<AcademicFit, string> = {
  likely: "Average at or above recent range",
  possible: "Average within recent range",
  reach: "Reach: average a bit below range",
  unlikely: "Average well below recent range",
  unknown: "Average fit unknown",
};

export function Badge({ tone, children }: { tone: "good" | "warn" | "neutral"; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "good" &&
          "border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
        tone === "warn" &&
          "border-amber-600/40 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
        tone === "neutral" && "bg-muted text-foreground",
      )}
    >
      {children}
    </span>
  );
}

export const prereqTone = (s: ProgramResult["prereqStatus"]) => (s === "met" ? "good" : "warn");
export const fitTone = (f: AcademicFit) =>
  f === "likely" || f === "possible" ? "good" : f === "unknown" ? "neutral" : "warn";

/**
 * One ranked profession with its best programs, reasons, and watch-outs (§8 results).
 * Shows its place in the list but no score, so it reads as an idea to explore, not an instruction.
 */
export function ResultCard({ result, rank }: { result: ProfessionResult; rank: number }) {
  const best = result.programs[0];
  return (
    <article className="bg-card grid break-inside-avoid gap-4 rounded-xl border p-4 sm:p-5">
      <header className="flex flex-wrap items-start gap-3">
        <span
          className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
          aria-label={`Ranked ${rank}`}
        >
          {rank}
        </span>
        <div>
          <h3 className="text-xl font-semibold">
            <Link
              href={`/professions/${result.slug}`}
              className="underline-offset-4 hover:underline"
            >
              {result.title}
            </Link>
          </h3>
        </div>
      </header>
      <div className="flex flex-wrap gap-2">
        <Badge tone={prereqTone(best.prereqStatus)}>{PREREQ_BADGE[best.prereqStatus]}</Badge>
        <Badge tone={fitTone(best.academicFit)}>{FIT_BADGE[best.academicFit]}</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-label="Why it came up" className="bg-muted/50 rounded-lg p-3">
          <h4 className="mb-1 text-sm font-semibold">Why it came up</h4>
          {result.why.length ? (
            <ul className="grid gap-1 text-sm">
              {result.why.map((w) => (
                <li key={w} className="flex gap-2">
                  <CircleCheck
                    className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                    aria-hidden
                  />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Answer more questions for reasons.</p>
          )}
        </section>
        <section aria-label="Watch-outs" className="bg-muted/50 rounded-lg p-3">
          <h4 className="mb-1 text-sm font-semibold">Watch-outs</h4>
          {result.watchOuts.length ? (
            <ul className="grid gap-1 text-sm">
              {result.watchOuts.map((w) => (
                <li key={w} className="flex gap-2">
                  <CircleAlert
                    className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
                    aria-hidden
                  />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing flagged.</p>
          )}
        </section>
      </div>
      <div>
        <h4 className="mb-1 text-sm font-semibold">Program options</h4>
        <ul className="grid gap-2">
          {result.programs.map((r) => (
            <li
              key={r.program.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <Link
                href={`/programs/${r.program.slug}`}
                className="font-medium underline underline-offset-2"
              >
                {r.program.name} — {r.program.institutions.map((i) => i.name).join(" & ")}
              </Link>
              <span className="flex flex-wrap gap-1">
                <Badge tone="neutral">
                  {r.program.programType === "university" ? "University" : "College"}
                </Badge>
                <Badge tone={prereqTone(r.prereqStatus)}>{PREREQ_BADGE[r.prereqStatus]}</Badge>
                <Badge tone={fitTone(r.academicFit)}>{FIT_BADGE[r.academicFit]}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
