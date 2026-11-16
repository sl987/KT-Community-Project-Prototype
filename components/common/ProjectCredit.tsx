import Image from "next/image";
import trpLogo from "@/public/trp-logo.png";

/** Credit band shown above the footer on every page. */
export function ProjectCredit() {
  return (
    <aside aria-label="About this project" className="bg-muted mt-16 border-t print:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-6">
        {/* White chip keeps the navy logo legible in dark mode. */}
        <span className="shrink-0 rounded-lg bg-white p-1.5 shadow-sm">
          <Image
            src={trpLogo}
            alt="Translational Research Program logo"
            width={56}
            height={56}
            className="size-14"
          />
        </span>
        <p className="max-w-3xl text-base">
          PAHSSION is a project developed by students of the{" "}
          <a
            href="https://trp.utoronto.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4"
          >
            Translational Research Program
          </a>{" "}
          at the University of Toronto.
        </p>
      </div>
    </aside>
  );
}
