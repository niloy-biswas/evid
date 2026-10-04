import { BigQuery } from "@google-cloud/bigquery";
import { ModelProvider } from "@/lib/application/llm/model-names";
import { envBigQueryLocation } from "@/lib/env";
import { ANTHROPIC_API_VERSION, upstreamErrorMessage } from "./provider-models";

/** App-supported OpenAI models are GPT-5.x (reasoning); chat completions use `max_completion_tokens`, not `max_tokens`. */
async function openAiChatPing(model: string, apiKey: string): Promise<void> {
  await chatCompletionsPing("https://api.openai.com/v1/chat/completions", model, apiKey, {
    max_completion_tokens: 16,
  });
}

/** OpenRouter proxies many vendors behind one OpenAI-compatible endpoint. */
async function openRouterChatPing(model: string, apiKey: string): Promise<void> {
  await chatCompletionsPing("https://openrouter.ai/api/v1/chat/completions", model, apiKey, {
    max_tokens: 16,
  });
}

async function chatCompletionsPing(
  url: string,
  model: string,
  apiKey: string,
  extra: Record<string, unknown>
): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      ...extra,
      messages: [{ role: "user" as const, content: "ping" }],
    }),
  });
  const text = await res.text();
  if (res.ok) return;
  throw new Error(upstreamErrorMessage(text));
}

export async function testBigQueryConnection(opts: {
  projectId: string;
  credentialsJson?: string;
  location?: string;
}): Promise<void> {
  const location = opts.location ?? envBigQueryLocation();
  let credentials: Record<string, unknown> | undefined;
  if (opts.credentialsJson) {
    try {
      credentials = JSON.parse(opts.credentialsJson) as Record<string, unknown>;
    } catch {
      throw new Error("Invalid service account JSON");
    }
  }
  const bq = new BigQuery({
    projectId: opts.projectId,
    location,
    credentials,
  });
  await bq.query({ query: "SELECT 1 AS ok", location });
}

export async function testLlmConnection(
  provider: ModelProvider,
  apiKey: string,
  model: string
): Promise<void> {
  if (provider === ModelProvider.Anthropic) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_API_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    if (!res.ok) {
      throw new Error(upstreamErrorMessage(await res.text()));
    }
    return;
  }

  if (provider === ModelProvider.OpenRouter) {
    await openRouterChatPing(model, apiKey);
    return;
  }

  await openAiChatPing(model, apiKey);
}
