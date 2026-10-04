// Client-safe: the post-login `?next=` path, shared by proxy.ts, the OAuth callback and the
// login/signup pages so a visitor sent to /login from e.g. /share/<token> lands back there.

/**
 * `next` only when it is a same-origin path. Rejects `//host`, `/\host` and anything not starting
 * with `/` (e.g. `@host`, which would turn `${origin}${next}` into `https://origin@host`).
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return null;
  }
  return next;
}

/** `path` with `?next=` appended when there is a safe next path to carry along. */
export function withNextParam(path: string, next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}
