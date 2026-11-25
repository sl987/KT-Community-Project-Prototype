"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import type { TrackEvent } from "@/lib/tracking";

const SESSION_KEY = "pahssion_session_id";
/** Used when sessionStorage is blocked: lasts only for this page load. */
let fallbackSessionId: string | null = null;

function newId(): string {
  // randomUUID needs a secure context and a 2021+ browser.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // RFC 4122 v4 from getRandomValues, for older browsers.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** A random ID per browser tab. Not linked to the person in any way. */
function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    fallbackSessionId ??= newId();
    return fallbackSessionId;
  }
}

function send(data: { event: TrackEvent; href: string; profession?: string; program?: string }) {
  try {
    const body = JSON.stringify({
      event: data.event,
      target: new URL(data.href, window.location.href).toString(),
      profession: data.profession ?? null,
      program: data.program ?? null,
      page: window.location.pathname,
      session_id: sessionId(),
    });
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon?.("/api/track", blob)) return;
    void fetch("/api/track", { method: "POST", body: blob, keepalive: true }).catch(() => {});
  } catch {
    // Tracking must never get in the way of the link.
  }
}

type AnchorProps = Omit<ComponentProps<"a">, "href" | "target" | "rel">;

/**
 * A link that also counts one anonymous click. The link always works normally,
 * even if tracking fails: nothing here ever calls preventDefault.
 *
 * - Outbound links (default) open in a new tab with rel="noopener noreferrer".
 * - `internal` links render a Next.js <Link> and navigate as usual.
 */
export function TrackedLink({
  href,
  event,
  profession,
  program,
  internal = false,
  children,
  onClick,
  onAuxClick,
  ...rest
}: AnchorProps & {
  href: string;
  event: TrackEvent;
  profession?: string;
  program?: string;
  internal?: boolean;
  children: ReactNode;
}) {
  const track = () => send({ event, href, profession, program });
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    track();
    onClick?.(e);
  };
  // Middle-click opens a new tab; right-click (button 2) only opens a menu.
  const handleAuxClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.button === 1) track();
    onAuxClick?.(e);
  };

  if (internal) {
    return (
      <Link href={href} onClick={handleClick} onAuxClick={handleAuxClick} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      {...rest}
    >
      {children}
    </a>
  );
}
