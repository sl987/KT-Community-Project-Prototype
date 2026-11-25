import "server-only";
import type { TrackEvent, TrackPayload } from "./tracking";

/**
 * Minimal server-only access to the click_events table through Supabase's REST
 * API, using the service role key. Never import this from a client component.
 */

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

export const isSupabaseConfigured = () => config() !== null;

function headers(key: string): Record<string, string> {
  const h: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Legacy service_role keys are JWTs and also go in Authorization.
  // New sb_secret_ keys are not JWTs and must only be sent as `apikey`.
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`;
  return h;
}

/** Inserts one event. Throws on failure so the caller can log it. */
export async function insertClickEvent(row: TrackPayload): Promise<void> {
  const c = config();
  if (!c) throw new Error("Supabase is not configured");
  const res = await fetch(`${c.url}/rest/v1/click_events`, {
    method: "POST",
    headers: { ...headers(c.key), Prefer: "return=minimal" },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
}

export interface ClickRow {
  event: TrackEvent;
  profession: string | null;
  program: string | null;
  session_id: string | null;
  created_at: string;
}

const PAGE_SIZE = 1000;
const MAX_ROWS = 100_000;

/** Reads every event (oldest first), paging past Supabase's 1,000-row limit. */
export async function fetchClickEvents(): Promise<ClickRow[]> {
  const c = config();
  if (!c) throw new Error("Supabase is not configured");
  const rows: ClickRow[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const res = await fetch(
      `${c.url}/rest/v1/click_events?select=event,profession,program,session_id,created_at&order=id.asc`,
      {
        headers: { ...headers(c.key), Range: `${from}-${from + PAGE_SIZE - 1}` },
        cache: "no-store",
      },
    );
    if (!res.ok) throw new Error(`Supabase read failed: ${res.status} ${await res.text()}`);
    const page = (await res.json()) as ClickRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}
