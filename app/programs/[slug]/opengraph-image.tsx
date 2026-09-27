import { ImageResponse } from "next/og";
import { getProfession, getProgram, programInstitutions, programs } from "@/lib/data";
import { CREDENTIAL_LABELS, formatYears } from "@/lib/format";

export const alt = "Program pathway overview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  const profession = program ? getProfession(program.professionId) : undefined;
  const school = program
    ? programInstitutions(program)
        .map((i) => i.name)
        .join(" & ")
    : "";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0f3d3e",
        color: "#f4fbfa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 30, opacity: 0.85 }}>Ontario Healthcare Pathways</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40, opacity: 0.9 }}>{profession?.title ?? ""}</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{program?.name ?? ""}</div>
        <div style={{ fontSize: 40 }}>{school}</div>
      </div>
      <div style={{ fontSize: 30, opacity: 0.85 }}>
        {program
          ? `${CREDENTIAL_LABELS[program.credential]} · ${formatYears(program.durationYears)} · Grade 12 → licensed professional`
          : ""}
      </div>
    </div>,
    size,
  );
}
