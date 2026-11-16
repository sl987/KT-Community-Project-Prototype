import { MessagesSquare, Route, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { Disclaimer } from "@/components/common/Disclaimer";
import { TeamExplorer, type TeamEdge, type TeamNode } from "@/components/team/TeamExplorer";
import { getProfession, journeys, listedProfessions } from "@/lib/data";

export const metadata: Metadata = {
  title: "Interdisciplinary health care teams",
  description:
    "What interdisciplinary care is, and how different health professionals work together around a patient.",
};

/** Professions left off the Team map. */
const HIDDEN = new Set(["registered-practical-nurse"]);

const PRINCIPLES = [
  {
    icon: UsersRound,
    title: "One team, many skills",
    body: "Each professional brings their own training, from imaging to emergency care to nursing. Together they see the whole patient, not just one problem.",
  },
  {
    icon: MessagesSquare,
    title: "Shared decisions",
    body: "Team members talk to each other, share results, and plan care together, with the patient and family as part of the team.",
  },
  {
    icon: Route,
    title: "Smooth handoffs",
    body: "As a patient moves from the ambulance to the scanner to the hospital unit, each person passes on what the next one needs to know.",
  },
];

export default function TeamPage() {
  // Nodes: every listed profession plus every profession named in a journey.
  const nodes = new Map<string, TeamNode>();
  const teamProfessions = listedProfessions.filter((p) => !HIDDEN.has(p.id));
  for (const p of teamProfessions) {
    nodes.set(p.title, { label: p.title, slug: p.slug, professionId: p.id });
  }
  for (const j of journeys) {
    for (const s of j.steps) {
      if (nodes.has(s.label)) continue;
      const prof = s.professionId ? getProfession(s.professionId) : undefined;
      const listed = prof && teamProfessions.includes(prof);
      nodes.set(s.label, {
        label: s.label,
        slug: listed ? prof.slug : null,
        professionId: prof?.id ?? null,
      });
    }
  }

  // Edges from teamConnections, de-duplicated (A→B and B→A are one edge).
  const edges: TeamEdge[] = [];
  const seen = new Set<string>();
  for (const p of teamProfessions) {
    for (const t of p.teamConnections) {
      const other = getProfession(t.professionId);
      if (!other || HIDDEN.has(other.id)) continue;
      const key = [p.id, other.id].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: p.title, to: other.title, how: t.how });
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Interdisciplinary health care teams
        </h1>
        <p className="text-muted-foreground max-w-3xl text-lg">
          No one gets better because of a single person. Patients are cared for by teams of
          professionals who each bring different training to the same goal.
        </p>
      </header>

      <section aria-labelledby="what-is-h" className="bg-muted grid gap-4 rounded-xl p-6">
        <div className="grid max-w-3xl gap-2">
          <h2 id="what-is-h" className="text-2xl font-semibold tracking-tight">
            What is interdisciplinary care?
          </h2>
          <p className="text-lg">
            Interdisciplinary care means professionals from different health disciplines work
            together as one team. Instead of each person working alone, they share information, set
            goals together, and plan care around the patient&apos;s needs. Good teamwork helps make
            care safer, more complete, and easier for patients to follow.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-card grid content-start gap-2 rounded-lg border p-4">
              <Icon className="text-link size-6" aria-hidden />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">See a team in action</h2>
        <p className="text-muted-foreground max-w-3xl text-lg">
          Pick a patient journey to see who helps at each step, and how the professions connect.
        </p>
      </div>
      <TeamExplorer nodes={[...nodes.values()]} edges={edges} journeys={journeys} />
      <Disclaimer>
        These journeys are simplified examples to show how professions connect. They are not
        clinical guidance, and real care varies from patient to patient.
      </Disclaimer>
    </div>
  );
}
