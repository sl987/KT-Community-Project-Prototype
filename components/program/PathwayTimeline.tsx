import { UnverifiedField } from "@/components/common/UnverifiedField";
import { SourceLink } from "@/components/common/SourceLink";
import { PHASE_LABELS } from "@/lib/format";
import type { PathwayStep } from "@/lib/pathway";
import { cn } from "@/lib/utils";

const PHASE_DOT: Record<PathwayStep["phase"], string> = {
  high_school: "bg-sky-600",
  application: "bg-violet-600",
  program: "bg-primary",
  placement: "bg-teal-600",
  exam: "bg-amber-600",
  registration: "bg-rose-600",
  work: "bg-emerald-600",
};

/** Vertical stepper from Grade 12 to working professional (§6.4). */
export function PathwayTimeline({
  steps,
  officialUrl,
}: {
  steps: PathwayStep[];
  officialUrl: string | null;
}) {
  return (
    <ol className="border-border relative grid gap-6 border-l-2 pl-6">
      {steps.map((s, i) => (
        <li key={`${s.order}-${i}`} className="relative">
          <span
            className={cn(
              "ring-background absolute top-1.5 -left-[31px] size-3.5 rounded-full ring-4",
              PHASE_DOT[s.phase],
            )}
            aria-hidden
          />
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Step {i + 1} · {PHASE_LABELS[s.phase]}
            {s.durationLabel && <> · {s.durationLabel}</>}
          </p>
          <h3 className="text-base font-semibold">{s.title}</h3>
          <p className="text-muted-foreground text-sm">{s.description}</p>

          {s.prereqsForStep && s.prereqsForStep.length > 0 && (
            <div className="mt-2 text-sm">
              <p className="font-medium">What you need before this step</p>
              <ul className="list-disc pl-5">
                {s.prereqsForStep.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {s.facts.length > 0 && (
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
              {s.facts.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted-foreground">{f.label}</dt>
                  <dd>
                    {f.value ?? <UnverifiedField officialUrl={officialUrl} />}{" "}
                    {f.value && <SourceLink href={f.sourceUrl} />}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {s.lists.map((l) => (
            <div key={l.title} className="mt-2 text-sm">
              <p className="font-medium">{l.title}</p>
              <ul className="list-disc pl-5">
                {l.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {s.sourceUrl && <SourceLink href={s.sourceUrl} className="mt-1" />}
        </li>
      ))}
    </ol>
  );
}
