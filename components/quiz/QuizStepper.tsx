"use client";

import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CourseMatcher } from "@/components/filters/CourseMatcher";
import { toggle } from "@/components/filters/useFilters";
import { buttonVariants } from "@/components/ui/button";
import type { CourseOption } from "@/lib/data";
import { REGION_LABELS } from "@/lib/format";
import { DEFAULT_ANSWERS, QUIZ_STORAGE_KEY, resultsPath } from "@/lib/quiz-encoding";
import {
  MarkSubjectSchema,
  QuizAnswersSchema,
  RegionSchema,
  type MarkSubject,
  type QuizAnswers,
  type QuizConfig,
} from "@/lib/schema";
import { cn } from "@/lib/utils";

type Section = "Academics" | "Interests" | "Work style" | "Preferences";
interface Screen {
  id: string;
  section: Section;
  title: string;
  hint?: string;
  render: () => ReactNode;
}

const MARK_LABELS: Record<MarkSubject, string> = {
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  math: "Math",
  english: "English",
};

const LIKERT = ["Not at all", "Not really", "Maybe", "Probably", "Definitely"];
const IMPORTANCE = ["Not important", "A little", "Somewhat", "Important", "Very important"];

function Radios<T extends string | number>({
  name,
  options,
  value,
  onChange,
  columns,
}: {
  name: string;
  options: { value: T; label: string }[];
  value: T | null | undefined;
  onChange: (v: T) => void;
  columns?: boolean;
}) {
  return (
    <div className={cn("grid gap-2", columns && "sm:grid-cols-5")}>
      {options.map((o) => (
        <label
          key={String(o.value)}
          className="has-checked:border-primary has-checked:bg-primary/10 hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm"
        >
          <input
            type="radio"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="accent-primary size-4"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

interface Saved {
  answers: QuizAnswers;
  index: number;
  /** True once "See my results" was pressed. */
  completed: boolean;
}

function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { index?: unknown; completed?: unknown };
    const answers = QuizAnswersSchema.safeParse(parsed);
    if (!answers.success) return null;
    return {
      answers: answers.data,
      index: typeof parsed.index === "number" ? parsed.index : 0,
      completed: parsed.completed === true,
    };
  } catch {
    return null;
  }
}

function save(answers: QuizAnswers, index: number, completed = false) {
  try {
    window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ ...answers, index, completed }));
  } catch {
    // Storage unavailable (private mode etc.): the quiz still works, just can't resume.
  }
}

function clearSaved() {
  try {
    window.localStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    // Ignore: storage may be unavailable.
  }
}

