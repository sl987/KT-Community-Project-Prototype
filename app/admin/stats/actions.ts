"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  STATS_COOKIE,
  STATS_SESSION_SECONDS,
  checkPassword,
  createToken,
  isStatsConfigured,
} from "@/lib/stats-auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  if (!isStatsConfigured()) return "Stats are not set up yet (STATS_PASSWORD is missing).";
  const password = formData.get("password");
  if (typeof password !== "string" || !checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return "Wrong password.";
  }
  (await cookies()).set(STATS_COOKIE, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: STATS_SESSION_SECONDS,
  });
  redirect("/admin/stats");
}

export async function logout() {
  (await cookies()).delete({ name: STATS_COOKIE, path: "/admin" });
  redirect("/admin/stats");
}
