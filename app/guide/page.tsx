import type { Metadata } from "next";
import { Disclaimer } from "@/components/common/Disclaimer";
import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { WAYS_TO_GET_A_COURSE } from "@/components/hub/MissingCourseHelper";
import { guide } from "@/lib/data";
import { formatCAD, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Application & readiness guide",
  description:
    "Grade 11 to Grade 12 application timeline, supplementary requirements, placement readiness, and costs.",
};

const PORTAL_TEXT = { OUAC: "OUAC", OCAS: "ontariocolleges.ca", both: "OUAC & ontariocolleges.ca" };

export default function GuidePage() {
  return (
    <div className="mx-auto grid max-w-3xl gap-10 px-4 py-10">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Application &amp; readiness guide</h1>
        <p className="text-muted-foreground text-lg">
          What to do in Grade 11 and 12, what extra application pieces mean, and what you&apos;ll
          need before clinical placements.
        </p>
        <VerifiedBadge provenance={guide.provenance} />
      </header>

      <section aria-labelledby="timeline-h" className="grid gap-3">
        <h2 id="timeline-h" className="text-xl font-semibold">
          Grade 11 → Grade 12 timeline
        </h2>
        <p className="text-muted-foreground text-sm">
          Application cycle: {guide.cycle ?? "not yet verified"}. Dates change every year, so always
          check the portal.
        </p>
        {([11, 12] as const).map((grade) => (
          <div key={grade} className="grid gap-2">
            <h3 className="font-medium">Grade {grade}</h3>
            <ol className="grid gap-2">
              {guide.timeline
                .filter((t) => t.grade === grade)
                .map((t) => (
                  <li key={t.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-muted-foreground">{t.description}</p>
                    {t.portal && <p>Portal: {PORTAL_TEXT[t.portal]}</p>}
                    <p>
                      Date:{" "}
                      {t.date.value ? (
                        <>
                          {/^\d{4}-\d{2}-\d{2}$/.test(t.date.value)
                            ? formatDate(t.date.value)
                            : t.date.value}{" "}
                          <SourceLink href={t.date.sourceUrl} />
                        </>
                      ) : (
                        <UnverifiedField officialLabel="portal" />
                      )}
                    </p>
                  </li>
                ))}
            </ol>
          </div>
        ))}
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="font-medium">Missing a prerequisite?</p>
          <ul className="list-disc pl-5">
            {WAYS_TO_GET_A_COURSE.map((w) => (
              <li key={w.title}>
                <strong>{w.title}:</strong> {w.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="supp-h" className="grid gap-3">
        <h2 id="supp-h" className="text-xl font-semibold">
          Supplementary requirements explained
        </h2>
        <p className="text-muted-foreground text-sm">
          Some programs ask for more than marks. Each program page says which ones it needs.
        </p>
        {guide.supplementary.map((s) => (
          <article key={s.type} id={s.type} className="scroll-mt-4 rounded-lg border p-4 text-sm">
            <h3 className="font-medium">{s.title}</h3>
            <p>{s.what}</p>
            <p className="mt-2 font-medium">Tips</p>
            <ul className="list-disc pl-5">
              {s.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section id="readiness" aria-labelledby="ready-h" className="grid scroll-mt-4 gap-3">
        <h2 id="ready-h" className="text-xl font-semibold">
          Placement readiness
        </h2>
        <p className="text-muted-foreground text-sm">
          Programs with clinical placements usually need these. Your program will give you the exact
          list and deadlines.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {guide.readiness.map((r) => (
            <article key={r.type} id={r.type} className="scroll-mt-4 rounded-lg border p-4 text-sm">
              <h3 className="font-medium">{r.title}</h3>
              <p>{r.what}</p>
              <p className="mt-1">
                <span className="text-muted-foreground">When: </span>
                {r.when}
              </p>
              <p>
                <span className="text-muted-foreground">How long it takes: </span>
                {r.howLong ?? "varies. Start early and ask your program."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="costs-h" className="grid gap-3">
        <h2 id="costs-h" className="text-xl font-semibold">
          Costs checklist
        </h2>
        <ul className="grid gap-2">
          {guide.costs.map((c) => (
            <li key={c.id} className="flex gap-3 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                aria-label={`Budgeted for ${c.label}`}
                className="accent-primary mt-1 size-4"
              />
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="text-muted-foreground">{c.description}</p>
                <p>
                  Amount:{" "}
                  {c.amountCAD.value !== null ? (
                    <>
                      {formatCAD(c.amountCAD.value)} <SourceLink href={c.amountCAD.sourceUrl} />
                    </>
                  ) : (
                    "varies / not yet verified"
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-sm">
          Financial help: the Ontario Student Assistance Program (OSAP) offers grants and loans.{" "}
          {guide.osapUrl ? (
            <SourceLink href={guide.osapUrl} label="OSAP" />
          ) : (
            <UnverifiedField officialLabel="Ontario government website for OSAP" />
          )}{" "}
          We don&apos;t estimate aid. Use the official OSAP tools.
        </p>
      </section>

      <Disclaimer />
    </div>
  );
}
