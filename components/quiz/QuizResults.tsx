"use client";

import { BookOpenCheck, Check, Link2, Printer, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Disclaimer } from "@/components/common/Disclaimer";
import { buttonVariants } from "@/components/ui/button";
import type { CourseOption } from "@/lib/data";
import { answersFromHash, QUIZ_STORAGE_KEY } from "@/lib/quiz-encoding";
import { recommendCareers, studentRiasec, type QuizCandidate } from "@/lib/recommend";
import type { QuizAnswers, QuizConfig } from "@/lib/schema";
import { ResultCard } from "./ResultCard";

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
  candidates,
  config,
  courses,
}: {
  candidates: QuizCandidate[];
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

  const ranked = recommendCareers(answers, candidates, config);
  const top = ranked.slice(0, config.topProfessions);
  const more = ranked.slice(config.topProfessions);

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

      <CourseReminder answers={answers} />

      <section aria-labelledby="top-h" className="grid gap-4">
        <div className="grid gap-1">
          <h2 id="top-h" className="text-xl font-semibold">
            Careers to explore
          </h2>
          <p className="text-muted-foreground text-sm">
            Listed in order of how closely they line up with your answers. The order is a place to
            start looking, not a score or a recommendation of what to choose.
          </p>
        </div>
        {top.length === 0 ? (
          <p className="text-muted-foreground">
            No careers matched your program type. Try choosing both university and college programs.
          </p>
        ) : (
          <ol className="grid gap-4">
            {top.map((r, i) => (
              <li key={r.candidate.id}>
                <ResultCard result={r} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </section>

      {more.length > 0 && (
        <section aria-labelledby="more-h" className="grid gap-3">
          <h2 id="more-h" className="text-xl font-semibold">
            Also on your list
          </h2>
          <p className="text-muted-foreground text-sm">
            Further down your list, still in order. Each one can be a great fit for someone.
          </p>
          <ol start={top.length + 1} className="grid gap-2 sm:grid-cols-2">
            {more.map((r) => (
              <li key={r.candidate.id} className="grid gap-0.5 rounded-lg border p-3 text-sm">
                {r.candidate.featured ? (
                  <Link href={r.candidate.featured.href} className="font-medium underline">
                    {r.candidate.title}
                  </Link>
                ) : (
                  <span className="font-medium">{r.candidate.title}</span>
                )}
                <span className="text-muted-foreground">
                  {r.candidate.featured ? "Featured" : "Not featured yet"}
                </span>
              </li>
            ))}
          </ol>
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
            ? `${answers.average}%${answers.grade === 11 ? " (expected Grade 12)" : ""}`
            : "Not sure yet"}
        </dd>
        <dt>{answers.grade === 11 ? "Planned Grade 12 courses" : "Grade 12 courses"}</dt>
        <dd>{courseNames.length ? courseNames.join(", ") : "None selected"}</dd>
        <dt>Top interests</dt>
        <dd>{topCodes.length ? topCodes.join(", ") : "Not answered"}</dd>
        <dt>Program type</dt>
        <dd>
          {
            {
              university: "University (incl. joint university–college)",
              college: "College",
              any: "Both",
            }[answers.programType]
          }
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

/** Courses and average don't change the ranking: programs set their own requirements. */
function CourseReminder({ answers }: { answers: QuizAnswers }) {
  const n = answers.courses.length;
  const names = answers.courses.join(", ");
  return (
    <aside className="bg-muted/50 flex gap-3 rounded-xl border p-4 text-sm print:hidden">
      <BookOpenCheck className="text-link mt-0.5 size-5 shrink-0" aria-hidden />
      <p>
        <strong>Check program requirements.</strong>{" "}
        {n > 0
          ? `You listed ${n} Grade 12 course${n === 1 ? "" : "s"} (${names})${
              answers.average !== null ? ` and an average of ${answers.average}%` : ""
            }. `
          : ""}
        These don&apos;t change your list, because every program sets its own required courses and
        admission average. Before you apply, check them on each program&apos;s official page.
      </p>
    </aside>
  );
}
