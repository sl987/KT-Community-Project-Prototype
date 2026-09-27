import { BadgeCheck, CircleAlert } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { Provenance } from "@/lib/schema";

export function VerifiedBadge({ provenance }: { provenance: Provenance }) {
  const { lastVerified, verifiedBy } = provenance;
  if (verifiedBy === "human" && lastVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
        <BadgeCheck className="size-3.5" aria-hidden />
        Verified {formatDate(lastVerified)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <CircleAlert className="size-3.5" aria-hidden />
      {lastVerified ? `Checked by assistant ${formatDate(lastVerified)}` : "Not yet verified"}
    </span>
  );
}
