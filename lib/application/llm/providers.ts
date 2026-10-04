import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ModelProvider } from "./model-names";
import type { ResolvedChatRuntime } from "../runtime/resolve-chat-runtime";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Chat model for the resolved runtime. `model` is the per-request override; otherwise the
 * stored/env default from `resolveChatRuntime` (which also guarantees `apiKey`).
 */
export function createLLM(model: string | undefined, runtime: ResolvedChatRuntime["llm"]) {
  const modelId = model ?? runtime.defaultModel;
  const { apiKey } = runtime;

  switch (runtime.provider) {
    case ModelProvider.Anthropic:
      return new ChatAnthropic({ model: modelId, apiKey, streaming: true });
    case ModelProvider.OpenAI:
      return new ChatOpenAI({
        model: modelId,
        apiKey,
        streaming: true,
        // Reasoning models reject function tools on /v1/chat/completions unless reasoning is off.
        // This app always binds BigQuery tools, so disable reasoning effort for OpenAI models.
        reasoning: { effort: "none" },
      });
    case ModelProvider.OpenRouter:
      return new ChatOpenAI({
        model: modelId,
        apiKey,
        streaming: true,
        configuration: { baseURL: OPENROUTER_BASE_URL },
      });
    default:
      throw new Error(
        `Unknown MODEL_PROVIDER: "${runtime.provider}". Must be "anthropic", "openai", or "openrouter".`
      );
  }
}
