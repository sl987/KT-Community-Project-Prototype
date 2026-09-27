"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import type { ReactNode } from "react";
import { PrereqIndicator } from "@/components/program/ProgramCard";
import type { ProgramSummary } from "@/lib/data";
import {
  CREDENTIAL_LABELS,
  OUTLOOK_LABELS,
  formatAverageRange,
  formatHourly,
  formatYears,
} from "@/lib/format";
import { describePrereq } from "@/lib/prereqs";

const MAX = 3;
const NV = <span className="text-amber-800 dark:text-amber-300">Not yet verified</span>;

export function CompareTable({ programs }: { programs: ProgramSummary[] }) {
  const [ids, setIds] = useQueryState(
    "ids",
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ history: "replace" }),
  );
  const [courses] = useQueryState("courses", parseAsArrayOf(parseAsString));
  const selected = ids
    .map((id) => programs.find((p) => p.slug === id))
    .filter((p): p is ProgramSummary => p !== undefined)
    .slice(0, MAX);
  const addable = programs.filter((p) => !selected.includes(p));
  const setSelected = (list: ProgramSummary[]) =>
    setIds(list.length ? list.map((p) => p.slug) : null);

  const rows: { label: string; cell: (p: ProgramSummary) => ReactNode }[] = [
    { label: "Profession", cell: (p) => p.profession.title },
    {
      label: "School",
      cell: (p) => p.institutions.map((i) => `${i.name} (${i.city})`).join(" & "),
    },
    { label: "Credential", cell: (p) => CREDENTIAL_LABELS[p.credential] },
    { label: "Length", cell: (p) => formatYears(p.durationYears) },
    {
      label: "Admission average",
      cell: (p) => {
        const a = formatAverageRange(p.admissionAverage.low, p.admissionAverage.high);
        return a ? `${a} (${p.admissionAverage.cycle})` : NV;
      },
    },
    {
      label: "Prerequisites",
      cell: (p) =>
        p.prerequisites.length === 0 ? (
          NV
        ) : (
          <div className="grid gap-1">
            <ul className="list-disc pl-4">
              {p.prerequisites.map((x) => (
                <li key={describePrereq(x)} className="font-mono text-xs">
                  {describePrereq(x)}
                </li>
              ))}
            </ul>
            {courses && courses.length > 0 && <PrereqIndicator program={p} courses={courses} />}
          </div>
        ),
    },
    {
      label: "Median wage",
      cell: (p) => (p.medianWage !== null ? formatHourly(p.medianWage) : NV),
    },
    { label: "Job outlook", cell: (p) => (p.outlook ? OUTLOOK_LABELS[p.outlook] : NV) },
    {
      label: "Licensing exams",
      cell: (p) =>
        [...p.profession.exams, ...(p.profession.jurisprudence ? ["Jurisprudence exam"] : [])].join(
          ", ",
        ) || NV,
    },
    {
      label: "Non-academic requirements",
      cell: (p) => (p.nonAcademic.length ? p.nonAcademic.join(", ") : NV),
    },
    {
      label: "Supplementary",
      cell: (p) => (p.supplementary.length ? p.supplementary.join(", ") : "None listed"),
    },
  ];

  return (
    <div className="grid gap-4">
      {selected.length < 2 && (
        <p className="bg-muted rounded-lg p-3 text-sm">
          Pick at least 2 programs to compare. You can add them below or from the{" "}
          <Link href="/" className="underline">
            program list
          </Link>
          .
        </p>
      )}
      {selected.length > 0 && (
        <div
          role="region"
          aria-label="Program comparison table"
          tabIndex={0}
          className="focus-visible:ring-ring -mx-4 overflow-x-auto px-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-sm">
            <caption className="sr-only">Comparison of {selected.length} programs</caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="bg-background sticky left-0 z-10 w-32 p-2 text-left align-bottom"
                >
                  <span className="sr-only">Attribute</span>
                </th>
                {selected.map((p) => (
                  <th key={p.slug} scope="col" className="border-b p-2 text-left align-bottom">
                    <div className="flex items-start justify-between gap-2">
                      <span>
                        <Link
                          href={`/programs/${p.slug}`}
                          className="font-semibold underline underline-offset-2"
                        >
                          {p.name}
                        </Link>
                        <span className="text-muted-foreground block text-xs font-normal">
                          {p.institutions.map((i) => i.name).join(" & ")}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelected(selected.filter((s) => s !== p))}
                        className="hover:bg-muted rounded-md p-1"
                        aria-label={`Remove ${p.name} at ${p.institutions[0]?.name}`}
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th
                    scope="row"
                    className="bg-background text-muted-foreground sticky left-0 z-10 border-b p-2 text-left align-top font-medium"
                  >
                    {r.label}
                  </th>
                  {selected.map((p) => (
                    <td key={p.slug} className="border-b p-2 align-top">
                      {r.cell(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected.length < MAX && addable.length > 0 && (
        <label className="grid max-w-md gap-1 text-sm">
          Add a program
          <select
            className="bg-background h-11 rounded-md border px-2"
            value=""
            onChange={(e) => {
              const p = programs.find((x) => x.slug === e.target.value);
              if (p) setSelected([...selected, p]);
            }}
          >
            <option value="">Choose…</option>
            {addable.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.profession.title}: {p.name} — {p.institutions.map((i) => i.name).join(" & ")}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
