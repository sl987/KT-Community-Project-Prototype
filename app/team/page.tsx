import type { Metadata } from "next";
import { Disclaimer } from "@/components/common/Disclaimer";
import { TeamExplorer, type TeamEdge, type TeamNode } from "@/components/team/TeamExplorer";
import { getProfession, journeys, listedProfessions } from "@/lib/data";

export const metadata: Metadata = {
  title: "How health care teams work together",
  description: "See how different health professionals work together around a patient.",
};

export default function TeamPage() {
  // Nodes: every listed profession plus every profession named in a journey.
  const nodes = new Map<string, TeamNode>();
  for (const p of listedProfessions) {
    nodes.set(p.title, { label: p.title, slug: p.slug, professionId: p.id });
  }
  for (const j of journeys) {
    for (const s of j.steps) {
      if (nodes.has(s.label)) continue;
      const prof = s.professionId ? getProfession(s.professionId) : undefined;
      const listed = prof && listedProfessions.includes(prof);
      nodes.set(s.label, { label: s.label, slug: listed ? prof.slug : null, professionId: prof?.id ?? null });
    }
  }

  // Edges from teamConnections, de-duplicated (A→B and B→A are one edge).
  const edges: TeamEdge[] = [];
  const seen = new Set<string>();
  for (const p of listedProfessions) {
    for (const t of p.teamConnections) {
      const other = getProfession(t.professionId);
      if (!other) continue;
      const key = [p.id, other.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: p.title, to: other.title, how: t.how });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">How health care teams work together</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Patients are cared for by teams. Pick a journey to see who helps at each step.
        </p>
      </header>
      <TeamExplorer nodes={[...nodes.values()]} edges={edges} journeys={journeys} />
      <Disclaimer>
        These journeys are simplified examples to show how professions connect. They are not
        clinical guidance, and real care varies from patient to patient.
      </Disclaimer>
    </div>
  );
}
