/**
 * Builds the program page's step-by-step pathway (§6.4) by attaching the
 * program's application, non-academic, exam and registration data to the
 * matching timeline steps. Adds nothing that isn't in the data, except a
 * jurisprudence step when the regulator requires one and the timeline lacks it.
 */
import { describePrereq } from "./prereqs";
import { formatCAD, formatDate, PORTAL_LABELS } from "./format";
import type { Profession, Program, ProgramStep, RegulatoryBody } from "./schema";

export interface PathwayFact {
  label: string;
  value: string | null;
  sourceUrl?: string | null;
}

export interface PathwayList {
  title: string;
  items: string[];
}

export interface PathwayStep extends ProgramStep {
  facts: PathwayFact[];
  lists: PathwayList[];
}

export function buildPathway(
  program: Program,
  profession: Profession,
  regulator: RegulatoryBody | undefined,
): PathwayStep[] {
  const steps: PathwayStep[] = [...program.timeline]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ ...s, facts: [], lists: [] }));

  const first = (phase: ProgramStep["phase"]) => steps.find((s) => s.phase === phase);
  const lic = profession.licensing;

  // High school: prerequisites.
  const hs = first("high_school");
  if (hs) {
    const prereqs = program.academic.prerequisites.map(
      (p) =>
        `${describePrereq(p)}${p.minMark != null ? ` (minimum ${p.minMark}%)` : ""}${p.note ? ` — ${p.note}` : ""}`,
    );
    if (prereqs.length) hs.lists.push({ title: "Prerequisite courses", items: prereqs });
    else hs.facts.push({ label: "Prerequisite courses", value: null });
  }

  // Application: portal, code, dates, supplementary pieces.
  const app = first("application");
  if (app) {
    const a = program.application;
    app.facts.push(
      { label: "Apply through", value: PORTAL_LABELS[a.portal] },
      { label: "Program code", value: a.programCode.value, sourceUrl: a.programCode.sourceUrl },
      {
        label: "Equal consideration date",
        value: a.equalConsiderationDate ? formatDate(a.equalConsiderationDate) : null,
      },
      {
        label: "Starts in",
        value: a.intakes.map((i) => i[0].toUpperCase() + i.slice(1)).join(", "),
      },
    );
    const supp = program.academic.supplementary.map(
      (s) => `${s.label}${s.required ? " (required)" : " (optional)"}`,
    );
    app.lists.push({
      title: "Supplementary requirements",
      items: supp.length ? supp : ["None listed yet — check the official program page."],
    });
  }

  // Non-academic requirements at the point they're due.
  const firstProgram = first("program");
  const firstPlacement = first("placement") ?? firstProgram;
  const describe = (n: Program["nonAcademic"][number]) =>
    `${n.label}${n.timing ? ` — ${n.timing}` : ""}`;
  const beforeStart = program.nonAcademic.filter((n) => n.stage === "before_start");
  const beforePlacement = program.nonAcademic.filter(
    (n) => (n.stage ?? "before_placement") === "before_placement",
  );
  if (firstProgram && beforeStart.length) {
    firstProgram.lists.push({ title: "Due before you start", items: beforeStart.map(describe) });
  }
  if (firstPlacement && beforePlacement.length) {
    firstPlacement.lists.push({
      title: "Due before placements",
      items: beforePlacement.map(describe),
    });
  }

  // Licensing exams, each with its own prerequisites, format, timing and fee.
  const isJuris = (s: PathwayStep) => /jurisprudence/i.test(s.title);
  const examSteps = steps.filter((s) => s.phase === "exam" && !isJuris(s));
  const remaining = [...lic.exams];
  for (const step of examSteps) {
    const byName = remaining.findIndex((e) =>
      step.title.toLowerCase().includes(e.name.toLowerCase()),
    );
    const idx = byName >= 0 ? byName : 0;
    const assigned = step === examSteps.at(-1) ? remaining.splice(0) : remaining.splice(idx, 1);
    for (const exam of assigned) {
      step.facts.push(
        {
          label: `${exam.name}: administered by`,
          value: exam.administeredBy,
          sourceUrl: exam.sourceUrl,
        },
        { label: `${exam.name}: format`, value: exam.format ?? null },
        { label: `${exam.name}: typical timing`, value: exam.typicalTiming ?? null },
        {
          label: `${exam.name}: fee`,
          value: exam.feeCAD?.value != null ? formatCAD(exam.feeCAD.value) : null,
          sourceUrl: exam.feeCAD?.sourceUrl,
        },
      );
      if (exam.eligibilityPrereqs.length) {
        step.lists.push({
          title: `To be eligible for the ${exam.name}`,
          items: exam.eligibilityPrereqs,
        });
      }
    }
  }

  // Jurisprudence exam, if the regulator requires one.
  if (lic.jurisprudenceExam?.required) {
    const juris = steps.find((s) => s.phase === "exam" && isJuris(s));
    const fact: PathwayFact = {
      label: "Required by",
      value: regulator?.name ?? null,
      sourceUrl: lic.jurisprudenceExam.sourceUrl,
    };
    if (juris) juris.facts.push(fact);
    else {
      const lastExam = steps.filter((s) => s.phase === "exam").at(-1);
      steps.push({
        order: (lastExam?.order ?? 0) + 0.5,
        phase: "exam",
        title: "Write the jurisprudence exam",
        description: "An exam on the laws and rules for your profession in Ontario.",
        facts: [fact],
        lists: [],
      });
    }
  }

  // Registration with the regulator.
  const reg = first("registration");
  if (reg) {
    reg.facts.push(
      { label: "Regulator", value: regulator?.name ?? null, sourceUrl: regulator?.url },
      { label: "Certificate class", value: lic.registration.classOfCertificate ?? null },
      {
        label: "Annual fee",
        value:
          lic.registration.annualFeeCAD?.value != null
            ? formatCAD(lic.registration.annualFeeCAD.value)
            : null,
        sourceUrl: lic.registration.annualFeeCAD?.sourceUrl,
      },
    );
    if (lic.registration.steps.length) {
      reg.lists.push({ title: "Registration steps", items: lic.registration.steps });
    }
  }

  return steps.sort((a, b) => a.order - b.order);
}

/** Every distinct sourceUrl anywhere inside the given records. */
export function collectSourceUrls(...records: unknown[]): string[] {
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (v === null || typeof v !== "object") return;
    for (const [k, child] of Object.entries(v)) {
      if (k === "sourceUrl" && typeof child === "string") out.add(child);
      else walk(child);
    }
  };
  records.forEach(walk);
  return [...out];
}
