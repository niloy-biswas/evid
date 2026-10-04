import { decryptSecret } from "@/lib/secrets/credentials-crypto";
import { envApiKeyForProvider } from "@/lib/env";
import { adminGetSetting } from "@/lib/supabase/admin-queries";
import { ModelProvider } from "../llm/model-names";

/**
 * Encrypted blob for the LLM API key for this provider.
 * Anthropic: `anthropic_api_key_encrypted` then legacy `ai_api_key_encrypted`.
 * OpenAI / OpenRouter: their own `<provider>_api_key_encrypted` only (legacy single column
 * may hold the wrong provider's key).
 */
export async function getEncryptedLlmApiKeyBlobForProvider(
  provider: ModelProvider
): Promise<string | null> {
  if (provider === ModelProvider.Anthropic) {
    return (
      (await adminGetSetting("anthropic_api_key_encrypted")) ??
      (await adminGetSetting("ai_api_key_encrypted"))
    );
  }
  return (await adminGetSetting(llmApiKeyAppSettingKey(provider))) ?? null;
}

async function resolveLlmApiKeyFromSettings(
  provider: ModelProvider
): Promise<string | undefined> {
  const enc = await getEncryptedLlmApiKeyBlobForProvider(provider);
  if (!enc) return undefined;
  try {
    return decryptSecret(enc);
  } catch {
    return undefined;
  }
}

export function llmApiKeyAppSettingKey(
  provider: ModelProvider
): "anthropic_api_key_encrypted" | "openai_api_key_encrypted" | "openrouter_api_key_encrypted" {
  switch (provider) {
    case ModelProvider.Anthropic:
      return "anthropic_api_key_encrypted";
    case ModelProvider.OpenAI:
      return "openai_api_key_encrypted";
    case ModelProvider.OpenRouter:
      return "openrouter_api_key_encrypted";
  }
}

/** Pasted key (`override`), then the encrypted key in settings, then the provider's env var. */
export async function resolveLlmApiKey(
  provider: ModelProvider,
  override?: string | null
): Promise<string | undefined> {
  return (
    override?.trim() ||
    (await resolveLlmApiKeyFromSettings(provider)) ||
    envApiKeyForProvider(provider)
  );
}
