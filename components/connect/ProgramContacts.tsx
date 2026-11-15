import { ArrowRight, MessageCircle, UserRoundX } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { NetworkField, Professional } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "./ProfessionalCard";

const PREVIEW = 3;

export const directoryHref = (field?: NetworkField) =>
  field ? `/connect/directory?field=${field.slug}` : "/connect/directory";

/** Header call-to-action. Always visible; says "No contacts yet" when the field has nobody. */
export function ContactButton({
  field,
  count,
  className,
}: {
  field?: NetworkField;
  count: number;
  className?: string;
}) {
  if (count === 0) {
    return (
      <p
        className={cn(
          "text-muted-foreground inline-flex h-11 items-center gap-2 rounded-md border border-dashed px-4 text-sm",
          className,
        )}
      >
        <UserRoundX className="size-4" aria-hidden />
        No contacts yet
      </p>
    );
  }
  return (
    <Link
      href={directoryHref(field)}
      className={buttonVariants({ size: "lg", className: cn("h-11 px-5 text-base", className) })}
    >
      <MessageCircle aria-hidden />
      Contact someone in this field
      <span className="bg-primary-foreground/20 rounded-full px-2 py-0.5 text-xs">{count}</span>
    </Link>
  );
}

/** "Talk to people in this field" section on a program page. */
export function ProgramContacts({
  field,
  people,
  professionTitle,
}: {
  field?: NetworkField;
  people: Professional[];
  professionTitle: string;
}) {
  return (
    <section
      id="contacts"
      aria-labelledby="contacts-h"
      className="border-t-primary bg-muted/60 dark:border-t-brand-accent grid scroll-mt-4 gap-4 rounded-lg border border-t-4 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <h2 id="contacts-h" className="text-xl font-semibold tracking-tight">
            Talk to people in this field
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm">
            {people.length > 0
              ? `Ask a ${professionTitle.replace(/\s*\(.*\)/, "")} what the job is really like. These professionals agreed to hear from students on LinkedIn.`
              : `We don't have a partner in this field yet. You can still meet professionals from other allied health careers.`}
          </p>
        </div>
        {people.length > PREVIEW && (
          <Link
            href={directoryHref(field)}
            className="text-link inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
          >
            See all {people.length}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {people.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {people.slice(0, PREVIEW).map((p) => (
            <li key={p.id} className="grid">
              <ProfessionalCard person={p} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-background flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-4">
          <p className="flex items-center gap-2 font-medium">
            <UserRoundX className="text-muted-foreground size-5" aria-hidden />
            No contacts yet
          </p>
          <Link
            href="/connect/directory"
            className={buttonVariants({ variant: "outline", className: "h-9 px-3" })}
          >
            Browse the full directory
            <ArrowRight aria-hidden />
          </Link>
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        New to LinkedIn?{" "}
        <Link href="/connect#ground-rules" className="underline">
          Read the ground rules
        </Link>{" "}
        before reaching out.
      </p>
    </section>
  );
}
