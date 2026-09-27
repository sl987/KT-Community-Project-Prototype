import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Disclaimer } from "@/components/common/Disclaimer";
import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { DemandPanel } from "@/components/program/DemandPanel";
import { ProgramCard } from "@/components/program/ProgramCard";
import { SalaryPanel } from "@/components/program/SalaryPanel";
import { ScopeTabs } from "@/components/program/ScopeTabs";
import {
  getProfession,
  getProfessionBySlug,
  getRegulator,
  listedProfessions,
  programsForProfession,
  summarizeProgram,
} from "@/lib/data";
import { CONTACT_LABELS, DOMAIN_LABELS, WORK_SETTING_LABELS, formatCAD } from "@/lib/format";
import { isFlagged } from "@/lib/provenance";

export const dynamicParams = false;

export function generateStaticParams() {
  return listedProfessions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/professions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const prof = getProfessionBySlug(slug);
  return prof ? { title: prof.title, description: prof.summary } : {};
}

export default async function ProfessionPage({ params }: PageProps<"/professions/[slug]">) {
  const { slug } = await params;
  const prof = getProfessionBySlug(slug);
  if (!prof) notFound();
  const regulator = getRegulator(prof.regulatorId);
  const progs = programsForProfession(prof.id).map(summarizeProgram);
  const lic = prof.licensing;
  const regUrl = regulator?.url ?? null;

  return (
    <article className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] gap-10 px-4 py-8">
      <header className="grid gap-3">
        <nav aria-label="Breadcrumb" className="text-muted-foreground text-sm">
          <Link href="/" className="underline underline-offset-2">
            Programs
          </Link>{" "}
          / Professions
        </nav>
        <VerifiedBadge provenance={prof.provenance} />
        <h1 className="text-3xl font-semibold tracking-tight">{prof.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">{prof.summary}</p>
        <ul className="flex flex-wrap gap-2 text-sm">
          <li className="rounded-full border px-3 py-1">{DOMAIN_LABELS[prof.domain]}</li>
          <li className="rounded-full border px-3 py-1">{CONTACT_LABELS[prof.contactLevel]}</li>
          {prof.protectedTitles.map((t) => (
            <li key={t} className="rounded-full border px-3 py-1">
              Protected title: {t}
            </li>
          ))}
        </ul>
        {regulator && (
          <p className="text-sm">
            Regulated by{" "}
            <a href={regulator.url} target="_blank" rel="noopener noreferrer" className="underline">
              {regulator.name} ({regulator.acronym})
            </a>
            {!regulator.underRHPA && " (not under the Regulated Health Professions Act)"}
          </p>
        )}
      </header>

      <section aria-labelledby="programs-h" className="grid gap-3">
        <h2 id="programs-h" className="text-xl font-semibold">
          Eligible programs ({progs.length})
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {progs.map((p) => (
            <li key={p.id} className="grid">
              <ProgramCard program={p} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="job-h" className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <h2 id="job-h" className="text-xl font-semibold">
          The job
        </h2>
        <ScopeTabs
          summary={prof.summary}
          duties={prof.typicalDuties}
          scope={prof.scopeOfPractice}
          regulator={regulator ? { name: regulator.name, url: regulator.url } : null}
          workSettings={prof.workSettings.map((w) => WORK_SETTING_LABELS[w])}
          team={prof.teamConnections.map((t) => {
            const other = getProfession(t.professionId);
            return { title: other?.title ?? t.professionId, slug: other?.slug ?? null, how: t.how };
          })}
          dayInTheLife={prof.dayInTheLife}
          unverified={{
            scope: isFlagged(prof.provenance, "scopeOfPractice"),
            duties: isFlagged(prof.provenance, "typicalDuties"),
          }}
        />
      </section>

      <section aria-labelledby="lic-h" className="grid gap-3 text-sm">
        <h2 id="lic-h" className="text-xl font-semibold">
          Licensing and registration
        </h2>
        {isFlagged(prof.provenance, "licensing") && (
          <UnverifiedField officialUrl={regUrl} officialLabel="regulator's website" />
        )}
        <ul className="grid gap-3 sm:grid-cols-2">
          {lic.exams.map((e) => (
            <li key={e.name} className="rounded-xl border p-4">
              <h3 className="font-medium">{e.name}</h3>
              <p className="text-muted-foreground">Administered by {e.administeredBy}</p>
              {e.eligibilityPrereqs.length > 0 && (
                <ul className="mt-1 list-disc pl-5">
                  {e.eligibilityPrereqs.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              <p className="mt-1">
                Fee:{" "}
                {e.feeCAD?.value != null ? (
                  formatCAD(e.feeCAD.value)
                ) : (
                  <UnverifiedField officialUrl={regUrl} />
                )}
              </p>
              <SourceLink href={e.sourceUrl} />
            </li>
          ))}
          {lic.jurisprudenceExam?.required && (
            <li className="rounded-xl border p-4">
              <h3 className="font-medium">Jurisprudence exam</h3>
              <p className="text-muted-foreground">
                A test on the laws and rules for this profession in Ontario.
              </p>
              <SourceLink href={lic.jurisprudenceExam.sourceUrl} />
            </li>
          )}
        </ul>
        <div>
          <h3 className="font-medium">Registering with the regulator</h3>
          <ol className="list-decimal pl-5">
            {lic.registration.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <SourceLink href={lic.registration.sourceUrl} />
        </div>
      </section>

      <section aria-labelledby="pay-h" className="grid gap-3">
        <h2 id="pay-h" className="text-xl font-semibold">
          Pay and demand
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SalaryPanel
            wage={prof.labourMarket.wageOntario}
            annual={prof.labourMarket.annualSalaryEstimate}
            officialUrl="https://www.jobbank.gc.ca"
          />
          <DemandPanel labour={prof.labourMarket} officialUrl="https://www.jobbank.gc.ca" />
        </div>
      </section>

      <Disclaimer />
    </article>
  );
}
