import Link from "next/link";
import { LogoLongName, LogoMark, LogoWordmark } from "./Logo";
import { MainNav } from "./MainNav";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="bg-brand text-brand-foreground border-b-4 border-(--uoft-boundless) print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-0 px-4 py-1">
        <Link
          href="/"
          className="focus-visible:ring-brand-accent flex items-center gap-2.5 rounded-sm py-3 outline-none focus-visible:ring-2"
        >
          <LogoMark className="h-10 w-auto shrink-0" accent="var(--uoft-sky)" />
          <span className="leading-tight">
            <LogoWordmark className="block text-xl font-extrabold tracking-wide" heart="#f28b7d" />
            <LogoLongName
              className="text-brand-muted hidden max-w-72 text-[0.7rem] leading-snug md:block"
              letterClassName="text-brand-foreground font-bold"
            />
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
