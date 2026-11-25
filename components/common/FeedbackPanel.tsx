import { ArrowUpRight, MessageSquareHeart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { feedbackFormUrl } from "@/lib/site";

/** Invitation to the anonymous feedback form (home and About pages). */
export function FeedbackPanel() {
  return (
    <section
      id="feedback"
      aria-labelledby="feedback-h"
      className="bg-muted grid scroll-mt-4 gap-4 rounded-xl p-6 sm:grid-cols-[auto_1fr] sm:gap-5"
    >
      <span className="bg-card text-link grid size-12 place-items-center rounded-lg border">
        <MessageSquareHeart className="size-6" aria-hidden />
      </span>
      <div className="grid max-w-3xl gap-3">
        <h2 id="feedback-h" className="text-2xl font-semibold tracking-tight">
          New here? Tell us what you think
        </h2>
        <p className="text-lg">
          PAHSSION is brand new, and you&apos;re one of our first users. A short feedback form helps
          us refine the website: what&apos;s useful, what&apos;s confusing, and what&apos;s missing.
        </p>
        <p className="text-muted-foreground">
          No names are collected. Please answer honestly: telling us what didn&apos;t work is just
          as helpful as telling us what did.
        </p>
        <a
          href={feedbackFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ className: "h-11 w-fit px-5" })}
        >
          Share your feedback
          <ArrowUpRight aria-hidden />
          <span className="sr-only"> (opens a Google Form in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
