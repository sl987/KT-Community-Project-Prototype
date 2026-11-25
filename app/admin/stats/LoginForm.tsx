"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="grid max-w-sm gap-3">
      <label htmlFor="stats-password" className="font-medium">
        Password
      </label>
      <input
        id="stats-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="border-input bg-background focus-visible:ring-ring h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
      />
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 w-fit px-5">
        {pending ? "Checking…" : "View stats"}
      </Button>
    </form>
  );
}
