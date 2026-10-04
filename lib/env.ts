import { ModelProvider } from "@/lib/application/llm/model-names";

/**
 * Server-only env fallbacks that more than one module needs. Admin settings in `app_settings`
 * win over these at runtime; see `.env.example` for what each variable does.
 *
 * Single-owner vars stay with their owner: `SETTINGS_*` (lib/secrets), `SUPABASE_SERVICE_ROLE_KEY`
 * (lib/supabase/admin-client), `ADMIN_EMAIL` (lib/supabase/bootstrap-admin), `OPIK_*`
 * (lib/application/tracing). `NEXT_PUBLIC_*` must be read literally where used so Next can inline them.
 */

export function envModelProvider(): string | undefined {
  return process.env.MODEL_PROVIDER;
}

export function envApiKeyForProvider(provider: ModelProvider): string | undefined {
  switch (provider) {
    case ModelProvider.Anthropic:
      return process.env.ANTHROPIC_API_KEY;
    case ModelProvider.OpenAI:
      return process.env.OPENAI_API_KEY;
    case ModelProvider.OpenRouter:
      return process.env.OPENROUTER_API_KEY;
  }
}

export function envDefaultModelForProvider(provider: ModelProvider): string | undefined {
  switch (provider) {
    case ModelProvider.Anthropic:
      return process.env.ANTHROPIC_DEFAULT_MODEL;
    case ModelProvider.OpenAI:
      return process.env.OPENAI_DEFAULT_MODEL;
    case ModelProvider.OpenRouter:
      return process.env.OPENROUTER_DEFAULT_MODEL;
  }
}

export function envBigQueryLocation(): string {
  return process.env.BIGQUERY_LOCATION ?? "US";
}

/** Used only when a dashboard has no data source and no admin-connected BigQuery source exists. */
export function envBigQueryFallback(): { projectId?: string; credentialsJson?: string } {
  return {
    projectId: process.env.BIGQUERY_PROJECT?.trim(),
    credentialsJson: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON?.trim(),
  };
}

export function envAllowedEmailDomain(): string | undefined {
  return process.env.ALLOWED_EMAIL_DOMAIN;
}
