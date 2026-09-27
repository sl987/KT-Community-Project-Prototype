import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <aside className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        {children ??
          "Always confirm requirements on the official program page before applying. This site is a starting point, not advice."}
      </p>
    </aside>
  );
}
