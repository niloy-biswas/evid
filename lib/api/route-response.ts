import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError } from "@/lib/auth/require-role";

/** Every API error body is `{ error: string }` so clients can render it directly. */
export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

interface RouteErrorOptions {
  /** Return the thrown error's message (e.g. upstream connection failures) instead of `fallback`. */
  exposeMessage?: boolean;
  /** Status for unexpected errors. Defaults to 500. */
  status?: number;
}

/** Shared `catch` for API routes: Zod → 400, AuthError → its status (401/403/404), anything else → logged + `fallback`. */
export function handleRouteError(e: unknown, fallback: string, options: RouteErrorOptions = {}) {
  if (e instanceof z.ZodError) {
    return jsonError(e.issues.map((issue) => issue.message).join(" "), 400);
  }
  if (e instanceof AuthError) {
    // AuthError messages are fixed strings set in lib/auth, safe to return.
    return jsonError(e.message, e.status);
  }
  console.error(e);
  const message = options.exposeMessage && e instanceof Error && e.message ? e.message : fallback;
  return jsonError(message, options.status ?? 500);
}
