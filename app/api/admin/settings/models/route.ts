import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminGetSetting, adminUpsertSetting } from "@/lib/supabase/admin-queries";
import { encryptSecret, isEncryptionConfigured } from "@/lib/secrets/credentials-crypto";
import { envDefaultModelForProvider, envModelProvider } from "@/lib/env";
import {
  MODEL_PROVIDERS,
  ModelProvider,
  isValidModelForProvider,
  parseModelProvider,
} from "@/lib/application/llm/model-names";
import {
  getEncryptedLlmApiKeyBlobForProvider,
  llmApiKeyAppSettingKey,
} from "@/lib/application/runtime/llm-api-key-from-settings";
import {
  getStoredModelForProvider,
  llmModelAppSettingKey,
} from "@/lib/application/runtime/llm-model-from-settings";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const saveSchema = z
  .object({
    provider: z.enum(["anthropic", "openai", "openrouter"]),
    anthropic_model: z.string().optional(),
    openai_model: z.string().optional(),
    openrouter_model: z.string().optional(),
    /** @deprecated Prefer <provider>_api_key so every provider can be configured at once. */
    api_key: z.string().optional(),
    anthropic_api_key: z.string().optional(),
    openai_api_key: z.string().optional(),
    openrouter_api_key: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const modelField: Record<ModelProvider, "anthropic_model" | "openai_model" | "openrouter_model"> = {
      [ModelProvider.Anthropic]: "anthropic_model",
      [ModelProvider.OpenAI]: "openai_model",
      [ModelProvider.OpenRouter]: "openrouter_model",
    };
    const activeField = modelField[parseModelProvider(data.provider)];
    if (!data[activeField]?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A model is required for the active provider",
        path: [activeField],
      });
    }

    for (const provider of MODEL_PROVIDERS) {
      const field = modelField[provider];
      const value = data[field]?.trim();
      if (value && !isValidModelForProvider(provider, value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Model must be a valid ${provider} model id`,
          path: [field],
        });
      }
    }
  });

export async function GET() {
  try {
    await requireAdmin();
    const providerRaw = await adminGetSetting("ai_provider");
    const providerEnum = parseModelProvider(providerRaw, envModelProvider());

    const models = Object.fromEntries(
      await Promise.all(
        MODEL_PROVIDERS.map(async (p) => [p, await getStoredModelForProvider(p)] as const)
      )
    ) as Record<ModelProvider, string | null>;
    const hasKeys = Object.fromEntries(
      await Promise.all(
        MODEL_PROVIDERS.map(
          async (p) => [p, Boolean(await getEncryptedLlmApiKeyBlobForProvider(p))] as const
        )
      )
    ) as Record<ModelProvider, boolean>;

    const activeModel = models[providerEnum] ?? envDefaultModelForProvider(providerEnum) ?? "";

    return NextResponse.json({
      provider: providerRaw ?? envModelProvider() ?? "anthropic",
      model: activeModel,
      anthropic_model: models[ModelProvider.Anthropic] ?? "",
      openai_model: models[ModelProvider.OpenAI] ?? "",
      openrouter_model: models[ModelProvider.OpenRouter] ?? "",
      has_api_key_stored: hasKeys[providerEnum],
      has_anthropic_api_key_stored: hasKeys[ModelProvider.Anthropic],
      has_openai_api_key_stored: hasKeys[ModelProvider.OpenAI],
      has_openrouter_api_key_stored: hasKeys[ModelProvider.OpenRouter],
    });
  } catch (e) {
    return handleRouteError(e, "Failed to load model settings");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = saveSchema.parse(await req.json());

    await adminUpsertSetting("ai_provider", body.provider);
    if (body.anthropic_model?.trim()) {
      await adminUpsertSetting(
        llmModelAppSettingKey(ModelProvider.Anthropic),
        body.anthropic_model.trim()
      );
    }
    if (body.openai_model?.trim()) {
      await adminUpsertSetting(llmModelAppSettingKey(ModelProvider.OpenAI), body.openai_model.trim());
    }
    if (body.openrouter_model?.trim()) {
      await adminUpsertSetting(
        llmModelAppSettingKey(ModelProvider.OpenRouter),
        body.openrouter_model.trim()
      );
    }

    const keyAnth = body.anthropic_api_key?.trim();
    const keyOpen = body.openai_api_key?.trim();
    const keyOpenRouter = body.openrouter_api_key?.trim();
    const keyLegacy = body.api_key?.trim();
    const needsEncryption = Boolean(keyAnth || keyOpen || keyOpenRouter || keyLegacy);

    if (needsEncryption && !isEncryptionConfigured()) {
      return jsonError(
        "SETTINGS_ENCRYPTION_KEY is not set (min 16 chars). Required to store API keys.",
        400
      );
    }

    if (keyAnth) {
      await adminUpsertSetting("anthropic_api_key_encrypted", encryptSecret(keyAnth));
    }
    if (keyOpen) {
      await adminUpsertSetting("openai_api_key_encrypted", encryptSecret(keyOpen));
    }
    if (keyOpenRouter) {
      await adminUpsertSetting("openrouter_api_key_encrypted", encryptSecret(keyOpenRouter));
    }
    if (keyLegacy && !keyAnth && !keyOpen && !keyOpenRouter) {
      await adminUpsertSetting(
        llmApiKeyAppSettingKey(parseModelProvider(body.provider)),
        encryptSecret(keyLegacy)
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to save model settings");
  }
}
