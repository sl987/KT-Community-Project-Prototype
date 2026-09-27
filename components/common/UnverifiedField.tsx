import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Rendered wherever a value is null (§2 Rule 3, §6). Never hide the section:
 * say it isn't verified and point to the official page.
 */
export function UnverifiedField({
  officialUrl,
  officialLabel = "official page",
  className,
}: {
  officialUrl?: string | null;
  officialLabel?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-center gap-1 text-sm text-amber-800 dark:text-amber-300",
        className,
      )}
    >
      <CircleHelp className="size-3.5 shrink-0" aria-hidden />
      <span>
        Not yet verified — check the{" "}
        {officialUrl ? (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {officialLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          officialLabel
        )}
        .
      </span>
    </span>
  );
}
