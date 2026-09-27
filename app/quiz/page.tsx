import type { Metadata } from "next";
import { QuizStepper } from "@/components/quiz/QuizStepper";
import { courseOptions, quizConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Career match quiz",
  description:
    "A 5-minute quiz that matches your interests, courses, and work style to health care programs.",
};

export default function QuizPage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Find your match</h1>
      <QuizStepper config={quizConfig} courses={courseOptions} />
    </div>
  );
}
