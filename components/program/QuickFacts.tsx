import { SourceLink } from "@/components/common/SourceLink";

export interface QuickFact {
  label: string;
  value: string | null;
  sourceUrl: string | null;
  note?: string;
}

/** §6.2: tappable facts; opening one reveals its source. */
export function QuickFacts({ facts }: { facts: QuickFact[] }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {facts.map((f) => (
        <li key={f.label}>
          <details className="group bg-card h-full rounded-xl border p-3">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span className="text-muted-foreground block text-xs">{f.label}</span>
              <span
                className={
                  f.value
                    ? "block font-semibold"
                    : "block text-sm font-medium text-amber-800 dark:text-amber-300"
                }
              >
                {f.value ?? "Not yet verified"}
              </span>
              <span className="text-muted-foreground text-xs underline underline-offset-2 group-open:hidden">
                Show source
              </span>
            </summary>
            <div className="text-muted-foreground mt-1 text-xs">
              {f.note && <p>{f.note}</p>}
              {f.sourceUrl ? <SourceLink href={f.sourceUrl} /> : <p>No source recorded yet.</p>}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
