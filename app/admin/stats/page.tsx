import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { summarizeClicks, torontoDate, type ClickStats } from "@/lib/click-stats";
import { STATS_COOKIE, isStatsConfigured, verifyToken } from "@/lib/stats-auth";
import { fetchClickEvents, isSupabaseConfigured } from "@/lib/supabase-server";
import { TRACK_EVENTS } from "@/lib/tracking";
import { logout } from "./actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Click stats",
  robots: { index: false, follow: false },
};

/** Always read fresh numbers. */
export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  linkedin_click: "LinkedIn clicks",
  program_click: "Program page clicks",
  guide_open: "Coffee chat guide opens",
};

export default async function StatsPage() {
  const authed = verifyToken((await cookies()).get(STATS_COOKIE)?.value);

  if (!authed) {
    return (
      <Shell>
        {isStatsConfigured() ? (
          <LoginForm />
        ) : (
          <p className="text-muted-foreground">
            Stats are not set up yet. Add a STATS_PASSWORD environment variable and redeploy.
          </p>
        )}
      </Shell>
    );
  }

  if (!isSupabaseConfigured()) {
    return (
      <Shell signedIn>
        <p className="text-muted-foreground">
          Supabase is not connected. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and redeploy.
        </p>
      </Shell>
    );
  }

  let stats: ClickStats;
  try {
    stats = summarizeClicks(await fetchClickEvents());
  } catch (err) {
    console.error("[stats]", err instanceof Error ? err.message : err);
    return (
      <Shell signedIn>
        <p role="alert" className="text-destructive">
          Couldn&apos;t load events from Supabase. Check the server logs and that the click_events
          table exists.
        </p>
      </Shell>
    );
  }

  return (
    <Shell signedIn>
      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Tracking started">
          {stats.startedAt ? torontoDate(stats.startedAt) : "No events yet"}
        </Stat>
        <Stat label="Total clicks">{stats.total.clicks.toLocaleString()}</Stat>
        <Stat label="Unique sessions">{stats.total.sessions.toLocaleString()}</Stat>
      </dl>

      <Table
        title="Clicks by event and profession"
        head={["Event", "Profession", "Clicks", "Unique sessions"]}
        rows={stats.byEventProfession.map((r) => [
          EVENT_LABELS[r.event] ?? r.event,
          r.profession,
          r.clicks,
          r.sessions,
        ])}
      />

      <Table
        title="Top programs clicked"
        head={["Program", "Profession", "Clicks", "Unique sessions"]}
        rows={stats.topPrograms.map((r) => [r.program, r.profession, r.clicks, r.sessions])}
      />

      <Table
        title="Daily totals (Toronto time)"
        head={["Date", ...TRACK_EVENTS.map((e) => EVENT_LABELS[e]), "Total"]}
        rows={stats.daily.map((d) => [d.date, ...TRACK_EVENTS.map((e) => d.byEvent[e]), d.total])}
      />
    </Shell>
  );
}

function Shell({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="text-3xl font-semibold tracking-tight">Click stats</h1>
          <p className="text-muted-foreground">
            Anonymous clicks on LinkedIn, program and coffee chat links. Page visits and unique
            visitors are in Vercel Web Analytics.
          </p>
        </div>
        {signedIn && (
          <form action={logout}>
            <Button type="submit" variant="outline" className="h-10 px-4">
              Sign out
            </Button>
          </form>
        )}
      </header>
      {children}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

function Table({
  title,
  head,
  rows,
}: {
  title: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <section className="grid gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">No data yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                {head.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`px-4 py-2 font-medium ${typeof rows[0]?.[i] === "number" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-t">
                  {r.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-2 ${typeof cell === "number" ? "text-right tabular-nums" : ""}`}
                    >
                      {typeof cell === "number" ? cell.toLocaleString() : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
