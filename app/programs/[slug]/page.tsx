import { Flag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Disclaimer } from "@/components/common/Disclaimer";
import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { DemandPanel } from "@/components/program/DemandPanel";
import { NonAcademicChecklist } from "@/components/program/NonAcademicChecklist";
import { PathwayTimeline } from "@/components/program/PathwayTimeline";
import { ProgramCard } from "@/components/program/ProgramCard";
import { QuickFacts } from "@/components/program/QuickFacts";
import { RequirementsChecklist } from "@/components/program/RequirementsChecklist";
import { SalaryPanel } from "@/components/program/SalaryPanel";
import { ScopeTabs } from "@/components/program/ScopeTabs";
import {
  getProfession,
  getProgram,
  getRegulator,
  programInstitutions,
  programs,
  programsForProfession,
  summarizeProgram,
} from "@/lib/data";
import {
  CREDENTIAL_LABELS,
  OUTLOOK_LABELS,
  PORTAL_LABELS,
  REGION_LABELS,
  WORK_SETTING_LABELS,
  formatAverageRange,
  formatDate,
  formatHourly,
  formatNumber,
  formatYears,
} from "@/lib/format";
import { buildPathway, collectSourceUrls } from "@/lib/pathway";
import { isFlagged } from "@/lib/provenance";
import { reportErrorHref } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) return {};
  const prof = getProfession(program.professionId);
  const inst = programInstitutions(program)
    .map((i) => i.name)
    .join(" & ");
  return {
    title: `${program.name} at ${inst}`,
    description: `Path from Grade 12 to ${prof?.title ?? "working professional"}: requirements, licensing, pay and demand.`,
  };
}

