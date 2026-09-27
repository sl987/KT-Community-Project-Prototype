"use client";

import Link from "next/link";
import { SourceLink } from "@/components/common/SourceLink";
import { UnverifiedField } from "@/components/common/UnverifiedField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ScopeTabsProps {
  summary: string;
  duties: string[];
  scope: { description: string; controlledActs?: string[]; sourceUrl: string | null };
  regulator: { name: string; url: string } | null;
  workSettings: string[];
  team: { title: string; slug: string | null; how: string }[];
  dayInTheLife?: string;
  unverified: { scope: boolean; duties: boolean };
}

/** §6.3 job and scope of practice. */
export function ScopeTabs(p: ScopeTabsProps) {
  const officialUrl = p.regulator?.url ?? null;
  return (
    <Tabs defaultValue="what">
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <TabsList className="h-10">
          <TabsTrigger value="what" className="px-3">
            What they do
          </TabsTrigger>
          <TabsTrigger value="scope" className="px-3">
            Scope of practice
          </TabsTrigger>
          <TabsTrigger value="where" className="px-3">
            Where they work
          </TabsTrigger>
          <TabsTrigger value="team" className="px-3">
            Team
          </TabsTrigger>
          <TabsTrigger value="day" className="px-3">
            Day in the life
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="what" className="grid gap-2 pt-2 text-base">
        <p>{p.summary}</p>
        <ul className="list-disc pl-5">
          {p.duties.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {p.unverified.duties && (
          <UnverifiedField officialUrl={officialUrl} officialLabel="regulator's website" />
        )}
      </TabsContent>
      <TabsContent value="scope" className="grid gap-2 pt-2 text-base">
        <p>{p.scope.description}</p>
        {p.scope.controlledActs && p.scope.controlledActs.length > 0 && (
          <div>
            <p className="font-medium">Controlled acts</p>
            <p className="text-muted-foreground text-sm">
              A controlled act is a task that only certain licensed professionals can legally do.
            </p>
            <ul className="list-disc pl-5">
              {p.scope.controlledActs.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        )}
        {p.unverified.scope && (
          <UnverifiedField officialUrl={officialUrl} officialLabel="regulator's website" />
        )}
        <p className="flex flex-wrap gap-3 text-sm">
          {p.regulator && (
            <a
              href={p.regulator.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {p.regulator.name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <SourceLink href={p.scope.sourceUrl} label="Official scope of practice" />
        </p>
      </TabsContent>
      <TabsContent value="where" className="pt-2 text-base">
        <ul className="flex flex-wrap gap-2">
          {p.workSettings.map((w) => (
            <li key={w} className="rounded-full border px-3 py-1 text-sm">
              {w}
            </li>
          ))}
        </ul>
      </TabsContent>
      <TabsContent value="team" className="grid gap-2 pt-2 text-base">
        {p.team.length === 0 ? (
          <p className="text-muted-foreground">No team connections recorded yet.</p>
        ) : (
          <ul className="grid gap-2">
            {p.team.map((t) => (
              <li key={t.title}>
                {t.slug ? (
                  <Link href={`/professions/${t.slug}`} className="font-medium underline">
                    {t.title}
                  </Link>
                ) : (
                  <span className="font-medium">{t.title}</span>
                )}
                : {t.how}
              </li>
            ))}
          </ul>
        )}
        <Link href="/team" className="text-sm underline">
          Explore how health care teams work together
        </Link>
      </TabsContent>
      <TabsContent value="day" className="pt-2 text-base">
        {p.dayInTheLife ? (
          <blockquote className="border-primary bg-muted/50 rounded-lg border-l-4 p-4">
            {p.dayInTheLife}
          </blockquote>
        ) : (
          <p className="text-muted-foreground">
            A day-in-the-life story hasn&apos;t been written for this profession yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
