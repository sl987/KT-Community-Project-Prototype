import type { Metadata } from "next";
import { QuizResults } from "@/components/quiz/QuizResults";
import { courseOptions, programSummaries, quizConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Your matches",
  // Results are personal: keep them out of search engines.
  robots: { index: false },
};

export default function ResultsPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your matches</h1>
      <QuizResults programs={programSummaries} config={quizConfig} courses={courseOptions} />
    </div>
  );
}
