import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function SourceLink({
  href,
  label = "Source",
  className,
}: {
  href: string | null | undefined;
  label?: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline underline-offset-2",
        className,
      )}
    >
      {label}
      <ExternalLink className="size-3" aria-hidden />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
