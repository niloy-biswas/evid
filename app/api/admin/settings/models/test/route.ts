import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { handleRouteError, jsonError } from "@/lib/api/route-response";
import {
  isValidModelForProvider,
  parseModelProvider,
} from "@/lib/application/llm/model-names";
import { resolveLlmApiKey } from "@/lib/application/runtime/llm-api-key-from-settings";
import { testLlmConnection } from "@/lib/admin/test-connections";

const schema = z.object({
  provider: z.enum(["anthropic", "openai", "openrouter"]),
  model: z.string().min(1),
  /** @deprecated Use <provider>_api_key for the matching provider. */
  api_key: z.string().optional(),
  anthropic_api_key: z.string().optional(),
  openai_api_key: z.string().optional(),
  openrouter_api_key: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = schema.parse(await req.json());
    const provider = parseModelProvider(body.provider);

    if (!isValidModelForProvider(provider, body.model)) {
      return jsonError("Invalid model for provider", 400);
    }

    const apiKey = await resolveLlmApiKey(
      provider,
      body[`${provider}_api_key`]?.trim() || body.api_key
    );
    if (!apiKey) {
      return jsonError("No API key available to test", 400);
    }

    await testLlmConnection(provider, apiKey, body.model);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Test failed", { exposeMessage: true });
  }
}
