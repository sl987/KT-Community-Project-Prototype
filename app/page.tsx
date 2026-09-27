import { getInstitution, getProfession, programs } from "@/lib/data";

/** Phase 0 placeholder. The discovery hub replaces this in Phase 1. */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Ontario Healthcare Pathways</h1>
      <p className="text-muted-foreground mt-2">
        Foundation build. {programs.length} programs pass the eligibility gate. All seed data is
        unverified placeholder content.
      </p>
      <ul className="mt-8 space-y-3" aria-label="Eligible programs">
        {programs.map((p) => (
          <li key={p.id} className="rounded-lg border p-4">
            <p className="font-medium">
              {getProfession(p.professionId)?.title} · {p.name}
            </p>
            <p className="text-muted-foreground text-sm">
              {p.institutionIds.map((id) => getInstitution(id)?.name).join(", ")} ·{" "}
              {p.durationYears} years · Not yet verified
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