const AVERAGE_TYPE: Record<string, string> = {
  minimum: "Minimum average",
  competitive: "Competitive average",
  historical_range: "Past admission range",
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid scroll-mt-4 grid-cols-[minmax(0,1fr)] gap-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  const profession = getProfession(program.professionId);
  if (!profession) notFound();
  const regulator = getRegulator(profession.regulatorId);
  const institutions = programInstitutions(program);
  const officialUrl = institutions[0]?.url ?? null;
  const lm = profession.labourMarket;
  const avg = program.academic.admissionAverage;
  const avgText = formatAverageRange(avg.low, avg.high);
  const steps = buildPathway(program, profession, regulator);
  const others = programsForProfession(profession.id)
    .filter((p) => p.id !== program.id)
    .map(summarizeProgram);
  const sources = collectSourceUrls(program, profession, regulator);
  const official = [
    ...institutions.map((i) => ({ label: i.name, url: i.url })),
    ...(regulator ? [{ label: regulator.name, url: regulator.url }] : []),
  ];

  return (
    <article className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-8">
      {/* 1. Header */}
      <header className="grid gap-3">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link href="/" className="underline underline-offset-2">
            Programs
          </Link>{" "}
          /{" "}
          <Link href={`/professions/${profession.slug}`} className="underline underline-offset-2">
            {profession.title}
          </Link>
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <VerifiedBadge provenance={program.provenance} />
          <a
            href={reportErrorHref(`${program.name} (${program.slug})`)}
            className="text-muted-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2"
          >
            <Flag className="size-3" aria-hidden />
            Report an error
          </a>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">{program.name}</h1>
        <p className="text-lg">
          {institutions.map((i) => `${i.name} (${i.campus} campus, ${i.city})`).join(" & ")}
        </p>
        <dl className="grid gap-1 text-sm sm:flex sm:flex-wrap sm:gap-x-6 [&>div]:min-w-0">
          <div>
            <dt className="text-muted-foreground inline">Credential: </dt>
            <dd className="inline">
              {program.credentialName} ({CREDENTIAL_LABELS[program.credential]})
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground inline">Length: </dt>
            <dd className="inline">{formatYears(program.durationYears)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground inline">Apply through: </dt>
            <dd className="inline">
              {PORTAL_LABELS[program.application.portal]}, code{" "}
              {program.application.programCode.value ?? (
                <UnverifiedField officialUrl={officialUrl} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground inline">Region: </dt>
            <dd className="inline">
              {[...new Set(institutions.map((i) => REGION_LABELS[i.region]))].join(", ")}
            </dd>
          </div>
        </dl>
      </header>

      {/* 2. Quick facts */}
      <QuickFacts
        facts={[
          {
            label: "Median wage",
            value: lm.wageOntario.median !== null ? formatHourly(lm.wageOntario.median) : null,
            sourceUrl: lm.wageOntario.sourceUrl,
            note: lm.wageOntario.year ? `Ontario, ${lm.wageOntario.year}` : undefined,
          },
          {
            label: "Job outlook",
            value: lm.outlook.rating ? OUTLOOK_LABELS[lm.outlook.rating] : null,
            sourceUrl: lm.outlook.sourceUrl,
            note: lm.outlook.period ?? undefined,
          },
          {
            label: "Working in Ontario",
            value: lm.workerCount.value !== null ? formatNumber(lm.workerCount.value) : null,
            sourceUrl: lm.workerCount.sourceUrl,
            note: lm.workerCount.basis ?? undefined,
          },
          {
            label: "Program length",
            value: formatYears(program.durationYears),
            sourceUrl: program.eligibility.sourceUrl,
          },
          {
            label: AVERAGE_TYPE[avg.type],
            value: avgText,
            sourceUrl: avg.sourceUrl,
            note: avg.cycle ? `${avg.cycle}. Not a guarantee of admission.` : undefined,
          },
        ]}
      />

      {/* 3. Job and scope */}
      <Section id="job" title={`What a ${profession.title} does`}>
        <ScopeTabs
          summary={profession.summary}
          duties={profession.typicalDuties}
          scope={profession.scopeOfPractice}
          regulator={regulator ? { name: regulator.name, url: regulator.url } : null}
          workSettings={profession.workSettings.map((w) => WORK_SETTING_LABELS[w])}
          team={profession.teamConnections.map((t) => {
            const other = getProfession(t.professionId);
            return { title: other?.title ?? t.professionId, slug: other?.slug ?? null, how: t.how };
          })}
          dayInTheLife={profession.dayInTheLife}
          unverified={{
            scope: isFlagged(profession.provenance, "scopeOfPractice"),
            duties: isFlagged(profession.provenance, "typicalDuties"),
          }}
        />
      </Section>

      {/* 4. Pathway */}
      <Section id="pathway" title="Your path, step by step">
        <PathwayTimeline steps={steps} officialUrl={officialUrl} />
      </Section>

      {/* 5. Academic requirements */}
      <Section id="academic" title="Academic requirements">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid content-start gap-2">
            <h3 className="font-medium">High school prerequisites</h3>
            <Suspense fallback={null}>
              <RequirementsChecklist
                prerequisites={program.academic.prerequisites}
                verified={!isFlagged(program.provenance, "academic.prerequisites")}
                officialUrl={officialUrl}
              />
            </Suspense>
          </div>
          <div className="grid content-start gap-4 text-sm">
            <div>
              <h3 className="font-medium">{AVERAGE_TYPE[avg.type]}</h3>
              {avgText ? (
                <p>
                  {avgText} <span className="text-muted-foreground">({avg.cycle})</span>{" "}
                  <SourceLink href={avg.sourceUrl} />
                  <br />
                  <span className="text-muted-foreground">
                    Averages change every year. A range is not a guaranteed cut-off.
                  </span>
                </p>
              ) : (
                <UnverifiedField officialUrl={officialUrl} />
              )}
            </div>
            <div>
              <h3 className="font-medium">Supplementary requirements</h3>
              {program.academic.supplementary.length ? (
                <ul className="list-disc pl-5">
                  {program.academic.supplementary.map((s) => (
                    <li key={s.label}>
                      {s.label} {s.required ? "(required)" : "(optional)"}{" "}
                      <Link href={`/guide#${s.type}`} className="underline">
                        What is this?
                      </Link>{" "}
                      <SourceLink href={s.sourceUrl} />
                    </li>
                  ))}
                </ul>
              ) : isFlagged(program.provenance, "academic") ? (
                <UnverifiedField officialUrl={officialUrl} />
              ) : (
                <p>None.</p>
              )}
            </div>
            <div>
              <h3 className="font-medium">To stay in the program</h3>
              {program.academic.programRequirements.length ? (
                <ul className="list-disc pl-5">
                  {program.academic.programRequirements.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              ) : (
                <UnverifiedField officialUrl={officialUrl} />
              )}
            </div>
            {program.academic.otherNotes && program.academic.otherNotes.length > 0 && (
              <div>
                <h3 className="font-medium">Other notes</h3>
                <ul className="list-disc pl-5">
                  {program.academic.otherNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="text-sm">
          <h3 className="font-medium">Clinical placements</h3>
          <p>
            {program.clinicalPlacements.description}
            {program.clinicalPlacements.totalHours != null &&
              ` About ${formatNumber(program.clinicalPlacements.totalHours)} hours in total.`}{" "}
            <SourceLink href={program.clinicalPlacements.sourceUrl} />
          </p>
        </div>
      </Section>

      {/* 6. Non-academic requirements */}
      <Section id="non-academic" title="Non-academic requirements">
        <NonAcademicChecklist items={program.nonAcademic} officialUrl={officialUrl} />
      </Section>

      {/* 7. Pay and demand */}
      <Section id="pay" title="Pay and demand">
        <div className="grid gap-4 md:grid-cols-2">
          <SalaryPanel
            wage={lm.wageOntario}
            annual={lm.annualSalaryEstimate}
            officialUrl="https://www.jobbank.gc.ca"
          />
          <DemandPanel labour={lm} officialUrl="https://www.jobbank.gc.ca" />
        </div>
        <p className="text-muted-foreground text-sm">
          Tuition:{" "}
          {program.costs?.tuitionDomesticPerYear.value != null ? (
            <>
              {program.costs.tuitionDomesticPerYear.value.toLocaleString("en-CA", {
                style: "currency",
                currency: "CAD",
                maximumFractionDigits: 0,
              })}{" "}
              per year (domestic){" "}
              <SourceLink href={program.costs.tuitionDomesticPerYear.sourceUrl} />
            </>
          ) : (
            <UnverifiedField officialUrl={officialUrl} />
          )}
        </p>
      </Section>

      {/* 8. Other schools */}
      <Section id="others" title={`Other schools for ${profession.title}`}>
        {others.length === 0 ? (
          <p className="text-muted-foreground">No other eligible programs listed yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <li key={p.id} className="grid">
                <ProgramCard program={p} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* 9. Sources */}
      <Section id="sources" title="Sources">
        {sources.length ? (
          <ul className="list-disc pl-5 text-sm break-all">
            {sources.map((s) => (
              <li key={s}>
                <a
                  href={s}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 underline"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No sources recorded yet. Every value on this page is waiting for verification.
          </p>
        )}
        <div className="text-sm">
          <p className="font-medium">Official pages</p>
          <ul className="list-disc pl-5">
            {official.map((o) => (
              <li key={o.url}>
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 underline"
                >
                  {o.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-muted-foreground text-xs">
          {program.provenance.lastVerified
            ? `Last verified ${formatDate(program.provenance.lastVerified)}.`
            : "This program has not been verified yet."}
        </p>
        <Disclaimer />
      </Section>
    </article>
  );
}
