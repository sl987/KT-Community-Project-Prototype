"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { Journey } from "@/lib/schema";
import { cn } from "@/lib/utils";

export interface TeamNode {
  label: string;
  /** Present when the profession has a page in the directory. */
  slug: string | null;
  professionId: string | null;
}

export interface TeamEdge {
  from: string;
  to: string;
  how: string;
}

const SIZE = 460;
const C = SIZE / 2;
const RING = 165;

/** Splits a label into at most two balanced lines for the SVG. */
function twoLines(label: string): string[] {
  const words = label.split(" ");
  if (words.length < 2 || label.length <= 14) return [label];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const diff = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (diff < bestDiff) [best, bestDiff] = [i, diff];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function TeamExplorer({
  nodes,
  edges,
  journeys,
}: {
  nodes: TeamNode[];
  edges: TeamEdge[];
  journeys: Journey[];
}) {
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const journey = journeys.find((j) => j.id === journeyId) ?? null;
  const activeLabel = journey?.steps[step]?.label ?? null;
  const journeyLabels = journey?.steps.map((s) => s.label) ?? [];

  const pos = new Map(
    nodes.map((n, i) => {
      const a = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return [n.label, { x: C + RING * Math.cos(a), y: C + RING * Math.sin(a) }];
    }),
  );
  const path = journeyLabels.map((l) => pos.get(l)).filter((p) => p !== undefined);

  const pick = (id: string) => {
    setJourneyId(id);
    setStep(0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <figure className="grid gap-2">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto w-full max-w-xl"
          role="group"
          aria-label="Diagram of health professions working around a patient"
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="fill-primary" />
            </marker>
          </defs>
          {/* Spokes to the patient */}
          {nodes.map((n) => {
            const p = pos.get(n.label)!;
            return (
              <line key={`spoke-${n.label}`} x1={C} y1={C} x2={p.x} y2={p.y} className="stroke-border" strokeDasharray="3 4" />
            );
          })}
          {/* Team connections from the data */}
          {edges.map((e) => {
            const a = pos.get(e.from);
            const b = pos.get(e.to);
            if (!a || !b) return null;
            return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-muted-foreground" strokeWidth={2} />;
          })}
          {/* Journey path */}
          {path.slice(1).map((b, i) => {
            const a = path[i];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy) || 1;
            const r = 34;
            return (
              <line
                key={`j-${i}`}
                x1={a.x + (dx / len) * r}
                y1={a.y + (dy / len) * r}
                x2={b.x - (dx / len) * r}
                y2={b.y - (dy / len) * r}
                className={cn("stroke-primary", i < step ? "opacity-100" : "opacity-40")}
                strokeWidth={2.5}
                markerEnd="url(#arrow)"
              />
            );
          })}
          <circle cx={C} cy={C} r={40} className="fill-muted stroke-border" />
          <text x={C} y={C + 5} textAnchor="middle" className="fill-foreground text-[14px] font-semibold">
            Patient
          </text>
          {nodes.map((n) => {
            const p = pos.get(n.label)!;
            const active = n.label === activeLabel;
            const inJourney = journeyLabels.includes(n.label);
            const lines = twoLines(n.label);
            const body = (
              <>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={30}
                  className={cn(
                    "stroke-2 transition-colors",
                    active
                      ? "fill-primary stroke-primary"
                      : inJourney
                        ? "fill-background stroke-primary"
                        : "fill-background stroke-muted-foreground",
                  )}
                  strokeDasharray={n.slug ? undefined : "4 3"}
                />
                {lines.map((l, i) => (
                  <text
                    key={l}
                    x={p.x}
                    y={p.y + 44 + i * 14}
                    textAnchor="middle"
                    className={cn("text-[12px]", active ? "fill-foreground font-semibold" : "fill-foreground")}
                  >
                    {l}
                  </text>
                ))}
              </>
            );
            return n.slug ? (
              <a key={n.label} href={`/professions/${n.slug}`} aria-label={`${n.label} (profession page)`} className="outline-none [&:focus-visible_circle]:stroke-ring [&:focus-visible_circle]:stroke-[4]">
                {body}
              </a>
            ) : (
              <g key={n.label} aria-label={`${n.label} (not in the directory yet)`}>
                {body}
              </g>
            );
          })}
        </svg>
        <figcaption className="text-center text-xs text-muted-foreground">
          Solid circles have a profession page. Dashed circles aren&apos;t in the directory yet.
          Grey lines show professions that often work together.
        </figcaption>
      </figure>

      <div className="grid content-start gap-4">
        <fieldset>
          <legend className="mb-2 font-medium">Follow a patient journey</legend>
          <div className="grid gap-2">
            {journeys.map((j) => (
              <button
                key={j.id}
                type="button"
                aria-pressed={j.id === journeyId}
                onClick={() => pick(j.id)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  j.id === journeyId && "border-primary bg-primary/10",
                )}
              >
                <span className="block font-medium">{j.title}</span>
                <span className="text-muted-foreground">{j.summary}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {journey && (
          <section aria-label={`${journey.title} journey`} className="grid gap-3 rounded-xl border p-4">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Step {step + 1} of {journey.steps.length}: {journey.steps[step].label}
            </p>
            <ol className="grid gap-2 text-sm">
              {journey.steps.map((s, i) => {
                const node = nodes.find((n) => n.label === s.label);
                return (
                  <li key={`${s.label}-${i}`}>
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-current={i === step ? "step" : undefined}
                      className={cn(
                        "w-full rounded-lg p-2 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        i === step && "bg-primary/10 ring-1 ring-primary",
                      )}
                    >
                      <span className="font-medium">
                        {i + 1}. {s.label}
                      </span>
                      <span className="block text-muted-foreground">{s.role}</span>
                    </button>
                    {i === step && node?.slug && (
                      <Link href={`/professions/${node.slug}`} className="ml-2 text-sm underline">
                        See {s.label} programs
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="flex justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                className={buttonVariants({ variant: "outline" })}
              >
                <ArrowLeft aria-hidden /> Previous
              </button>
              <button
                type="button"
                disabled={step === journey.steps.length - 1}
                onClick={() => setStep(step + 1)}
                className={buttonVariants({ variant: "outline" })}
              >
                Next <ArrowRight aria-hidden />
              </button>
            </div>
          </section>
        )}
      </div>

      <section aria-labelledby="team-list-h" className="grid gap-2 text-sm lg:col-span-2">
        <h2 id="team-list-h" className="text-lg font-semibold">
          Who works together (text version)
        </h2>
        {edges.length === 0 ? (
          <p className="text-muted-foreground">No team connections recorded yet.</p>
        ) : (
          <ul className="list-disc pl-5">
            {edges.map((e) => (
              <li key={`${e.from}-${e.to}`}>
                <strong>{e.from}</strong> and <strong>{e.to}</strong>: {e.how}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
