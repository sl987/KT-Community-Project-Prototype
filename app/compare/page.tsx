import type { Metadata } from "next";
import { Suspense } from "react";
import { Disclaimer } from "@/components/common/Disclaimer";
import { CompareTable } from "@/components/compare/CompareTable";
import { programSummaries } from "@/lib/data";

export const metadata: Metadata = {
  title: "Compare programs",
  description: "Compare up to 3 health care programs side by side.",
};

export default function ComparePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Compare programs</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <CompareTable programs={programSummaries} />
      </Suspense>
      <Disclaimer />
    </div>
  );
}
