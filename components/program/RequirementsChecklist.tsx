"use client";

import { CircleCheck, CircleX } from "lucide-react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useSyncExternalStore } from "react";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { describePrereq, isPrereqMet } from "@/lib/prereqs";
import { QUIZ_STORAGE_KEY } from "@/lib/quiz-encoding";
import type { Prerequisite } from "@/lib/schema";

/** Courses saved by the quiz on this device, if any. Never leaves the browser. */
function readSavedCourses(): string {
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    const courses = raw ? (JSON.parse(raw) as { courses?: unknown }).courses : null;
    return Array.isArray(courses) ? courses.filter((c) => typeof c === "string").join(",") : "";
  } catch {
    return "";
  }
}
const noopSubscribe = () => () => {};

/** High school prerequisites with ✅/❌ when the student's courses are known (§6.5). */
export function RequirementsChecklist({
  prerequisites,
  verified,
  officialUrl,
}: {
  prerequisites: Prerequisite[];
  verified: boolean;
  officialUrl: string | null;
}) {
  const [urlCourses] = useQueryState("courses", parseAsArrayOf(parseAsString));
  const saved = useSyncExternalStore(noopSubscribe, readSavedCourses, () => "");
  const courses = urlCourses?.length ? urlCourses : saved ? saved.split(",") : null;
  const from = urlCourses?.length ? "the courses you selected" : "courses from your quiz (saved on this device)";

  if (prerequisites.length === 0) {
    return (
      <p>
        Prerequisite courses: <UnverifiedField officialUrl={officialUrl} />
      </p>
    );
  }

  const have = new Set(courses ?? []);
  return (
    <div className="grid gap-2">
      {courses && <p className="text-sm text-muted-foreground">Checked against {from}.</p>}
      {!verified && <UnverifiedField officialUrl={officialUrl} />}
      <ul className="grid gap-1">
        {prerequisites.map((p) => {
          const met = isPrereqMet(p, have);
          return (
            <li key={describePrereq(p)} className="flex items-start gap-2 text-sm">
              {courses ? (
                met ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-400" aria-label="You have this" />
                ) : (
                  <CircleX className="mt-0.5 size-4 shrink-0 text-rose-700 dark:text-rose-400" aria-label="Missing" />
                )
              ) : (
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
              )}
              <span>
                <span className="font-mono">{describePrereq(p)}</span>
                {p.kind === "anyOf" && " (any one)"}
                {p.minMark != null && ` — minimum ${p.minMark}%`}
                {p.note && <span className="text-muted-foreground"> — {p.note}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
