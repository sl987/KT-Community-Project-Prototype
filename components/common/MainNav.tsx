"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Programs" },
  { href: "/connect", label: "Connect" },
  { href: "/quiz", label: "Quiz" },
  { href: "/guide", label: "Guide" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/programs");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Main" className="order-last w-full sm:order-none sm:ml-auto sm:w-auto">
      <ul className="-mx-2 flex flex-wrap">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-block px-3 py-3 text-sm font-medium transition-colors",
                  "focus-visible:ring-brand-accent rounded-sm outline-none focus-visible:ring-2",
                  "after:bg-brand-accent after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:scale-x-0 after:transition-transform",
                  active
                    ? "text-brand-foreground after:scale-x-100"
                    : "text-brand-muted hover:text-brand-foreground hover:after:scale-x-100",
                )}
              >
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
