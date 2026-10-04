/** Client-safe: pull the `{ error }` message out of a parsed API response body. */
export function apiErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string" && err) return err;
  }
  return fallback;
}
