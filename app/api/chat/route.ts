import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnedSession, requireSignedIn } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { handleRouteError, jsonError } from "@/lib/api/route-response";
import {
  saveChatMessageToSession,
  updateSessionTitle,
  getDashboardTables,
  getChatHistoryBySession,
  getPublishedDashboardById,
} from "@/lib/supabase/queries";
import { streamAgentResponse } from "@/lib/application/orchestrators/chat-orchestrator";
import { resolveChatRuntime } from "@/lib/application/runtime/resolve-chat-runtime";
import { resolveWorkspaceAnalytics, toWorkspaceAnalytics } from "@/lib/application/runtime/workspace-analytics";
import type { ChatPayload, HistoryMessage, MessagePart } from "@/lib/types";

// Extract SQL queries from stored parts (Option C: tool inputs only, no results)
function buildHistoryContent(content: string, parts?: MessagePart[]): string {
  if (!parts) return content;

  const queries: string[] = [];
  for (const part of parts) {
    if (part.type !== "tool_call" || part.toolCall.tool !== "execute_query") continue;
    const input = part.toolCall.input;
    // Unwrap LangGraph's nested {input: '{"query":"..."}'} format
    let query: unknown = input.query;
    if (!query && typeof input.input === "string") {
      try { query = JSON.parse(input.input as string).query; } catch { /* skip */ }
    }
    if (typeof query === "string") {
      queries.push(query.replace(/\\n/g, "\n").trim());
    }
  }

  if (queries.length === 0) return content;
  const sqlNote = queries.map((q) => `\`\`\`sql\n${q}\n\`\`\``).join("\n");
  return `${content}\n\n[SQL queries used in this response]\n${sqlNote}`;
}

// Only the session and the message come from the client. User, dashboard and model are resolved
// server-side so a caller cannot write into another user's session or pick an arbitrary model.
const chatRequestSchema = z.object({
  session_id: z.string().uuid(),
  message: z.string().trim().min(1, "Message cannot be empty"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, profile } = await requireSignedIn();
    const body = chatRequestSchema.parse(await req.json());
    const supabase = await createClient();

    const session = await requireOwnedSession(supabase, body.session_id, userId);
    const dashboard = await getPublishedDashboardById(supabase, session.dashboard_id);
    if (!dashboard) {
      return jsonError("Dashboard not found or not published", 404);
    }

    const payload: ChatPayload = {
      session_id: session.id,
      dashboard_id: dashboard.id,
      dashboard_number: dashboard.dashboard_id,
      dashboard_name: dashboard.dashboard_name,
      user: { id: profile.id, name: profile.name, email: profile.email, role: profile.role },
      message: body.message,
      description: dashboard.description,
      business_rules: dashboard.business_rules ?? null,
      caveats: dashboard.caveats ?? null,
      custom_instructions: dashboard.custom_instructions ?? null,
      example_questions: dashboard.example_questions ?? null,
    };

    // Save user message to session
    await saveChatMessageToSession(supabase, session, "user", payload.message);

    // Auto-title session from first user message only
    const existing = await getChatHistoryBySession(supabase, session.id);
    if (existing.length === 1) {
      await updateSessionTitle(supabase, session.id, payload.message);
    }

    // Build history for agent context — all messages except the current one (last)
    // Assistant messages include SQL queries used (Option C: inputs only, no results)
    const HISTORY_LIMIT = 14; // max combined user + assistant messages sent as context
    if (existing.length > 1) {
      payload.history = existing.slice(-HISTORY_LIMIT - 1, -1).map((msg): HistoryMessage => ({
        role: msg.role,
        content: msg.role === "assistant"
          ? buildHistoryContent(msg.content, msg.parts)
          : msg.content,
      }));
    }

    // Fetch and inject dashboard tables context
    const contextTables = await getDashboardTables(supabase, dashboard.dashboard_id);
    if (contextTables && contextTables.length > 0) {
      payload.context_tables = contextTables.map((t) => ({
        table_name: t.table_name,
        description: t.description,
        row_count: t.row_count,
        notes: t.notes,
      }));
    }

    const workspace = await resolveWorkspaceAnalytics();
    payload.workspace = toWorkspaceAnalytics(workspace);

    let runtime;
    try {
      runtime = await resolveChatRuntime(dashboard);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to resolve LLM / data connection";
      console.error("resolveChatRuntime:", err);
      return jsonError(msg, 500);
    }

    // The reply is persisted server-side when the stream finishes, into the session checked above.
    const stream = await streamAgentResponse(payload, runtime, {
      saveReply: ({ content, parts }) =>
        saveChatMessageToSession(supabase, session, "assistant", content, parts),
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return handleRouteError(e, "Internal server error");
  }
}
