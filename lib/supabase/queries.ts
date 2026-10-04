import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Dashboard, Profile, ChatMessage, ChatSession, MessagePart } from "@/lib/types";

// Anon client for DB queries — all tables use permissive RLS (USING true)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getDashboards(): Promise<Dashboard[]> {
  const { data, error } = await supabase
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

export async function getPublishedDashboardById(id: string): Promise<Dashboard | null> {
  const { data, error } = await supabase
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
export async function getPublishedDashboardByAnyId(id: string): Promise<Dashboard | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const col = isUuid ? "id" : "dashboard_id";
  const { data, error } = await supabase
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

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  if (error) return null;
  return data as Profile;
}

// ── Chat Sessions ──────────────────────────────────────────

export async function getChatSessions(
  dashboardId: string,
  profileId: string
): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false });
  if (error) return [];
  return data as ChatSession[];
}

export async function getChatSessionByNumber(
  dashboardId: string,
  profileId: string,
  sessionNumber: number
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .eq("session_number", sessionNumber)
    .single();
  if (error) return null;
  return data as ChatSession;
}

export async function createChatSession(
  dashboardId: string,
  profileId: string
): Promise<ChatSession | null> {
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("session_number")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false })
    .limit(1);

  const nextNumber =
    existing && existing.length > 0 ? existing[0].session_number + 1 : 1;

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ dashboard_id: dashboardId, profile_id: profileId, session_number: nextNumber, title: "New Chat" })
    .select()
    .single();

  if (error) return null;
  return data as ChatSession;
}

export async function getOrCreateLatestSession(
  dashboardId: string,
  profileId: string
): Promise<ChatSession | null> {
  const { data } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("dashboard_id", dashboardId)
    .eq("profile_id", profileId)
    .order("session_number", { ascending: false })
    .limit(1)
    .single();

  if (data) return data as ChatSession;
  return createChatSession(dashboardId, profileId);
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

export async function getChatHistoryBySession(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data as ChatMessageRow[]).map((row) => toChatMessage(row, { withParts: true }));
}

export async function saveChatMessageToSession(
  sessionId: string,
  dashboardId: string,
  profileId: string,
  role: "user" | "assistant",
  content: string,
  metadata?: Record<string, any>,
  parts?: MessagePart[]
): Promise<string | null> {
  // Only persist parts when they contain at least one tool call (otherwise content alone is sufficient)
  const hasToolCalls = parts?.some((p) => p.type === "tool_call");
  const { data, error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    dashboard_id: dashboardId,
    profile_id: profileId,
    role,
    content,
    metadata,
    tool_calls: hasToolCalls ? parts : null,
  }).select("id").single();
  if (error) return null;
  return data.id;
}

export async function toggleSessionSharing(sessionId: string, isShared: boolean): Promise<string | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .update({ is_shared: isShared, updated_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select("share_token")
    .single();
  if (error) return null;
  return data.share_token;
}

/**
 * Read-only shared session for `/share/[token]`. Takes the caller's server client (not the anon
 * client above) so RLS sees the logged-in viewer. Tool-call parts are intentionally omitted.
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

export async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
  await supabase
    .from("chat_sessions")
    .update({ title: title.slice(0, 60), updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function saveMessageReaction(
  messageId: string,
  reaction: "liked" | "disliked",
  feedback?: string
): Promise<boolean> {
  const { error } = await supabase
    .from("chat_messages")
    .update({ reaction, feedback: feedback ?? null })
    .eq("id", messageId);
  return !error;
}

// ── Dashboard Tables ───────────────────────────────────────

export async function getDashboardTables(dashboardId: string) {
  const { data, error } = await supabase
    .from("dashboard_tables")
    .select("table_name, row_count, description, notes")
    .eq("dashboard_id", dashboardId);

  if (error) {
    console.error("Error fetching dashboard tables:", error.message);
    return [];
  }
  return data;
}
