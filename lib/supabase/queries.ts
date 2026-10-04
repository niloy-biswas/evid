import type { SupabaseClient } from "@supabase/supabase-js";
import type { Dashboard, Profile, ChatMessage, ChatSession, MessagePart, SharedChat } from "@/lib/types";

// Every function takes the caller's server client (`lib/supabase/server.ts`) so RLS sees the
// signed-in user. Never pass the service-role client here.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  const col = UUID_PATTERN.test(id) ? "id" : "dashboard_id";
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

function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    metadata: row.metadata,
    createdAt: row.created_at,
    reaction: row.reaction ?? null,
    feedback: row.feedback ?? null,
    parts: row.tool_calls ?? undefined,
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
  return (data as ChatMessageRow[]).map(toChatMessage);
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

/** `get_shared_chat` result (migration 007). */
interface SharedChatRow {
  session: SharedChat["session"];
  dashboard: SharedChat["dashboard"];
  messages: Pick<ChatMessageRow, "id" | "role" | "content" | "created_at">[];
}

/**
 * Read-only shared session for `/share/[token]`, via the `get_shared_chat` RPC: it matches
 * one token and returns only the fields the view renders (no tool calls, feedback or ids).
 */
export async function getSharedChatByToken(
  client: SupabaseClient,
  token: string
): Promise<SharedChat | null> {
  if (!UUID_PATTERN.test(token)) return null;

  const { data, error } = await client.rpc("get_shared_chat", { p_token: token });
  if (error) {
    console.error("Error fetching shared chat:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as SharedChatRow;
  return {
    session: row.session,
    dashboard: row.dashboard,
    messages: row.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
    })),
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
