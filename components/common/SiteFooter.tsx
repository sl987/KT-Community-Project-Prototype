import Link from "next/link";
import { lastDataUpdate } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { siteLongName, siteName } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-brand text-brand-muted border-t-4 border-(--uoft-boundless) print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl">
          <abbr title={siteLongName} className="text-brand-foreground font-semibold no-underline">
            {siteName}
          </abbr>
          <span aria-hidden> · </span>
          Last data update:{" "}
          {lastDataUpdate ? (
            <time dateTime={lastDataUpdate}>{formatDate(lastDataUpdate)}</time>
          ) : (
            "not yet verified"
          )}
          . This site is a starting point, not advice. Always confirm on official program pages.
        </p>
        <Link
          href="/about"
          className="text-brand-foreground decoration-brand-accent focus-visible:ring-brand-accent shrink-0 rounded-sm underline underline-offset-4 outline-none hover:decoration-2 focus-visible:ring-2"
        >
          About, sources &amp; methodology
        </Link>
      </div>
    </footer>
  );
}
