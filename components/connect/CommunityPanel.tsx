import { CalendarDays, Megaphone, Users } from "lucide-react";
import { communityUrl, siteName } from "@/lib/site";
import { LinkedInIcon } from "./LinkedInIcon";

/** Invitation to the PAHSSION LinkedIn community. Events live there, not on this site. */
export function CommunityPanel({ id }: { id?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-h` : undefined}
      className="bg-brand text-brand-foreground grid scroll-mt-4 gap-5 rounded-lg p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"
    >
      <div className="grid gap-3">
        <h2
          id={id ? `${id}-h` : undefined}
          className="text-brand-foreground dark:text-brand-foreground text-2xl font-semibold tracking-tight"
        >
          Join the {siteName} community on LinkedIn
        </h2>
        <p className="text-brand-muted max-w-2xl">
          Meet other students planning a career in allied health, and keep up with what&apos;s
          happening:
        </p>
        <ul className="text-brand-muted grid gap-2 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <CalendarDays className="text-brand-accent size-4 shrink-0" aria-hidden />
            Live Q&amp;As with professionals
          </li>
          <li className="flex items-center gap-2">
            <Megaphone className="text-brand-accent size-4 shrink-0" aria-hidden />
            Featured professionals &amp; programs
          </li>
          <li className="flex items-center gap-2">
            <Users className="text-brand-accent size-4 shrink-0" aria-hidden />
            Connect with other students
          </li>
        </ul>
      </div>
      {communityUrl ? (
        <a
          href={communityUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand focus-visible:ring-brand-accent/60 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold outline-none hover:bg-white/90 focus-visible:ring-3"
        >
          <LinkedInIcon className="size-4 text-[#0A66C2]" />
          Join the community
          <span className="sr-only">(opens LinkedIn in a new tab)</span>
        </a>
      ) : (
        <p className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 px-5 text-sm font-semibold">
          Community page coming soon
        </p>
      )}
    </section>
  );
}
