import { BadgeCheck, CircleAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Provenance } from "@/lib/schema";

export function VerifiedBadge({ provenance }: { provenance: Provenance }) {
  const { lastVerified, verifiedBy } = provenance;
  if (verifiedBy === "human" && lastVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
        <BadgeCheck className="size-3.5" aria-hidden />
        Verified {formatDate(lastVerified)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
      <CircleAlert className="size-3.5" aria-hidden />
      {lastVerified ? `Checked by assistant ${formatDate(lastVerified)}` : "Not yet verified"}
    </span>
  );
}
