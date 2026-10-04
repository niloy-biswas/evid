import type { Dashboard } from "@/lib/types";
import {
  adminDecryptDataSourceCredentials,
  adminGetDataSourceFullOptional,
  adminGetDefaultBigQueryDataSourceOptional,
  adminGetSetting,
  type DataSourceRow,
} from "@/lib/supabase/admin-queries";
import {
  envBigQueryFallback,
  envBigQueryLocation,
  envDefaultModelForProvider,
  envModelProvider,
} from "@/lib/env";
import {
  AnthropicModel,
  ModelProvider,
  OPENAI_MODEL_CHOICES,
  OPENROUTER_MODEL_CHOICES,
  parseModelProvider,
} from "../llm/model-names";
import { resolveLlmApiKey } from "./llm-api-key-from-settings";
import { getStoredModelForProvider } from "./llm-model-from-settings";

export interface ResolvedChatRuntime {
  llm: {
    provider: ModelProvider;
    apiKey: string;
    defaultModel: string;
  };
  bigQuery: {
    projectId: string;
    location: string;
    credentialsJson: string;
  };
}

/** Env default model, then the first seed choice for the provider. */
function defaultModelForProvider(provider: ModelProvider): string {
  const fromEnv = envDefaultModelForProvider(provider);
  if (fromEnv !== undefined) return fromEnv;
  switch (provider) {
    case ModelProvider.Anthropic:
      return AnthropicModel.Sonnet4_6;
    case ModelProvider.OpenAI:
      return OPENAI_MODEL_CHOICES[0]!.value;
    case ModelProvider.OpenRouter:
      return OPENROUTER_MODEL_CHOICES[0]!.value;
  }
}

function noApiKeyErrorForProvider(provider: ModelProvider): string {
  switch (provider) {
    case ModelProvider.Anthropic:
      return "No Anthropic API key configured (Admin → Models or ANTHROPIC_API_KEY)";
    case ModelProvider.OpenAI:
      return "No OpenAI API key configured (Admin → Models or OPENAI_API_KEY)";
    case ModelProvider.OpenRouter:
      return "No OpenRouter API key configured (Admin → Models or OPENROUTER_API_KEY)";
  }
}

async function resolveBigQueryFromAdmin(dashboard: Dashboard): Promise<{
  projectId: string;
  location: string;
  credentialsJson: string;
} | null> {
  let ds: DataSourceRow | null = null;

  if (dashboard.data_source_id) {
    ds = await adminGetDataSourceFullOptional(dashboard.data_source_id);
    if (!ds) {
      throw new Error(
        "Dashboard data source could not be loaded. Ensure SUPABASE_SERVICE_ROLE_KEY is set and the source still exists."
      );
    }
    if (ds.type !== "bigquery") {
      throw new Error(`Dashboard data source "${ds.label}" is not a BigQuery source.`);
    }
  } else {
    // Prefer the admin-connected source over env when the dashboard has none assigned.
    ds = await adminGetDefaultBigQueryDataSourceOptional();
  }

  if (!ds) return null;

  return {
    projectId: ds.project_id,
    location: ds.location,
    credentialsJson: adminDecryptDataSourceCredentials(ds),
  };
}

export async function resolveChatRuntime(dashboard: Dashboard): Promise<ResolvedChatRuntime> {
  const ai_provider = await adminGetSetting("ai_provider");
  const provider = parseModelProvider(ai_provider, envModelProvider());
  const ai_model = await getStoredModelForProvider(provider);

  const apiKey = await resolveLlmApiKey(provider);

  const defaultModel = ai_model ?? defaultModelForProvider(provider);

  if (!apiKey) {
    throw new Error(noApiKeyErrorForProvider(provider));
  }

  const fromAdmin = await resolveBigQueryFromAdmin(dashboard);
  const fromEnv = envBigQueryFallback();
  const credentialsJson = fromAdmin?.credentialsJson ?? fromEnv.credentialsJson;
  const projectId = fromAdmin?.projectId ?? fromEnv.projectId;
  const location = fromAdmin?.location ?? envBigQueryLocation();

  if (!projectId) {
    throw new Error(
      "No BigQuery project configured. Assign a data source on the dashboard (Admin → Data sources) or set BIGQUERY_PROJECT."
    );
  }

  if (!credentialsJson) {
    throw new Error(
      "No BigQuery credentials available. Add a Connected source in Admin (or set GOOGLE_APPLICATION_CREDENTIALS_JSON)."
    );
  }

  return {
    llm: {
      provider,
      apiKey,
      defaultModel,
    },
    bigQuery: {
      projectId,
      location,
      credentialsJson,
    },
  };
}
