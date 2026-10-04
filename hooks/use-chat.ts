"use client";

import { useState, useCallback } from "react";
import { finalizeParts, findOpenToolCallIndex, normalizeStreamText } from "@/lib/chat-parts";
import type { ChatMessage, ChatRequest, MessagePart, ToolCall } from "@/lib/types";

export function useChat(initialMessages: ChatMessage[] = []) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (request: ChatRequest) => {
      setError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: request.message,
        createdAt: new Date().toISOString(),
      };

      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      let finalContent = "";
      let parts: MessagePart[] = [];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(errData.error ?? "Request failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedContent = "";  // full raw text across all segments — used for finalContent
        let segmentContent = "";   // raw text for the current segment between tool calls
        let streamDone = false;
        let savedMessageId: string | null = null; // set by the server's final "saved" chunk

        // Smooth display: drain received chars to screen at a controlled rate
        const CHARS_PER_FRAME = 30;
        let displayedSegLen = 0; // chars of segmentContent currently shown
        let rafId: number | null = null;

        const doDisplay = () => {
          rafId = null;
          if (displayedSegLen >= segmentContent.length) return;
          displayedSegLen = Math.min(displayedSegLen + CHARS_PER_FRAME, segmentContent.length);
          const rawSeg = segmentContent.slice(0, displayedSegLen);
          const rawFull = streamedContent.slice(0, streamedContent.length - segmentContent.length + displayedSegLen);
          const displaySeg = rawSeg.replace(/\\n/g, "\n");
          const displayFull = rawFull.replace(/\\n/g, "\n").trim();
          const displayParts = parts.map((p, i) =>
            i === parts.length - 1 && p.type === "text"
              ? { type: "text" as const, content: displaySeg }
              : p
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: displayFull, parts: displayParts, isStreaming: true, thinkingState: null }
                : m
            )
          );
          if (displayedSegLen < segmentContent.length) {
            rafId = requestAnimationFrame(doDisplay);
          }
        };

        const scheduleDisplay = () => {
          if (rafId === null) rafId = requestAnimationFrame(doDisplay);
        };

        const flushDisplay = () => {
          if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
          displayedSegLen = segmentContent.length;
        };

        /** Persist the current text segment into `parts` (display RAF only updates React state). */
        const commitSegmentToParts = () => {
          if (!segmentContent) return;
          const text = segmentContent.replace(/\\n/g, "\n");
          const lastPart = parts[parts.length - 1];
          if (lastPart?.type === "text") {
            parts = [...parts.slice(0, -1), { type: "text", content: text }];
          } else {
            parts = [...parts, { type: "text", content: text }];
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.replace(/\}\}\s+\{/g, "}}\n{").split("\n");
          buffer = chunks.pop() ?? "";

          for (const raw of chunks) {
            try {
              const chunk = JSON.parse(raw) as {
                type: string;
                content?: string;
                metadata?: { nodeName?: string };
                tool?: string;
                input?: Record<string, unknown>;
                output?: string;
                isError?: boolean;
                message?: string;
                messageId?: string;
              };

              // "saved" arrives after an "error" too (partial replies are persisted)
              if (chunk.type === "saved" && chunk.messageId) {
                savedMessageId = chunk.messageId;
                continue;
              }
              if (streamDone) continue;

              if (chunk.type === "tool_start" && chunk.tool) {
                flushDisplay();
                commitSegmentToParts();
                const newToolCall: ToolCall = { tool: chunk.tool, input: chunk.input ?? {} };
                parts = [...parts, { type: "tool_call", toolCall: newToolCall }];
                segmentContent = "";
                displayedSegLen = 0;
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, parts } : m)
                );

              } else if (chunk.type === "tool_end" && chunk.tool) {
                const realIdx = findOpenToolCallIndex(parts, chunk.tool);
                const existing = realIdx >= 0 ? parts[realIdx] : undefined;
                if (existing?.type === "tool_call") {
                  parts = [
                    ...parts.slice(0, realIdx),
                    {
                      type: "tool_call",
                      toolCall: {
                        ...existing.toolCall,
                        output: chunk.output ?? (chunk.isError ? "Tool failed" : ""),
                        isError: chunk.isError || undefined,
                      },
                    },
                    ...parts.slice(realIdx + 1),
                  ];
                }
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, parts, thinkingState: null } : m)
                );

              } else if (chunk.type === "begin") {
                const nodeName = chunk.metadata?.nodeName ?? "";
                const newState = nodeName.toLowerCase().includes("bigquery") || nodeName.toLowerCase().includes("sql")
                  ? "querying"
                  : "thinking";
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, thinkingState: newState } : m)
                );

              } else if (chunk.type === "item" && chunk.content) {
                segmentContent += chunk.content;
                streamedContent += chunk.content;

                const lastPart = parts[parts.length - 1];
                if (lastPart?.type !== "text") {
                  parts = [...parts, { type: "text", content: "" }];
                }
                scheduleDisplay();

              } else if (chunk.type === "error") {
                streamDone = true;
                flushDisplay();
                commitSegmentToParts();
                parts = finalizeParts(parts);
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: normalizeStreamText(streamedContent),
                          parts,
                          isStreaming: false,
                          hasError: true,
                          errorMessage: chunk.message,
                        }
                      : m
                  )
                );
              }
            } catch { /* incomplete JSON chunk, skip */ }
          }
        }

        flushDisplay();
        commitSegmentToParts();
        finalContent = normalizeStreamText(streamedContent);
        parts = finalizeParts(parts);

        // The server persists the reply; swap the temp id for the stored one so reactions target it.
        const finalId = savedMessageId ?? assistantId;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, id: finalId, content: finalContent, parts, isStreaming: false } : m
          )
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "⚠️ Something went wrong. Please try again.", isStreaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearMessages };
}