import { BadgeCheck, CircleAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Provenance } from "@/lib/schema";

export function VerifiedBadge({ provenance }: { provenance: Provenance }) {
  const { lastVerified, verifiedBy } = provenance;
  if (verifiedBy === "human" && lastVerified) {
    return (
      <span className="border-success/40 bg-success-soft text-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
        <BadgeCheck className="size-3.5" aria-hidden />
        Verified {formatDate(lastVerified)}
      </span>
    );
  }
  return (
    <span className="border-warning/40 bg-warning-soft text-warning inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
      <CircleAlert className="size-3.5" aria-hidden />
      {lastVerified ? `Checked by assistant ${formatDate(lastVerified)}` : "Not yet verified"}
    </span>
  );
}
