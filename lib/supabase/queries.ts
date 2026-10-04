import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dashboard, Profile, ChatMessage, ChatSession, MessagePart } from "@/lib/types";

// Every function takes the caller's server client (`lib/supabase/server.ts`) so RLS sees the
// signed-in user. Never pass the service-role client here.

export async function getDashboards(client: SupabaseClient): Promise<Dashboard[]> {
  const { data, error } = await client
    .from("dashboards")
    .select("*")
    .eq("status", "published")
    .order("dashboard_id", { ascending: true });

  if (error) {
    console.error("Error fetching dashboards:", error.message);
    return [];
  }
  return data as Dashboard[];
}

export async function getPublishedDashboardById(
  client: SupabaseClient,
  id: string
): Promise<Dashboard | null> {
  const { data, error } = await client
    .from("dashboards")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Error fetching published dashboard:", error.message);
    return null;
  }
  return data as Dashboard | null;
}

/** Chat and public selector: only published dashboards */
export async function getPublishedDashboardByAnyId(
  client: SupabaseClient,
  id: string
): Promise<Dashboard | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const col = isUuid ? "id" : "dashboard_id";
  const { data, error } = await client
    .from("dashboards")
    .select("*")
    .eq(col, id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Error fetching published dashboard:", error.message);
    return null;
  }
  return data as Dashboard | null;
}

export async function getProfileByEmail(client: SupabaseClient, email: string): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data as Profile;
}

// ── Chat Sessions ──────────────────────────────────────────

export async function getChatSessions(
  client: SupabaseClient,
  dashboardId: string,
  profileId: string
): Promise<ChatSession[]> {
  const { data, error } = await client
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false });
  if (error) return [];
  return data as ChatSession[];
}

export async function getChatSessionByNumber(
  client: SupabaseClient,
  dashboardId: string,
  profileId: string,
  sessionNumber: number
): Promise<ChatSession | null> {
  const { data, error } = await client
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .eq("session_number", sessionNumber)
    .single();
  if (error) return null;
  return data as ChatSession;
}

/** Session by id, only when `profileId` owns it. Use `requireOwnedSession` in API routes. */
export async function getOwnedChatSession(
  client: SupabaseClient,
  sessionId: string,
  profileId: string
): Promise<ChatSession | null> {
  const { data, error } = await client
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) return null;
  return data as ChatSession | null;
}

export async function createChatSession(
  client: SupabaseClient,
  dashboardId: string,
  profileId: string
): Promise<ChatSession | null> {
  const { data: existing } = await client
    .from("chat_sessions")
    .select("session_number")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false })
    .limit(1);

  const nextNumber =
    existing && existing.length > 0 ? existing[0].session_number + 1 : 1;

  const { data, error } = await client
    .from("chat_sessions")
    .insert({ dashboard_id: dashboardId, profile_id: profileId, session_number: nextNumber, title: "New Chat" })
    .select()
    .single();

  if (error) return null;
  return data as ChatSession;
}

export async function getOrCreateLatestSession(
  client: SupabaseClient,
  dashboardId: string,
  profileId: string
): Promise<ChatSession | null> {
  const { data } = await client
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false })
    .limit(1)
    .single();

  if (data) return data as ChatSession;
  return createChatSession(client, dashboardId, profileId);
}

/** `chat_messages` columns read by the chat UI. */
interface ChatMessageRow {
  id: string;
  role: ChatMessage["role"];
  content: string;
  metadata: ChatMessage["metadata"];
  created_at: string;
  reaction: ChatMessage["reaction"];
  feedback: string | null;
  tool_calls: MessagePart[] | null;
}

function toChatMessage(row: ChatMessageRow, { withParts }: { withParts: boolean }): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.created_at,
    reaction: row.reaction ?? null,
    feedback: row.feedback ?? null,
    ...(withParts ? { parts: row.tool_calls ?? undefined } : {}),
  };
}

export async function getChatHistoryBySession(
  client: SupabaseClient,
  sessionId: string
): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data as ChatMessageRow[]).map((row) => toChatMessage(row, { withParts: true }));
}

/** Appends a message to `session`. Callers must load the session with ownership checked. */
export async function saveChatMessageToSession(
  client: SupabaseClient,
  session: Pick<ChatSession, "id" | "dashboard_id" | "profile_id">,
  role: "user" | "assistant",
  content: string,
  parts?: MessagePart[]
): Promise<string | null> {
  // Only persist parts when they contain at least one tool call (otherwise content alone is sufficient)
  const hasToolCalls = parts?.some((p) => p.type === "tool_call");
  const { data, error } = await client.from("chat_messages").insert({
    session_id: session.id,
    dashboard_id: session.dashboard_id,
    profile_id: session.profile_id,
    role,
    content,
    tool_calls: hasToolCalls ? parts : null,
  }).select("id").single();
  if (error) return null;
  return data.id;
}

export async function toggleSessionSharing(
  client: SupabaseClient,
  sessionId: string,
  isShared: boolean
): Promise<string | null> {
  const { data, error } = await client
    .from("chat_sessions")
    .update({ is_shared: isShared, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select("share_token")
    .single();
  if (error) return null;
  return data.share_token;
}

/**
 * Read-only shared session for `/share/[token]`. RLS lets any signed-in viewer read
 * sessions with `is_shared = true`. Tool-call parts are intentionally omitted.
 */
export async function getSharedChatByToken(
  client: SupabaseClient,
  token: string
): Promise<{ session: ChatSession; dashboard: Dashboard; messages: ChatMessage[] } | null> {
  const { data: session } = await client
    .from("chat_sessions")
    .select("*")
    .eq("share_token", token)
    .eq("is_shared", true)
    .single();
  if (!session) return null;

  const { data: dashboard } = await client
    .from("dashboards")
    .select("*")
    .eq("id", session.dashboard_id)
    .single();
  if (!dashboard) return null;

  const { data: messages } = await client
    .from("chat_messages")
    .select("*")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  return {
    session: session as ChatSession,
    dashboard: dashboard as Dashboard,
    messages: ((messages ?? []) as ChatMessageRow[]).map((row) =>
      toChatMessage(row, { withParts: false })
    ),
  };
}

export async function updateSessionTitle(
  client: SupabaseClient,
  sessionId: string,
  title: string
): Promise<void> {
  await client
    .from("chat_sessions")
    .update({ title: title.slice(0, 60), updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

/** Returns `false` when no message matched (missing or not owned by `profileId`), `null` on error. */
export async function saveMessageReaction(
  client: SupabaseClient,
  messageId: string,
  profileId: string,
  reaction: "liked" | "disliked",
  feedback?: string
): Promise<boolean | null> {
  const { data, error } = await client
    .from("chat_messages")
    .update({ reaction, feedback: feedback ?? null })
    .eq("id", messageId)
    .eq("profile_id", profileId)
    .select("id");
  if (error) return null;
  return data.length > 0;
}

// ── Dashboard Tables ───────────────────────────────────────

export async function getDashboardTables(client: SupabaseClient, dashboardId: string) {
  const { data, error } = await client
    .from("dashboard_tables")
    .select("table_name, row_count, description, notes")
    .eq("dashboard_id", dashboardId);

  if (error) {
    console.error("Error fetching dashboard tables:", error.message);
    return [];
  }
  return data;
}
