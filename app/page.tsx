import { ListChecks, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { PartnerPrograms } from "@/components/programs/PartnerPrograms";
import { buttonVariants } from "@/components/ui/button";
import { partnerFieldPrograms, professionalsInField } from "@/lib/data";
import { siteLongName, siteSlogan } from "@/lib/site";

export default function Home() {
  const partnerCounts = Object.fromEntries(
    partnerFieldPrograms.map((f) => [f.field, professionalsInField(f.field).length]),
  );
  return (
    <>
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-8 pb-10 sm:pt-10 sm:pb-12">
          <p className="text-brand-accent text-sm font-semibold tracking-widest uppercase">
            {siteLongName}
          </p>
          <h1 className="text-brand-foreground dark:text-brand-foreground max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl sm:leading-[1.15]">
            {siteSlogan}
          </h1>
          <p className="text-brand-muted max-w-2xl text-base sm:text-lg">
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
      <div id="programs" className="mx-auto grid max-w-6xl scroll-mt-4 gap-6 px-4 py-10">
        <header className="grid max-w-3xl gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">Featured programs by profession</h2>
          <p className="text-muted-foreground text-lg">
            These are the professions our partner professionals work in. Under each one are the
            Ontario schools where you can study it, starting straight from high school. Always check
            the official program page for current admission requirements.
          </p>
        </header>
        <PartnerPrograms fields={partnerFieldPrograms} partnerCounts={partnerCounts} />
      </div>
    </>
  );
}
