import { Info } from "lucide-react";
import type { ReactNode } from "react";

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <aside className="bg-muted/50 text-muted-foreground flex gap-2 rounded-lg border p-3 text-sm">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        {children ??
          "Always confirm requirements on the official program page before applying. This site is a starting point, not advice."}
      </p>
    </aside>
  );
}
