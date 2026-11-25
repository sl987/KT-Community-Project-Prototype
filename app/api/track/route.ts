import type { NextRequest } from "next/server";
import { insertClickEvent } from "@/lib/supabase-server";
import { parsePayload } from "@/lib/tracking";

/** Bodies are a few hundred bytes; anything much bigger is not ours. */
const MAX_BODY_BYTES = 4096;

const noContent = () => new Response(null, { status: 204 });

/**
 * Records one anonymous click (linkedin_click, program_click, guide_open).
 * Always answers 204, so tracking can never break or slow down a link.
 * Stores no IP, user agent or other identifying data.
 */
export async function POST(request: NextRequest) {
  // Only accept beacons sent by pages on this site.
  const origin = request.headers.get("origin");
  if (!origin) return noContent();
  try {
    if (new URL(origin).host !== request.nextUrl.host) return noContent();
  } catch {
    return noContent();
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return noContent();
    body = JSON.parse(text);
  } catch {
    return noContent();
  }

  const row = parsePayload(body);
  if (!row) return noContent();

  try {
    await insertClickEvent(row);
  } catch (err) {
    console.error("[track]", err instanceof Error ? err.message : err);
  }
  return noContent();
}
