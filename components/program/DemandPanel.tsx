import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { OUTLOOK_LABELS, OUTLOOK_SCORE, REGION_LABELS, formatNumber } from "@/lib/format";
import type { LabourMarket, OutlookRating, Region } from "@/lib/schema";

function OutlookMeter({ rating }: { rating: OutlookRating }) {
  const pct = Math.round(OUTLOOK_SCORE[rating] * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted h-2 w-28 overflow-hidden rounded-full" aria-hidden>
        {rating !== "undetermined" && (
          <div
            className="bg-chart-2 h-full rounded-full"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        )}
      </div>
      <span className="font-medium">{OUTLOOK_LABELS[rating]}</span>
    </div>
  );
}

/** §6.7 demand: worker count and Job Bank outlook, overall and by region. */
export function DemandPanel({
  labour,
  officialUrl,
}: {
  labour: LabourMarket;
  officialUrl: string | null;
}) {
  const { workerCount: wc, outlook } = labour;
  const regions = Object.entries(outlook.byRegion ?? {}) as [Region, OutlookRating | null][];
  return (
    <div className="grid gap-3 rounded-xl border p-4">
      <h3 className="font-semibold">Demand</h3>
      <div className="text-sm">
        <p className="text-muted-foreground">People working in Ontario</p>
        {wc.value !== null ? (
          <p>
            <strong className="text-lg">{formatNumber(wc.value)}</strong>{" "}
            <span className="text-muted-foreground">
              {wc.basis ?? ""} {wc.asOf && `(as of ${wc.asOf})`}
            </span>{" "}
            <SourceLink href={wc.sourceUrl} />
          </p>
        ) : (
          <UnverifiedField officialUrl={officialUrl} officialLabel="regulator's annual report" />
        )}
      </div>
      <div className="text-sm">
        <p className="text-muted-foreground">
          Job outlook for Ontario{outlook.period && ` (${outlook.period})`}
        </p>
        {outlook.rating ? (
          <OutlookMeter rating={outlook.rating} />
        ) : (
          <UnverifiedField officialUrl={officialUrl} officialLabel="Job Bank outlook page" />
        )}
      </div>
      {regions.length > 0 && (
        <table className="w-full text-sm">
          <caption className="text-muted-foreground mb-1 text-left">Outlook by region</caption>
          <tbody>
            {regions.map(([region, rating]) => (
              <tr key={region}>
                <th scope="row" className="py-0.5 text-left font-normal">
                  {REGION_LABELS[region]}
                </th>
                <td>{rating ? OUTLOOK_LABELS[rating] : "Not yet verified"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-muted-foreground text-xs">
        Outlook source: <SourceLink href={outlook.sourceUrl} label="Job Bank" />
        {!outlook.sourceUrl && "not yet verified"}
      </p>
    </div>
  );
}