export function QuizStepper({ config, courses }: { config: QuizConfig; courses: CourseOption[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [index, setIndex] = useState(-1); // -1 = intro
  const [saved, setSaved] = useState<Saved | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Reading localStorage must wait until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaved(loadSaved());
  }, []);

  useEffect(() => {
    if (index >= 0) save(answers, index);
  }, [answers, index]);

  // Move focus to the new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (index >= 0) headingRef.current?.focus();
  }, [index]);

  const set = (patch: Partial<QuizAnswers>) => setAnswers((a) => ({ ...a, ...patch }));

  const screens: Screen[] = [
    {
      id: "grade",
      section: "Academics",
      title: "What grade are you in?",
      render: () => (
        <Radios
          name="grade"
          value={answers.grade}
          onChange={(grade) => set({ grade })}
          options={[
            { value: 11, label: "Grade 11" },
            { value: 12, label: "Grade 12" },
          ]}
        />
      ),
    },
    {
      id: "average",
      section: "Academics",
      title:
        answers.grade === 11
          ? "What Grade 12 average do you expect?"
          : "What's your current or expected average?",
      hint:
        answers.grade === 11
          ? "Estimate your average across your top 6 Grade 12 U/M courses next year. A rough guess is fine."
          : "Your top 6 Grade 12 U/M courses.",
      render: () => (
        <div className="grid gap-3">
          <label className="grid max-w-40 gap-1 text-sm">
            Average (%)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              value={answers.average ?? ""}
              onChange={(e) => {
                const n =
                  e.target.value === "" ? null : Math.min(100, Math.max(0, Number(e.target.value)));
                set({ average: n });
              }}
              className="bg-background h-11 rounded-md border px-3 text-base"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={answers.average === null}
              onChange={(e) => e.target.checked && set({ average: null })}
              className="accent-primary size-4"
            />
            Not sure yet
          </label>
        </div>
      ),
    },
    {
      id: "courses",
      section: "Academics",
      title:
        answers.grade === 11
          ? "Which Grade 12 courses do you plan to take?"
          : "Which Grade 12 courses are you taking or planning to take?",
      hint:
        answers.grade === 11
          ? "Predict your Grade 12 timetable. Programs check Grade 12 courses, so this is how we check prerequisites."
          : "Programs check Grade 12 courses, so this is how we check prerequisites.",
      render: () => (
        <CourseMatcher
          courses={courses}
          selected={answers.courses}
          onChange={(c) => set({ courses: c })}
          idPrefix="quiz-course"
        />
      ),
    },
    {
      id: "marks",
      section: "Academics",
      title: "Marks in key subjects (optional)",
      hint:
        answers.grade === 11
          ? "Some programs need a minimum mark in a Grade 12 course. Enter the marks you expect, or leave blank."
          : "Some programs need a minimum mark in a Grade 12 course. Leave blank if you're not sure.",
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {MarkSubjectSchema.options.map((s) => (
            <label key={s} className="grid gap-1 text-sm">
              {MARK_LABELS[s]} (%)
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                value={answers.marks[s] ?? ""}
                onChange={(e) => {
                  const marks = { ...answers.marks };
                  if (e.target.value === "") delete marks[s];
                  else marks[s] = Math.min(100, Math.max(0, Number(e.target.value)));
                  set({ marks });
                }}
                className="bg-background h-11 rounded-md border px-3 text-base"
              />
            </label>
          ))}
        </div>
      ),
    },
    ...config.interestItems.map((item, i): Screen => ({
      id: `interest-${item.id}`,
      section: "Interests",
      title: `Would you enjoy this? (${i + 1} of ${config.interestItems.length})`,
      hint: item.text,
      render: () => (
        <Radios
          name={`interest-${item.id}`}
          value={answers.interests[item.id]}
          onChange={(v) => set({ interests: { ...answers.interests, [item.id]: v } })}
          options={LIKERT.map((label, j) => ({ value: j + 1, label }))}
          columns
        />
      ),
    })),
    ...config.workStyleQuestions.map((q): Screen => ({
      id: `ws-${q.key}`,
      section: "Work style",
      title: q.text,
      render: () => (
        <Radios
          name={`ws-${q.key}`}
          value={answers.workStyle[q.key]}
          onChange={(v) => set({ workStyle: { ...answers.workStyle, [q.key]: v } })}
          options={[1, 2, 3, 4, 5].map((v) => ({
            value: v,
            label: v === 1 ? `1 — ${q.lowLabel}` : v === 5 ? `5 — ${q.highLabel}` : String(v),
          }))}
          columns
        />
      ),
    })),
    {
      id: "length",
      section: "Preferences",
      title: "How long do you want to be in school?",
      render: () => (
        <Radios
          name="length"
          value={answers.length}
          onChange={(length) => set({ length })}
          options={[
            { value: "short", label: "2–3 years" },
            { value: "long", label: "4 years" },
            { value: "any", label: "No preference" },
          ]}
        />
      ),
    },
    {
      id: "type",
      section: "Preferences",
      title: "Which programs do you want to see?",
      hint: "Joint university–college programs count as university programs.",
      render: () => (
        <Radios
          name="programType"
          value={answers.programType}
          onChange={(programType) => set({ programType })}
          options={[
            { value: "university", label: "University programs" },
            { value: "college", label: "College programs" },
            { value: "any", label: "Both" },
          ]}
        />
      ),
    },
    {
      id: "regions",
      section: "Preferences",
      title: "Where would you be willing to study?",
      hint: "Pick all that apply. Leave blank if anywhere in Ontario works.",
      render: () => (
        <div className="grid gap-2">
          {RegionSchema.options.map((r) => (
            <label
              key={r}
              className="has-checked:border-primary has-checked:bg-primary/10 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm"
            >
              <input
                type="checkbox"
                checked={answers.regions.includes(r)}
                onChange={() => set({ regions: toggle(answers.regions, r) })}
                className="accent-primary size-4"
              />
              {REGION_LABELS[r]}
            </label>
          ))}
        </div>
      ),
    },
    {
      id: "salary",
      section: "Preferences",
      title: "How important is a high salary to you?",
      render: () => (
        <Radios
          name="salary"
          value={answers.salaryImportance}
          onChange={(salaryImportance) => set({ salaryImportance })}
          options={IMPORTANCE.map((label, j) => ({ value: j + 1, label }))}
          columns
        />
      ),
    },
    {
      id: "demand",
      section: "Preferences",
      title: "How important is it that lots of jobs are available?",
      render: () => (
        <Radios
          name="demand"
          value={answers.demandImportance}
          onChange={(demandImportance) => set({ demandImportance })}
          options={IMPORTANCE.map((label, j) => ({ value: j + 1, label }))}
          columns
        />
      ),
    },
  ];

  const finish = () => {
    save(answers, screens.length - 1, true);
    router.push(resultsPath(answers));
  };

  if (index < 0) {
    return (
      <div className="grid gap-5">
        <p className="border-primary/40 bg-primary/5 flex items-center gap-2 rounded-lg border p-3 text-sm">
          <Lock className="size-4 shrink-0" aria-hidden />
          Your answers stay on your device. We don&apos;t ask for your name, email, or school.
        </p>
        <p>
          About 5 minutes. {screens.length} short questions in four parts: academics, interests,
          work style, and preferences. You can skip any question.
        </p>
        {saved && (
          <p className="text-muted-foreground text-sm" role="status">
            {saved.completed
              ? "You finished this quiz before on this device. Start a new quiz to clear those answers, or go back and change them."
              : "You have unfinished answers saved on this device."}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {saved ? (
            <>
              {(() => {
                const startNew = (
                  <button
                    key="new"
                    type="button"
                    className={buttonVariants({
                      size: "lg",
                      variant: saved.completed ? "default" : "outline",
                      className: "h-11 px-4",
                    })}
                    onClick={() => {
                      clearSaved();
                      setSaved(null);
                      setAnswers(DEFAULT_ANSWERS);
                      setIndex(0);
                    }}
                  >
                    Start a new quiz (clear answers)
                  </button>
                );
                const resume = (
                  <button
                    key="resume"
                    type="button"
                    className={buttonVariants({
                      size: "lg",
                      variant: saved.completed ? "outline" : "default",
                      className: "h-11 px-4",
                    })}
                    onClick={() => {
                      setAnswers(saved.answers);
                      setIndex(saved.completed ? 0 : Math.min(saved.index, screens.length - 1));
                    }}
                  >
                    {saved.completed ? "Change my previous answers" : "Resume where I left off"}
                  </button>
                );
                // The main action comes first: clearing after a finished quiz, resuming otherwise.
                return saved.completed ? [startNew, resume] : [resume, startNew];
              })()}
            </>
          ) : (
            <button
              type="button"
              className={buttonVariants({ size: "lg", className: "h-11 px-4" })}
              onClick={() => setIndex(0)}
            >
              Start the quiz
              <ArrowRight aria-hidden />
            </button>
          )}
        </div>
      </div>
    );
  }

  const screen = screens[index];
  const last = index === screens.length - 1;
  const pct = Math.round(((index + 1) / screens.length) * 100);

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (last) finish();
        else setIndex(index + 1);
      }}
    >
      <div className="grid gap-1">
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>{screen.section}</span>
          <span>
            {index + 1} of {screens.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="bg-muted h-2 overflow-hidden rounded-full"
        >
          <div className="bg-primary h-full transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <fieldset className="grid gap-4">
        <legend className="contents">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold outline-none">
            {screen.title}
          </h2>
        </legend>
        {screen.hint && (
          <p
            className={
              screen.section === "Interests" ? "text-lg font-medium" : "text-muted-foreground"
            }
          >
            {screen.hint}
          </p>
        )}
        {screen.render()}
      </fieldset>
      <div className="flex justify-between gap-3">
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-4" })}
          onClick={() => setIndex(index - 1)}
        >
          <ArrowLeft aria-hidden />
          Back
        </button>
        <button type="submit" className={buttonVariants({ size: "lg", className: "h-11 px-4" })}>
          {last ? "See my results" : "Next"}
          <ArrowRight aria-hidden />
        </button>
      </div>
    </form>
  );
}
