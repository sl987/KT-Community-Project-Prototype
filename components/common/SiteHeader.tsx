import { HeartPulse } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/", label: "Programs" },
  { href: "/quiz", label: "Quiz" },
  { href: "/guide", label: "Guide" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md py-2 font-semibold tracking-tight"
        >
          <HeartPulse className="size-5 text-primary" aria-hidden />
          Ontario Healthcare Pathways
        </Link>
        <nav aria-label="Main" className="order-last w-full sm:order-none sm:ml-auto sm:w-auto">
          <ul className="-mx-2 flex flex-wrap">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="inline-block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto sm:ml-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
