import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { MainNav } from "./MainNav";
import { siteLongName, siteName } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="bg-brand text-brand-foreground border-b-4 border-(--uoft-boundless) print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-1">
        <Link
          href="/"
          className="focus-visible:ring-brand-accent flex items-center gap-2.5 rounded-sm py-3 outline-none focus-visible:ring-2"
        >
          <span className="bg-brand-foreground text-brand grid size-8 place-items-center rounded-sm">
            <HeartPulse className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-wider">{siteName}</span>
            <span className="text-brand-muted hidden max-w-72 text-[0.7rem] leading-snug md:block">
              {siteLongName}
            </span>
          </span>
        </Link>
        <MainNav />
        <div className="ml-auto sm:ml-0">
          <ThemeToggle className="text-brand-foreground hover:text-brand-foreground focus-visible:ring-brand-accent/60 hover:bg-white/10 dark:hover:bg-white/10" />
        </div>
      </div>
    </header>
  );
}
