import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Password gate for /admin/stats. The password lives only in the STATS_PASSWORD
 * env var and is checked on the server. A successful login sets an httpOnly
 * cookie holding an expiry signed with the password, so changing the password
 * signs everyone out.
 */

export const STATS_COOKIE = "pahssion_stats";
export const STATS_SESSION_SECONDS = 12 * 60 * 60;

const secret = () => process.env.STATS_PASSWORD || null;
export const isStatsConfigured = () => secret() !== null;

const sign = (pw: string, expires: number) =>
  createHmac("sha256", pw).update(`stats-v1:${expires}`).digest("hex");

/** Compares without leaking length or timing. */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const pw = secret();
  return pw !== null && safeEqual(input, pw);
}

export function createToken(now = Date.now()): string {
  const pw = secret();
  if (!pw) throw new Error("STATS_PASSWORD is not set");
  const expires = Math.floor(now / 1000) + STATS_SESSION_SECONDS;
  return `${expires}.${sign(pw, expires)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()): boolean {
  const pw = secret();
  if (!pw || !token) return false;
  const [exp, sig] = token.split(".");
  const expires = Number(exp);
  if (!Number.isInteger(expires) || !sig || expires * 1000 < now) return false;
  return safeEqual(sig, sign(pw, expires));
}
