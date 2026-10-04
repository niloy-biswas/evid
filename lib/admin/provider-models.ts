import { ModelProvider, MODEL_PROVIDER_LABEL, isOpenAiChatModelId } from "@/lib/application/llm/model-names";

export const ANTHROPIC_API_VERSION = "2023-06-01";

export interface CatalogModel {
  id: string;
  created?: number;
}

/** Upstream provider failure; `status` is what the admin API should return. */
export class ProviderApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ProviderApiError";
  }
}

/** `{ error: { message } }` from Anthropic/OpenAI/OpenRouter error bodies, else the first 400 chars. */
export function upstreamErrorMessage(text: string): string {
  try {
    const j = JSON.parse(text) as { error?: { message?: string } };
    if (typeof j.error?.message === "string") return j.error.message;
  } catch {
    /* not JSON */
  }
  return text.slice(0, 400);
}

const CATALOG_REQUEST: Record<
  ModelProvider,
  (apiKey: string | undefined) => { url: string; headers: Record<string, string> }
> = {
  [ModelProvider.Anthropic]: (apiKey) => ({
    url: "https://api.anthropic.com/v1/models?limit=1000",
    headers: { "x-api-key": apiKey ?? "", "anthropic-version": ANTHROPIC_API_VERSION },
  }),
  [ModelProvider.OpenAI]: (apiKey) => ({
    url: "https://api.openai.com/v1/models",
    headers: { Authorization: `Bearer ${apiKey}` },
  }),
  // OpenRouter's catalog is public — a key isn't required to list models, only to use them.
  [ModelProvider.OpenRouter]: (apiKey) => ({
    url: "https://openrouter.ai/api/v1/models",
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : ({} as Record<string, string>),
  }),
};

type RawModel = { id?: string; created?: number; created_at?: string };

function toCatalogModel(provider: ModelProvider, m: RawModel): CatalogModel {
  const id = typeof m.id === "string" ? m.id : "";
  if (provider === ModelProvider.Anthropic) {
    return {
      id,
      created: typeof m.created_at === "string" ? Date.parse(m.created_at) || undefined : undefined,
    };
  }
  return { id, created: typeof m.created === "number" ? m.created : undefined };
}

/** Live model list for the admin Models page, newest first, then by id. */
export async function listProviderModels(
  provider: ModelProvider,
  apiKey: string | undefined
): Promise<CatalogModel[]> {
  const { url, headers } = CATALOG_REQUEST[provider](apiKey);
  const res = await fetch(url, { headers });
  const text = await res.text();
  if (!res.ok) {
    throw new ProviderApiError(upstreamErrorMessage(text), res.status === 401 ? 401 : 400);
  }

  let data: { data?: RawModel[] };
  try {
    data = JSON.parse(text) as { data?: RawModel[] };
  } catch {
    throw new ProviderApiError(`Invalid response from ${MODEL_PROVIDER_LABEL[provider]} models API`, 502);
  }

  return (data.data ?? [])
    .map((m) => toCatalogModel(provider, m))
    .filter((m) => m.id && (provider !== ModelProvider.OpenAI || isOpenAiChatModelId(m.id)))
    .sort((a, b) => {
      const ca = a.created ?? 0;
      const cb = b.created ?? 0;
      if (cb !== ca) return cb - ca;
      return a.id.localeCompare(b.id);
    });
}
