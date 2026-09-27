import { ArrowRight, ListChecks } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DiscoveryHub } from "@/components/hub/DiscoveryHub";
import { buttonVariants } from "@/components/ui/button";
import { courseOptions, programSummaries } from "@/lib/data";

export default function Home() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10">
      <section className="grid gap-4">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Find a health care career you can start right after high school
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Every program here takes you from Grade 12 to a regulated health career with one
          diploma or degree, then licensing. No med school, no master&apos;s.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/quiz" className={buttonVariants({ size: "lg", className: "h-11 px-4" })}>
            <ListChecks aria-hidden />
            Take the 5-minute quiz
          </Link>
          <Link
            href="#programs"
            className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-4" })}
          >
            Browse all programs
            <ArrowRight aria-hidden />
          </Link>
        </div>
      </section>
      <Suspense fallback={<p className="text-muted-foreground">Loading programs…</p>}>
        <DiscoveryHub programs={programSummaries} courses={courseOptions} />
      </Suspense>
    </div>
  );
}
