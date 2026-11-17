import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  FileCheck,
  Scale,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import type { CareerFacts as Facts } from "@/lib/schema";

/** "MRI Technologist" -> "MRI technologist": lowercase words but keep acronyms. */
const lowerTitle = (t: string) =>
  t
    .split(" ")
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase()))
    .join(" ");

const cad = (n: number) =>
  n.toLocaleString("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2 });

function Source({ href, label = "Source" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground inline-flex items-center gap-0.5 text-xs underline underline-offset-2"
    >
      {label}
      <ArrowUpRight className="size-3" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Block({
  icon,
  title,
  children,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`grid content-start gap-2 ${className}`}>
      <h4 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

/** Profession-level facts for a partner field: scope, title, licensing, pay, path, growth. */
export function CareerFacts({ facts, title }: { facts: Facts; title: string }) {
  const iconCls = "text-link size-4 shrink-0";
  return (
    <div className="bg-muted/40 grid gap-6 rounded-xl border p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Block icon={<Scale className={iconCls} aria-hidden />} title="Scope of practice">
          <blockquote className="border-link border-l-2 pl-3 text-sm italic">
            “{facts.scope.quote}”
          </blockquote>
          <p className="text-muted-foreground text-xs">— {facts.scope.quoteSource}</p>
          <p className="text-sm">{facts.scope.plain}</p>
          <Source href={facts.scope.sourceUrl} label="Read the Act" />
        </Block>

        <div className="grid content-start gap-6">
          {facts.protectedTitles && (
            <Block icon={<BadgeCheck className={iconCls} aria-hidden />} title="Protected title">
              <p className="text-sm">
                Only people registered with the{" "}
                <a
                  href={facts.regulator.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {facts.regulator.name} ({facts.regulator.acronym})
                </a>{" "}
                can call themselves {facts.protectedTitles.titles.map((t) => `“${t}”`).join(" or ")}
                {facts.protectedTitles.designation &&
                  `. Registered ${lowerTitle(title)}s use ${facts.protectedTitles.designation} after their name`}
                .
              </p>
              <span className="flex flex-wrap gap-x-3">
                <Source href={facts.protectedTitles.sourceUrl} label="Source: the Act" />
                {facts.protectedTitles.designationSourceUrl && (
                  <Source
                    href={facts.protectedTitles.designationSourceUrl}
                    label={`Source: ${facts.protectedTitles.designation}`}
                  />
                )}
              </span>
            </Block>
          )}

          {facts.oversight && (
            <Block icon={<BadgeCheck className={iconCls} aria-hidden />} title="Who oversees them">
              <p className="text-sm">{facts.oversight.text}</p>
              <Source href={facts.oversight.sourceUrl} />
            </Block>
          )}

          <Block icon={<FileCheck className={iconCls} aria-hidden />} title="Licensing">
            <ul className="grid gap-2 text-sm">
              {facts.exams.map((e) => (
                <li key={e.name}>
                  <span className="font-medium">{e.name}</span>
                  <span className="text-muted-foreground"> · {e.by}</span>
                  {e.note && <span className="block">{e.note}</span>}
                  <Source href={e.sourceUrl} />
                </li>
              ))}
            </ul>
          </Block>

          <Block icon={<CircleDollarSign className={iconCls} aria-hidden />} title="Pay in Ontario">
            <p className="text-sm">
              <span className="text-2xl font-semibold tabular-nums">{cad(facts.wage.median)}</span>
              <span className="text-muted-foreground"> / hour median</span>
            </p>
            <p className="text-muted-foreground text-sm tabular-nums">
              Range {cad(facts.wage.low)} – {cad(facts.wage.high)} · Job Bank, updated{" "}
              {formatDate(facts.wage.updated)} · NOC {facts.wage.nocCode}
            </p>
            {facts.wage.note && <p className="text-muted-foreground text-xs">{facts.wage.note}</p>}
            <Source href={facts.wage.sourceUrl} />
          </Block>
        </div>
      </div>

      <Block icon={<TrendingUp className={iconCls} aria-hidden />} title="Path at a glance">
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.path.map((p, i) => (
            <li key={p.step} className="bg-card flex gap-3 rounded-lg border p-3">
              <span className="bg-brand text-brand-foreground grid size-7 shrink-0 place-items-center rounded-full text-sm font-semibold">
                {i + 1}
              </span>
              <span className="grid gap-0.5 text-sm">
                <span className="font-medium">{p.step}</span>
                {p.detail && <span className="text-muted-foreground">{p.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </Block>

      {facts.specializations.length > 0 && (
        <Block icon={<TrendingUp className={iconCls} aria-hidden />} title="Where it can lead">
          <ul className="grid gap-3 sm:grid-cols-2">
            {facts.specializations.map((s) => (
              <li key={s.title} className="text-sm">
                <span className="font-medium">{s.title}</span>
                <span className="block">{s.detail}</span>
                <Source href={s.sourceUrl} />
              </li>
            ))}
          </ul>
        </Block>
      )}

      <p className="text-muted-foreground text-xs">
        Checked against official sources on {formatDate(facts.lastVerified)}. Always confirm with
        the regulator before you apply.
      </p>
    </div>
  );
}
