"use client";

import { parseAsString, useQueryState } from "nuqs";
import type { NetworkField, Professional } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { ProfessionalCard } from "./ProfessionalCard";

/** Directory of partner professionals, filterable by profession via ?field=. */
export function DirectoryBrowser({
  fields,
  people,
}: {
  fields: NetworkField[];
  people: Professional[];
}) {
  const [field, setField] = useQueryState(
    "field",
    parseAsString.withOptions({ history: "replace", scroll: false }),
  );
  const active = fields.find((f) => f.slug === field) ?? null;
  const shown = active ? people.filter((p) => p.field === active.slug) : people;
  const titleOf = (slug: string) => fields.find((f) => f.slug === slug)?.title;

  const chip = (selected: boolean) =>
    cn(
      "inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      selected
        ? "border-primary bg-primary text-primary-foreground"
        : "bg-background hover:bg-muted",
    );

  return (
    <div className="grid gap-6">
      <div role="group" aria-label="Filter by profession" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={!active}
          onClick={() => setField(null)}
          className={chip(!active)}
        >
          All professions
          <span className="opacity-75">({people.length})</span>
        </button>
        {fields.map((f) => {
          const count = people.filter((p) => p.field === f.slug).length;
          if (count === 0) return null;
          const selected = active?.slug === f.slug;
          return (
            <button
              key={f.slug}
              type="button"
              aria-pressed={selected}
              onClick={() => setField(selected ? null : f.slug)}
              className={chip(selected)}
            >
              {f.title}
              <span className="opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "person" : "people"}
        {active ? ` in ${active.title}` : " across all professions"}.
      </p>

      {shown.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.id} className="grid">
              <ProfessionalCard person={p} fieldTitle={titleOf(p.field)} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed p-6 text-center">
          No contacts in this profession yet.
        </p>
      )}
    </div>
  );
}
