import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { handleRouteError, jsonError } from "@/lib/api/route-response";
import { ProviderApiError, listProviderModels } from "@/lib/admin/provider-models";
import {
  MODEL_PROVIDERS,
  MODEL_PROVIDER_LABEL,
  ModelProvider,
} from "@/lib/application/llm/model-names";
import { resolveLlmApiKey } from "@/lib/application/runtime/llm-api-key-from-settings";

/** Client sends the pasted key as `<provider>_api_key`, matching the Models settings form. */
const schema = z.object({
  anthropic_api_key: z.string().optional(),
  openai_api_key: z.string().optional(),
  openrouter_api_key: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ provider: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { provider: raw } = await params;
  const provider = MODEL_PROVIDERS.find((p) => p === raw);
  if (!provider) return jsonError("Not found", 404);
  const label = MODEL_PROVIDER_LABEL[provider];

  try {
    await requireAdmin();
    const body = schema.parse(await req.json().catch(() => ({})));
    const pasted = body[`${provider}_api_key`];

    // OpenRouter lists models without a key, so it never falls back to stored/env keys.
    const apiKey =
      provider === ModelProvider.OpenRouter
        ? pasted?.trim()
        : await resolveLlmApiKey(provider, pasted);

    if (!apiKey && provider !== ModelProvider.OpenRouter) {
      return jsonError(
        `No ${label} API key available. Paste a key or save one in Models settings.`,
        400
      );
    }

    return NextResponse.json({ models: await listProviderModels(provider, apiKey) });
  } catch (e) {
    if (e instanceof ProviderApiError) return jsonError(e.message, e.status);
    return handleRouteError(e, `Failed to refresh ${label} model catalog`);
  }
}
