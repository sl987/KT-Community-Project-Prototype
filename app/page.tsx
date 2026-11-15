import { ListChecks, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DiscoveryHub } from "@/components/hub/DiscoveryHub";
import { buttonVariants } from "@/components/ui/button";
import { courseOptions, programSummaries } from "@/lib/data";
import { siteLongName, siteSlogan } from "@/lib/site";

export default function Home() {
  return (
    <>
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-12 pb-14 sm:pt-16 sm:pb-20">
          <p className="text-brand-accent text-sm font-semibold tracking-widest uppercase">
            {siteLongName}
          </p>
          <h1 className="text-brand-foreground dark:text-brand-foreground max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl sm:leading-[1.1]">
            {siteSlogan}
          </h1>
          <p className="text-brand-muted max-w-2xl text-lg">
            Guidance counsellors can tell you which courses you need. The professionals here can
            tell you what the job is really like. Find a program that takes you from Grade 12 to a
            regulated allied health career, then talk to the people already doing it.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="#programs"
              className={buttonVariants({
                size: "lg",
                className:
                  "bg-brand-foreground text-brand hover:bg-brand-foreground/90 focus-visible:ring-brand-accent/60 h-11 px-5",
              })}
            >
              <Search aria-hidden />
              Find a program
            </Link>
            <Link
              href="/connect/directory"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "text-brand-foreground hover:text-brand-foreground focus-visible:ring-brand-accent/60 h-11 border-white/60 bg-transparent px-5 hover:bg-white/10 dark:border-white/60 dark:bg-transparent dark:hover:bg-white/10",
              })}
            >
              <MessageCircle aria-hidden />
              Talk to a professional
            </Link>
            <Link
              href="/quiz"
              className="text-brand-muted hover:text-brand-foreground decoration-brand-accent inline-flex items-center gap-1.5 px-2 text-sm underline underline-offset-4"
            >
              <ListChecks className="size-4" aria-hidden />
              Not sure? Take the 5-minute quiz
            </Link>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10">
        <Suspense fallback={<p className="text-muted-foreground">Loading programs…</p>}>
          <DiscoveryHub programs={programSummaries} courses={courseOptions} />
        </Suspense>
      </div>
    </>
  );
}
