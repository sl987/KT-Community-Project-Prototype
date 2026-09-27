"use client";

import { Check, Link2, Printer, RotateCcw, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Disclaimer } from "@/components/common/Disclaimer";
import { buttonVariants } from "@/components/ui/button";
import type { CourseOption, ProgramSummary } from "@/lib/data";
import { REGION_LABELS } from "@/lib/format";
import { describePrereq } from "@/lib/prereqs";
import { answersFromHash, QUIZ_STORAGE_KEY } from "@/lib/quiz-encoding";
import { recommend, studentRiasec } from "@/lib/recommend";
import type { QuizAnswers, QuizConfig } from "@/lib/schema";
import { Badge, FIT_BADGE, PREREQ_BADGE, ResultCard, fitTone } from "./ResultCard";

const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

const RIASEC_NAMES = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
} as const;

export function QuizResults({
  programs,
  config,
  courses,
}: {
  programs: ProgramSummary[];
  config: QuizConfig;
  courses: CourseOption[];
}) {
  const router = useRouter();
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => null,
  );
  const [copied, setCopied] = useState(false);

  if (hash === null) return <p className="text-muted-foreground">Loading your results…</p>;
  const answers = answersFromHash(hash);
  if (!answers) {
    return (
      <div className="grid gap-4">
        <p>We couldn&apos;t find any quiz answers in this link.</p>
        <Link href="/quiz" className={buttonVariants({ size: "lg", className: "h-11 w-fit px-4" })}>
          Take the quiz
        </Link>
      </div>
    );
  }

  const { top, extraCourses } = recommend(answers, programs, config);
  const compareIds = top.slice(0, 3).map((t) => t.programs[0].program.slug);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", window.location.href);
    }
  };

  const retake = () => {
    try {
      window.localStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch {
      // Ignore: storage may be unavailable.
    }
    router.push("/quiz");
  };

  const btn = buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-4" });

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-2 print:hidden">
        {compareIds.length >= 2 && (
          <Link href={`/compare?ids=${compareIds.join(",")}`} className={btn}>
            <Scale aria-hidden />
            Compare top matches
          </Link>
        )}
        <button type="button" onClick={share} className={btn}>
          {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
          {copied ? "Link copied" : "Copy share link"}
        </button>
        <button type="button" onClick={() => window.print()} className={btn}>
          <Printer aria-hidden />
          Print for my counsellor
        </button>
        <button type="button" onClick={retake} className={btn}>
          <RotateCcw aria-hidden />
          Start a new quiz
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Share link copied to clipboard" : ""}
      </p>

      <CounsellorSummary answers={answers} config={config} courses={courses} />

      <section aria-labelledby="top-h" className="grid gap-4">
        <h2 id="top-h" className="text-xl font-semibold">
          Your top matches
        </h2>
        {top.length === 0 ? (
          <p className="text-muted-foreground">
            No programs matched your region and prerequisite answers. Try choosing more regions, or
            look at the programs you could reach with extra courses below.
          </p>
        ) : (
          <ol className="grid gap-4">
            {top.map((r, i) => (
              <li key={r.professionId}>
                <ResultCard result={r} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {extraCourses.length > 0 && (
        <section aria-labelledby="extra-h" className="grid gap-3">
          <h2 id="extra-h" className="text-xl font-semibold">
            Possible with extra courses
          </h2>
          <p className="text-muted-foreground text-sm">
            You&apos;re missing more prerequisites for these than you can usually add in time. They
            could still work with summer school, night school, e-learning, or upgrading.
          </p>
          <ul className="grid gap-2">
            {extraCourses.map((r) => (
              <li key={r.program.id} className="grid gap-1 rounded-lg border p-3 text-sm">
                <Link href={`/programs/${r.program.slug}`} className="font-medium underline">
                  {r.program.profession.title}: {r.program.name} —{" "}
                  {r.program.institutions.map((i) => i.name).join(" & ")}
                </Link>
                <span>Missing: {r.prereq.missing.map(describePrereq).join(", ")}</span>
                <span className="flex gap-1">
                  <Badge tone="warn">{PREREQ_BADGE.blocked}</Badge>
                  <Badge tone={fitTone(r.academicFit)}>{FIT_BADGE[r.academicFit]}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclaimer>
        This is a starting point, not advice. Talk to your guidance counsellor and check official
        program pages. Matches never mean you&apos;re guaranteed admission.
      </Disclaimer>
    </div>
  );
}

/** Shown only when printing: a one-page summary for a guidance counsellor (§8, Phase 3). */
function CounsellorSummary({
  answers,
  config,
  courses,
}: {
  answers: QuizAnswers;
  config: QuizConfig;
  courses: CourseOption[];
}) {
  const riasec = studentRiasec(answers, config);
  const topCodes = riasec
    ? (Object.entries(riasec) as [keyof typeof RIASEC_NAMES, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c]) => RIASEC_NAMES[c])
    : [];
  const courseNames = answers.courses.map((code) => {
    const c = courses.find((x) => x.code === code);
    return c ? `${code} (${c.name})` : code;
  });
  return (
    <section className="hidden gap-2 text-sm print:grid" aria-label="Summary for counsellor">
      <h2 className="text-lg font-semibold">Student summary (for guidance counsellor)</h2>
      <dl className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-1">
        <dt>Grade</dt>
        <dd>{answers.grade ?? "Not given"}</dd>
        <dt>Average</dt>
        <dd>
          {answers.average !== null
            ? `${answers.average}%${answers.averageIsGrade11 ? " (Grade 11 final)" : ""}`
            : "Not sure yet"}
        </dd>
        <dt>Courses</dt>
        <dd>{courseNames.length ? courseNames.join(", ") : "None selected"}</dd>
        <dt>Top interests</dt>
        <dd>{topCodes.length ? topCodes.join(", ") : "Not answered"}</dd>
        <dt>Regions</dt>
        <dd>
          {answers.regions.length
            ? answers.regions.map((r) => REGION_LABELS[r]).join(", ")
            : "Anywhere"}
        </dd>
        <dt>Program length</dt>
        <dd>{{ short: "2–3 years", long: "4 years", any: "No preference" }[answers.length]}</dd>
      </dl>
      <p className="font-medium">Suggested next steps</p>
      <ul className="list-disc pl-5">
        <li>Confirm prerequisites and averages on each official program page.</li>
        <li>Plan Grade 12 courses to cover any missing prerequisites.</li>
        <li>Check application deadlines on OUAC or ontariocolleges.ca.</li>
      </ul>
    </section>
  );
}
