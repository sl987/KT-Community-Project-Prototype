"use client";

import { CourseMatcher } from "@/components/filters/CourseMatcher";
import { FilterBar } from "@/components/filters/FilterBar";
import { toggle, useFilters } from "@/components/filters/useFilters";
import { ProgramCard } from "@/components/program/ProgramCard";
import type { CourseOption, ProgramSummary } from "@/lib/data";
import { applyFilters } from "@/lib/filters";
import { matchPrereqs } from "@/lib/prereqs";
import { CompareDrawer, MAX_COMPARE } from "./CompareDrawer";
import { MissingCourseHelper } from "./MissingCourseHelper";

export function DiscoveryHub({
  programs,
  courses,
}: {
  programs: ProgramSummary[];
  courses: CourseOption[];
}) {
  const { filters, compare, setFilters } = useFilters();
  const knownCodes = new Set(courses.map((c) => c.code));
  const selectedCourses = filters.courses.filter((c) => knownCodes.has(c));
  const visible = applyFilters(programs, { ...filters, courses: selectedCourses });

  const verified = programs.filter((p) => p.prerequisites.length > 0 && p.prereqsVerified);
  const qualifyCount = verified.filter(
    (p) => matchPrereqs(p.prerequisites, selectedCourses).missing.length === 0,
  ).length;

  const compareSet = compare
    .filter((s) => programs.some((p) => p.slug === s))
    .slice(0, MAX_COMPARE);
  const compared = compareSet.map((s) => programs.find((p) => p.slug === s)!);
  const setCompare = (next: string[]) => setFilters({ compare: next.length ? next : null });
  const courseQuery = selectedCourses.length ? `?courses=${selectedCourses.join(",")}` : "";

  return (
    <div className="grid gap-8">
      <section aria-labelledby="matcher-heading" className="grid gap-3">
        <div>
          <h2 id="matcher-heading" className="text-xl font-semibold">
            Quick matcher
          </h2>
          <p className="text-muted-foreground text-sm">
            Pick the Grade 12 courses you&apos;re taking or plan to take. In Grade 11? Choose the
            Grade 12 courses you expect to take next year.
          </p>
        </div>
        <p className="bg-muted rounded-lg px-3 py-2 text-sm" aria-live="polite">
          {selectedCourses.length === 0 ? (
            "No courses selected yet."
          ) : (
            <>
              You have every prerequisite for <strong>{qualifyCount}</strong> of {verified.length}{" "}
              programs with verified prerequisites.
              {programs.length > verified.length &&
                ` ${programs.length - verified.length} program(s) still need their prerequisites verified.`}
            </>
          )}
        </p>
        <details
          className="rounded-xl border"
          open={selectedCourses.length === 0 ? undefined : true}
        >
          <summary className="cursor-pointer rounded-xl px-4 py-3 font-medium">
            Choose courses ({selectedCourses.length} selected)
          </summary>
          <div className="border-t p-4">
            <CourseMatcher
              courses={courses}
              selected={selectedCourses}
              onChange={(next) => setFilters({ courses: next.length ? next : null })}
            />
          </div>
        </details>
        <MissingCourseHelper programs={programs} courses={selectedCourses} />
      </section>

      <section aria-labelledby="programs-heading" id="programs" className="grid scroll-mt-4 gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="programs-heading" className="text-xl font-semibold">
            Programs
          </h2>
          <p className="text-muted-foreground text-sm" aria-live="polite">
            Showing {visible.length} of {programs.length}
          </p>
        </div>
        <FilterBar />
        {visible.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border p-6 text-center">
            No programs match these filters. Try removing one.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <li key={p.id} className="grid">
                <ProgramCard
                  program={p}
                  courses={selectedCourses}
                  href={`/programs/${p.slug}${courseQuery}`}
                  compare={{
                    checked: compareSet.includes(p.slug),
                    disabled: !compareSet.includes(p.slug) && compareSet.length >= MAX_COMPARE,
                    onChange: () => setCompare(toggle(compareSet, p.slug)),
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Leaves room so the sticky compare bar never covers the last cards. */}
      {compared.length > 0 && <div className="h-28" aria-hidden />}
      <CompareDrawer
        selected={compared}
        onRemove={(slug) => setCompare(compareSet.filter((s) => s !== slug))}
        onClear={() => setCompare([])}
      />
    </div>
  );
}
