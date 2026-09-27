import type { ProgramSummary } from "@/lib/data";
import { describePrereq, matchPrereqs } from "@/lib/prereqs";

/** Generic ways to pick up a missing course (§7.6). No specific providers. */
export const WAYS_TO_GET_A_COURSE = [
  { title: "Summer school", text: "Many school boards offer credit courses in July." },
  { title: "Night school or con-ed", text: "Evening or weekend courses through your school board." },
  {
    title: "E-learning",
    text: "Online courses through your board or a provincially inspected school.",
  },
  {
    title: "Upgrading after graduation",
    text: "Adult learning centres and some colleges offer upgrading courses.",
  },
];

/**
 * "I'm missing a course" helper (§7.6). Shows which programs remain open and
 * which courses unlock the rest. Only meaningful once courses are selected.
 */
export function MissingCourseHelper({
  programs,
  courses,
}: {
  programs: ProgramSummary[];
  courses: string[];
}) {
  const known = programs.filter((p) => p.prerequisites.length > 0 && p.prereqsVerified);
  const unknownCount = programs.length - known.length;
  const matches = known.map((p) => ({ p, m: matchPrereqs(p.prerequisites, courses) }));
  const open = matches.filter(({ m }) => m.missing.length === 0);

  const missingCounts = new Map<string, string[]>();
  for (const { p, m } of matches) {
    for (const miss of m.missing) {
      const key = describePrereq(miss);
      missingCounts.set(key, [...(missingCounts.get(key) ?? []), `${p.profession.title} (${p.institutions[0]?.name})`]);
    }
  }
  const gaps = [...missingCounts.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <details className="rounded-xl border">
      <summary className="cursor-pointer rounded-xl px-4 py-3 font-medium">
        I&apos;m missing a course
      </summary>
      <div className="grid gap-4 border-t p-4 text-sm">
        {courses.length === 0 ? (
          <p>Select the courses you have or plan to take above, and we&apos;ll show what&apos;s still open to you.</p>
        ) : (
          <>
            <p>
              With your courses, you have every prerequisite for{" "}
              <strong>
                {open.length} of {known.length}
              </strong>{" "}
              programs with verified prerequisites.
              {unknownCount > 0 &&
                ` ${unknownCount} more program${unknownCount === 1 ? " has" : "s have"} prerequisites that are not yet verified.`}
            </p>
            {gaps.length > 0 && (
              <div>
                <h3 className="mb-1 font-medium">Courses that would open more programs</h3>
                <ul className="grid gap-1">
                  {gaps.map(([course, progs]) => (
                    <li key={course}>
                      <span className="font-mono">{course}</span> — needed for {progs.length}{" "}
                      program{progs.length === 1 ? "" : "s"}: {progs.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <div>
          <h3 className="mb-1 font-medium">Ways to get a missing course</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {WAYS_TO_GET_A_COURSE.map((w) => (
              <li key={w.title} className="rounded-lg bg-muted/60 p-3">
                <p className="font-medium">{w.title}</p>
                <p className="text-muted-foreground">{w.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-muted-foreground">
            Talk to your guidance counsellor about which option fits your timeline.
          </p>
        </div>
      </div>
    </details>
  );
}
