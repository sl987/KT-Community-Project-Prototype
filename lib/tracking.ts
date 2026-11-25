/**
 * Anonymous click tracking: shared by the client <TrackedLink> and the
 * server-side /api/track route. No IPs, names, emails or user agents are ever
 * collected (users are minors).
 */

export const TRACK_EVENTS = ["linkedin_click", "program_click", "guide_open"] as const;
export type TrackEvent = (typeof TRACK_EVENTS)[number];

export const isTrackEvent = (v: unknown): v is TrackEvent =>
  typeof v === "string" && (TRACK_EVENTS as readonly string[]).includes(v);

/** Longest string stored in any column. */
export const MAX_FIELD_LENGTH = 300;

export interface TrackPayload {
  event: TrackEvent;
  target: string | null;
  profession: string | null;
  program: string | null;
  page: string | null;
  session_id: string | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Trims to MAX_FIELD_LENGTH; anything that isn't a non-empty string becomes null. */
export function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, MAX_FIELD_LENGTH);
  return s.length ? s : null;
}

/** Only the path: no query string or fragment, which could carry quiz answers. */
export function cleanPage(v: unknown): string | null {
  const s = clean(v);
  if (!s || !s.startsWith("/")) return null;
  return s.split(/[?#]/)[0] || "/";
}

/** An http(s) URL, or null. */
export function cleanTarget(v: unknown): string | null {
  const s = clean(v);
  if (!s) return null;
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:" ? s : null;
  } catch {
    return null;
  }
}

/** Validates an untrusted request body. Returns null when it should be dropped. */
export function parsePayload(body: unknown): TrackPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!isTrackEvent(b.event)) return null;
  const sid = clean(b.session_id);
  return {
    event: b.event,
    target: cleanTarget(b.target),
    profession: clean(b.profession),
    program: clean(b.program),
    page: cleanPage(b.page),
    session_id: sid && UUID.test(sid) ? sid : null,
  };
}
