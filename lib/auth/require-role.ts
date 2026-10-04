import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getOwnedChatSession, getProfileByEmail } from "@/lib/supabase/queries";
import type { ChatSession, Profile, UserRole } from "@/lib/types";

export interface SessionProfile {
  userId: string;
  email: string;
  userRole: UserRole;
  /** Row from `profiles`; already loaded with session — avoid duplicate `getProfileByEmail` in layouts. */
  profile: Profile;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const profile = await getProfileByEmail(supabase, user.email);
  if (!profile) return null;

  const userRole = (profile.user_role ?? "user") as UserRole;
  return { userId: profile.id, email: user.email, userRole, profile };
}

export async function requireSignedIn(): Promise<SessionProfile> {
  const sp = await getSessionProfile();
  if (!sp) {
    throw new AuthError("Unauthorized", 401);
  }
  return sp;
}

export async function requireEditorOrAdmin(): Promise<SessionProfile> {
  const sp = await requireSignedIn();
  if (sp.userRole !== "editor" && sp.userRole !== "admin") {
    throw new AuthError("Forbidden", 403);
  }
  return sp;
}

export async function requireAdmin(): Promise<SessionProfile> {
  const sp = await requireSignedIn();
  if (sp.userRole !== "admin") {
    throw new AuthError("Forbidden", 403);
  }
  return sp;
}

/**
 * Chat session owned by `profileId`. Throws 404 (not 403) for both missing and foreign
 * sessions so callers cannot probe which session ids exist.
 */
export async function requireOwnedSession(
  client: SupabaseClient,
  sessionId: string,
  profileId: string
): Promise<ChatSession> {
  const session = await getOwnedChatSession(client, sessionId, profileId);
  if (!session) {
    throw new AuthError("Session not found", 404);
  }
  return session;
}

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}
