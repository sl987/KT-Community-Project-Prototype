"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { ProgramSummary } from "@/lib/data";

export const MAX_COMPARE = 3;

/** Sticky bar listing programs picked for comparison (§7.5). */
export function CompareDrawer({
  selected,
  onRemove,
  onClear,
}: {
  selected: ProgramSummary[];
  onRemove: (slug: string) => void;
  onClear: () => void;
}) {
  if (selected.length === 0) return null;
  const ready = selected.length >= 2;
  return (
    <section
      aria-label="Compare programs"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t shadow-lg backdrop-blur print:hidden"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
        <ul className="flex flex-1 flex-wrap gap-2">
          {selected.map((p) => (
            <li
              key={p.slug}
              className="bg-muted flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-3 text-sm"
            >
              <span>
                {p.profession.title}
                <span className="text-muted-foreground"> · {p.institutions[0]?.name}</span>
              </span>
              <button
                type="button"
                onClick={() => onRemove(p.slug)}
                className="hover:bg-background rounded-full p-1"
                aria-label={`Remove ${p.name} at ${p.institutions[0]?.name} from comparison`}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {ready ? `${selected.length} of ${MAX_COMPARE} selected` : "Pick at least 2 programs"}
          </p>
          <button type="button" onClick={onClear} className="text-sm underline underline-offset-4">
            Clear
          </button>
          {ready ? (
            <Link
              href={`/compare?ids=${selected.map((p) => p.slug).join(",")}`}
              className={buttonVariants({ size: "lg" })}
            >
              Compare {selected.length}
            </Link>
          ) : (
            <span
              className={buttonVariants({
                size: "lg",
                className: "pointer-events-none opacity-50",
              })}
              aria-disabled="true"
            >
              Compare
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
