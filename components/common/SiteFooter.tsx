import Link from "next/link";
import { lastDataUpdate } from "@/lib/data";
import { formatDate } from "@/lib/format";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Last data update:{" "}
          {lastDataUpdate ? (
            <time dateTime={lastDataUpdate}>{formatDate(lastDataUpdate)}</time>
          ) : (
            "not yet verified"
          )}
          . This site is a starting point, not advice. Always confirm on official program pages.
        </p>
        <Link href="/about" className="underline underline-offset-4 hover:text-foreground">
          About, sources &amp; methodology
        </Link>
      </div>
    </footer>
  );
}
