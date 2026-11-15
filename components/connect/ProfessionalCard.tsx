import { GraduationCap } from "lucide-react";
import type { Professional } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { LinkedInIcon } from "./LinkedInIcon";

const AVATAR_TONES = [
  "bg-(--uoft-blue) text-white",
  "bg-(--uoft-boundless) text-white",
  "bg-(--uoft-dark-green) text-white",
  "bg-(--uoft-purple) text-white",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
}

function tone(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

/** One partner professional with a clear "Connect on LinkedIn" action. */
export function ProfessionalCard({
  person,
  fieldTitle,
  headingLevel = "h3",
}: {
  person: Professional;
  fieldTitle?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <article className="bg-card text-card-foreground flex flex-col gap-4 rounded-lg border p-5 shadow-xs">
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold",
            tone(person.id),
          )}
        >
          {initials(person.name)}
        </span>
        <div className="min-w-0">
          {fieldTitle && (
            <p className="text-link text-xs font-semibold tracking-wide uppercase">{fieldTitle}</p>
          )}
          <Heading className="text-lg leading-snug font-semibold">{person.name}</Heading>
          <p className="text-sm">{person.jobType}</p>
        </div>
      </div>
      <p className="text-muted-foreground flex gap-2 text-sm">
        <GraduationCap className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <span className="sr-only">Studied at: </span>
          {person.almaMater}
        </span>
      </p>
      {person.description && <p className="text-sm">{person.description}</p>}
      <a
        href={person.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-visible:ring-ring/50 mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0A66C2] px-4 text-sm font-semibold text-white transition-colors outline-none hover:bg-[#004182] focus-visible:ring-3"
      >
        <LinkedInIcon className="size-4" />
        Connect on LinkedIn
        <span className="sr-only">with {person.name} (opens in a new tab)</span>
      </a>
    </article>
  );
}
