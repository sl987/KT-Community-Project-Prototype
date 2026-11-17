import { ArrowRight, ArrowUpRight, CircleAlert, CircleCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { OUTLOOK_LABELS, formatHourly } from "@/lib/format";
import type { CareerResult } from "@/lib/recommend";
import { cn } from "@/lib/utils";

export function Badge({ tone, children }: { tone: "good" | "warn" | "neutral"; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        tone === "good" && "border-success/40 bg-success-soft text-success",
        tone === "warn" && "border-warning/40 bg-warning-soft text-warning",
        tone === "neutral" && "bg-muted text-foreground",
      )}
    >
      {children}
    </span>
  );
}

function External({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-medium underline underline-offset-2"
    >
      {children}
      <ArrowUpRight className="size-3.5" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * One ranked career with reasons and watch-outs (§8 results). Shows its place in
 * the list but no score, so it reads as an idea to explore, not an instruction.
 * Featured careers link to their career page and partner professionals.
 */
export function ResultCard({ result, rank }: { result: CareerResult; rank: number }) {
  const c = result.candidate;
  const f = c.featured;
  return (
    <article className="bg-card grid break-inside-avoid gap-4 rounded-xl border p-4 sm:p-5">
      <header className="flex flex-wrap items-start gap-3">
        <span
          className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums"
          aria-label={`Ranked ${rank}`}
        >
          {rank}
        </span>
        <div className="grid flex-1 gap-1">
          <h3 className="text-xl font-semibold">
            {f ? (
              <Link href={f.href} className="underline-offset-4 hover:underline">
                {c.title}
              </Link>
            ) : (
              c.title
            )}
          </h3>
          <p className="text-muted-foreground text-sm">{c.summary}</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {f ? (
          <Badge tone="good">Featured: talk to a professional</Badge>
        ) : (
          <Badge tone="neutral">Not featured yet</Badge>
        )}
        {c.medianWage !== null && (
          <Badge tone="neutral">{`${formatHourly(c.medianWage)} median in Ontario`}</Badge>
        )}
        {c.outlook && c.outlook !== "undetermined" && (
          <Badge tone="neutral">{`${OUTLOOK_LABELS[c.outlook]} job prospects`}</Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section aria-label="Why it came up" className="bg-muted/50 rounded-lg p-3">
          <h4 className="mb-1 text-sm font-semibold">Why it came up</h4>
          {result.why.length ? (
            <ul className="grid gap-1 text-sm">
              {result.why.map((w) => (
                <li key={w} className="flex gap-2">
                  <CircleCheck className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Answer more questions for reasons.</p>
          )}
        </section>
        <section aria-label="Watch-outs" className="bg-muted/50 rounded-lg p-3">
          <h4 className="mb-1 text-sm font-semibold">Watch-outs</h4>
          {result.watchOuts.length ? (
            <ul className="grid gap-1 text-sm">
              {result.watchOuts.map((w) => (
                <li key={w} className="flex gap-2">
                  <CircleAlert className="text-warning mt-0.5 size-4 shrink-0" aria-hidden />
                  {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing flagged.</p>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm print:hidden">
        {f ? (
          <>
            <Link
              href={f.href}
              className={buttonVariants({ variant: "default", className: "h-11 px-4" })}
            >
              Explore this career
              <ArrowRight aria-hidden />
            </Link>
            {f.partners > 0 && (
              <Link
                href={f.directoryHref}
                className={buttonVariants({ variant: "outline", className: "h-11 px-4" })}
              >
                <MessageCircle aria-hidden />
                Talk to {f.partners === 1 ? "a" : f.partners} {c.title}
                {f.partners === 1 ? "" : "s"}
              </Link>
            )}
          </>
        ) : (
          c.search.map((s) => (
            <External key={s.url} href={s.url}>
              {s.label}
            </External>
          ))
        )}
      </div>
      <p className="text-muted-foreground text-xs">
        Pay and prospects:{" "}
        <External href={c.labourSourceUrl}>{`Job Bank, NOC ${c.nocCode}`}</External>
      </p>
    </article>
  );
}
