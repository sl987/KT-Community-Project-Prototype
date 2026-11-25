import type { TrackEvent } from "./tracking";

/** The columns /admin/stats needs from click_events. */
export interface StatsRow {
  event: TrackEvent;
  profession: string | null;
  program: string | null;
  session_id: string | null;
  created_at: string;
}

export interface CountRow {
  clicks: number;
  sessions: number;
}

export interface ClickStats {
  total: CountRow;
  /** First event's timestamp, or null when there are none. */
  startedAt: string | null;
  byEventProfession: (CountRow & { event: TrackEvent; profession: string })[];
  topPrograms: (CountRow & { program: string; profession: string })[];
  /** Newest day first. Dates are in Toronto time. */
  daily: { date: string; total: number; byEvent: Record<TrackEvent, number> }[];
}

const NONE = "(none)";

/** YYYY-MM-DD in Toronto time. */
export const torontoDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date(iso));

function counter() {
  const map = new Map<string, { clicks: number; sessions: Set<string> }>();
  return {
    add(key: string, sessionId: string | null) {
      const c = map.get(key) ?? { clicks: 0, sessions: new Set<string>() };
      c.clicks++;
      if (sessionId) c.sessions.add(sessionId);
      map.set(key, c);
    },
    entries: () =>
      [...map.entries()].map(([key, c]) => ({
        key,
        clicks: c.clicks,
        sessions: c.sessions.size,
      })),
  };
}

export function summarizeClicks(rows: readonly StatsRow[], topN = 20): ClickStats {
  const sessions = new Set<string>();
  const byEP = counter();
  const programs = counter();
  const days = new Map<string, Record<TrackEvent, number>>();
  let startedAt: string | null = null;

  for (const r of rows) {
    if (r.session_id) sessions.add(r.session_id);
    if (!startedAt || r.created_at < startedAt) startedAt = r.created_at;
    byEP.add(`${r.event}\u0000${r.profession ?? NONE}`, r.session_id);
    if (r.event === "program_click") {
      programs.add(`${r.program ?? NONE}\u0000${r.profession ?? NONE}`, r.session_id);
    }
    const d = torontoDate(r.created_at);
    const day = days.get(d) ?? { linkedin_click: 0, program_click: 0, guide_open: 0 };
    day[r.event]++;
    days.set(d, day);
  }

  const byClicks = (a: CountRow, b: CountRow) => b.clicks - a.clicks || b.sessions - a.sessions;

  return {
    total: { clicks: rows.length, sessions: sessions.size },
    startedAt,
    byEventProfession: byEP
      .entries()
      .map(({ key, ...c }) => {
        const [event, profession] = key.split("\u0000");
        return { event: event as TrackEvent, profession, ...c };
      })
      .sort((a, b) => a.event.localeCompare(b.event) || byClicks(a, b)),
    topPrograms: programs
      .entries()
      .map(({ key, ...c }) => {
        const [program, profession] = key.split("\u0000");
        return { program, profession, ...c };
      })
      .sort(byClicks)
      .slice(0, topN),
    daily: [...days.entries()]
      .map(([date, byEvent]) => ({
        date,
        byEvent,
        total: byEvent.linkedin_click + byEvent.program_click + byEvent.guide_open,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}
