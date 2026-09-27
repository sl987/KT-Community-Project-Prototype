import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { formatCAD, formatHourly } from "@/lib/format";
import type { LabourMarket } from "@/lib/schema";
import { SalaryChart } from "./SalaryChart";

/** Hours per year used when no annual estimate is recorded: a standard full-time year. */
const FULL_TIME_HOURS = 1950;

/** §6.7 pay: Ontario hourly low/median/high + annual estimate with its basis. */
export function SalaryPanel({
  wage,
  annual,
  officialUrl,
}: {
  wage: LabourMarket["wageOntario"];
  annual: LabourMarket["annualSalaryEstimate"];
  officialUrl: string | null;
}) {
  const rows = [
    { label: "Low", value: wage.low },
    { label: "Median", value: wage.median },
    { label: "High", value: wage.high },
  ];
  const chartData = rows.filter((r): r is { label: string; value: number } => r.value !== null);
  const annualMedian =
    annual?.median ?? (wage.median !== null ? Math.round(wage.median * FULL_TIME_HOURS) : null);
  const annualBasis =
    annual?.basis ?? `median hourly wage × ${FULL_TIME_HOURS.toLocaleString()} hours (full-time year)`;

  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <h3 className="font-semibold">Pay in Ontario (hourly)</h3>
      {chartData.length === 0 ? (
        <UnverifiedField officialUrl={officialUrl} officialLabel="Job Bank wage page" />
      ) : (
        <>
          <SalaryChart data={chartData} />
          <table className="w-full text-sm">
            <caption className="sr-only">Ontario hourly wages</caption>
            <thead>
              <tr className="text-left text-muted-foreground">
                <th scope="col" className="font-normal">Level</th>
                <th scope="col" className="font-normal">Hourly wage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="py-0.5 text-left font-normal">{r.label}</th>
                  <td>{r.value !== null ? formatHourly(r.value) : "Not yet verified"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p className="text-sm">
        Estimated yearly pay:{" "}
        {annualMedian !== null ? (
          <>
            <strong>{formatCAD(annualMedian)}</strong>{" "}
            <span className="text-muted-foreground">({annualBasis})</span>
          </>
        ) : (
          <UnverifiedField officialUrl={officialUrl} officialLabel="Job Bank wage page" />
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        Data year: {wage.year ?? "not yet verified"} <SourceLink href={wage.sourceUrl} />
      </p>
    </div>
  );
}
