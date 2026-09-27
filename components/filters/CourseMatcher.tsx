"use client";

import type { CourseOption } from "@/lib/data";

/**
 * Multi-select of Ontario course codes, grouped by subject (§7.2, §8A).
 * Controlled: the parent owns the selected list (URL state or quiz state).
 */
export function CourseMatcher({
  courses,
  selected,
  onChange,
  idPrefix = "course",
  grades = [11, 12],
}: {
  courses: CourseOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  idPrefix?: string;
  grades?: (11 | 12)[];
}) {
  const subjects = [...new Set(courses.map((c) => c.subject))];
  const set = new Set(selected);
  const toggle = (code: string) =>
    onChange(set.has(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {subjects.map((subject) => {
        const list = courses.filter((c) => c.subject === subject && grades.includes(c.grade));
        if (list.length === 0) return null;
        const count = list.filter((c) => set.has(c.code)).length;
        return (
          <fieldset key={subject} className="rounded-lg border p-3">
            <legend className="px-1 text-sm font-medium">
              {subject}
              {count > 0 && <span className="text-muted-foreground"> · {count} selected</span>}
            </legend>
            <ul className="grid gap-1">
              {list.map((c) => {
                const id = `${idPrefix}-${c.code}`;
                return (
                  <li key={c.code}>
                    <label
                      htmlFor={id}
                      className="hover:bg-muted flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-1 text-sm"
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={set.has(c.code)}
                        onChange={() => toggle(c.code)}
                        className="accent-primary size-4"
                      />
                      <span className="font-mono text-xs">{c.code}</span>
                      <span>
                        {c.name} <span className="text-muted-foreground">(Gr {c.grade})</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );
}
