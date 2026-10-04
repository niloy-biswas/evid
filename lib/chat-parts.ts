import type { MessagePart } from "@/lib/types";

// Client-safe helpers shared by the streaming UI (`hooks/use-chat.ts`) and the server-side
// reply recorder (`lib/application/orchestrators/chat-orchestrator.ts`), so the stored reply
// matches what the user saw.

const INCOMPLETE_TOOL_OUTPUT = "Tool did not complete successfully.";

/** Model tokens can carry literal `\n` sequences; turn them into newlines and trim. */
export function normalizeStreamText(raw: string): string {
  return raw.replace(/\\n/g, "\n").trim();
}

/** Index of the latest `toolName` call still waiting for its `tool_end`, or -1. */
export function findOpenToolCallIndex(parts: MessagePart[], toolName: string): number {
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (
      part?.type === "tool_call" &&
      part.toolCall.tool === toolName &&
      !part.toolCall.output &&
      !part.toolCall.isError
    ) {
      return i;
    }
  }
  return -1;
}

/** Normalize text parts and mark tools that never received tool_end as errors. */
export function finalizeParts(parts: MessagePart[]): MessagePart[] {
  return parts.map((p) => {
    if (p.type === "text") {
      return { type: "text" as const, content: normalizeStreamText(p.content) };
    }
    if (!p.toolCall.output && !p.toolCall.isError) {
      return {
        type: "tool_call" as const,
        toolCall: {
          ...p.toolCall,
          output: INCOMPLETE_TOOL_OUTPUT,
          isError: true,
        },
      };
    }
    return p;
  });
}
