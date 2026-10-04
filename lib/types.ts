// ── Shared enums ───────────────────────────────────────────

export type UserRole = "user" | "editor" | "admin";

export type DashboardStatus = "draft" | "published" | "archived";

// ── Database entities ──────────────────────────────────────

export interface Dashboard {
  id: string;
  dashboard_id: string;
  dashboard_name: string;
  vertical: string;
  purpose: string | null;
  link: string | null;
  refresh_window: string | null;
  description: string | null;
  available_metrics: string[] | null;
  available_filters: string[] | null;
  /** Legacy column removed after admin migration — omit when absent */
  is_active?: boolean;
  /** After migration `001_admin_workspace`; absent on legacy rows until migrated */
  status?: DashboardStatus;
  business_rules?: string | null;
  caveats?: string | null;
  custom_instructions?: string | null;
  example_questions?: string[] | null;
  published_at?: string | null;
  published_by?: string | null;
  data_source_id?: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  user_role?: UserRole;
  avatar_url: string | null;
}

// ── Chat wire types ────────────────────────────────────────

export interface ToolCall {
  tool: string;
  input: Record<string, unknown>;
  output?: string;
  /** True when the tool threw or ended with an error payload. */
  isError?: boolean;
}

export type MessagePart =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: ToolCall };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  createdAt: string;
  isStreaming?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  thinkingState?: "thinking" | "querying" | null;
  reaction?: "liked" | "disliked" | null;
  feedback?: string | null;
  toolCalls?: ToolCall[];
  parts?: MessagePart[];
}

export interface ChatSession {
  id: string;
  profile_id: string;
  dashboard_id: string;
  session_number: number;
  title: string;
  is_shared: boolean;
  share_token: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/** Org-wide analytics defaults from Admin → Workspace (`app_settings`). */
export interface WorkspaceAnalytics {
  org_name: string;
  org_about: string;
  timezone: string;
  currency: string;
  language_policy: string;
  business_definitions: string;
  pii_refusal: string;
}

export interface ChatPayload {
  session_id: string | null;
  dashboard_id: string;
  dashboard_number: string;
  dashboard_name: string;
  model?: string;
  history?: HistoryMessage[];
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  message: string;
  description?: string | null;
  business_rules?: string | null;
  caveats?: string | null;
  custom_instructions?: string | null;
  example_questions?: string[] | null;
  context_tables?: {
    table_name: string;
    description: string;
    row_count: string;
    notes: string;
  }[];
  /** Injected server-side from `app_settings` (not sent by the client). */
  workspace?: WorkspaceAnalytics;
}
