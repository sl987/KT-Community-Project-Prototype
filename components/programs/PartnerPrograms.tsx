import {
  ArrowRight,
  ArrowUpRight,
  GraduationCap,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { CareerFacts as Facts, PartnerFieldPrograms } from "@/lib/schema";

type Field = PartnerFieldPrograms & { title: string; career: Facts | null };

const PORTAL = { OUAC: "Apply on OUAC", OCAS: "Apply on ontariocolleges.ca" } as const;

/** Programs tab: partner professions, each with the institutions that offer it. */
export function PartnerPrograms({
  fields,
  partnerCounts,
}: {
  fields: Field[];
  /** Number of partner professionals per field slug. */
  partnerCounts: Record<string, number>;
}) {
  return (
    <div className="grid gap-10">
      <nav aria-label="Professions" className="flex flex-wrap gap-2">
        {fields.map((f) => (
          <a
            key={f.field}
            href={`#${f.field}`}
            className="bg-muted hover:bg-accent focus-visible:ring-ring rounded-full px-4 py-2 text-base font-medium outline-none focus-visible:ring-2"
          >
            {f.title}
            <span className="text-muted-foreground ml-1.5">({f.programs.length})</span>
          </a>
        ))}
      </nav>

      {fields.map((f) => {
        const partners = partnerCounts[f.field] ?? 0;
        return (
          <section
            key={f.field}
            id={f.field}
            aria-labelledby={`${f.field}-heading`}
            className="grid scroll-mt-6 gap-4 border-t pt-8"
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="grid max-w-3xl gap-1.5">
                <h2 id={`${f.field}-heading`} className="text-2xl font-semibold tracking-tight">
                  {f.career ? (
                    <Link
                      href={`/careers/${f.field}`}
                      className="decoration-link underline decoration-2 underline-offset-4 hover:decoration-4"
                    >
                      {f.title}
                    </Link>
                  ) : (
                    f.title
                  )}
                </h2>
                <p className="text-muted-foreground text-lg">{f.summary}</p>
                {f.career && (
                  <Link
                    href={`/careers/${f.field}`}
                    className="text-link inline-flex w-fit items-center gap-1 text-sm font-medium underline underline-offset-2"
                  >
                    Scope of practice, licensing, pay and career path
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                )}
              </div>
              {partners > 0 && (
                <Link
                  href={`/connect/directory?field=${f.field}`}
                  className={buttonVariants({ variant: "outline", className: "h-10 px-4" })}
                >
                  <MessageCircle aria-hidden />
                  Talk to {partners === 1 ? "a" : partners} {f.title}
                  {partners === 1 ? "" : "s"}
                </Link>
              )}
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {f.programs.map((p) => (
                <li
                  key={`${p.institution}-${p.program}`}
                  className="bg-card flex flex-col gap-3 rounded-xl border p-5"
                >
                  <div className="grid gap-1">
                    <h3 className="text-lg leading-snug font-semibold">{p.institution}</h3>
                    <p className="text-base">{p.program}</p>
                  </div>
                  <ul className="text-muted-foreground grid gap-1 text-sm">
                    <li className="flex items-center gap-1.5">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      {p.city}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <GraduationCap className="size-4 shrink-0" aria-hidden />
                      {p.credential}
                      {p.years ? ` · ${p.years} years` : ""}
                    </li>
                  </ul>
                  {p.detail && <p className="text-sm">{p.detail}</p>}
                  {p.partnerAlumni && (
                    <p className="text-link flex items-center gap-1.5 text-sm font-medium">
                      <Star className="size-4 shrink-0" aria-hidden />A PAHSSION partner studied
                      here
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm font-medium">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 underline"
                    >
                      Official page
                      <ArrowUpRight className="size-3.5" aria-hidden />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <span className="text-muted-foreground font-normal">{PORTAL[p.portal]}</span>
                  </div>
                </li>
              ))}
            </ul>

            {(f.note || f.moreUrl) && (
              <div className="text-muted-foreground grid gap-1 text-sm">
                {f.note && (
                  <p>
                    {f.note}{" "}
                    {f.noteUrl && (
                      <a
                        href={f.noteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Learn more
                      </a>
                    )}
                  </p>
                )}
                {f.moreUrl && (
                  <p>
                    <a
                      href={f.moreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {f.moreLabel ?? "See all programs"}
                    </a>
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
