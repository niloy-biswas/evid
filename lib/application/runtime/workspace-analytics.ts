import { adminGetSetting } from "@/lib/supabase/admin-queries";
import type { WorkspaceAnalytics } from "@/lib/types";

/** `app_settings` keys for org-wide analytics prompt defaults. */
export const WORKSPACE_ANALYTICS_KEYS = {
  orgName: "analytics_org_name",
  orgAbout: "analytics_org_about",
  timezone: "analytics_timezone",
  currency: "analytics_currency",
  languagePolicy: "analytics_language_policy",
  businessDefinitions: "analytics_business_definitions",
  piiRefusal: "analytics_pii_refusal",
} as const;

export const WORKSPACE_ANALYTICS_DEFAULTS = {
  orgName: "",
  orgAbout: "",
  timezone: "UTC",
  currency: "",
  languagePolicy:
    "Respond in the same language the user writes in. Default to English if unclear.",
  businessDefinitions: "",
  piiRefusal:
    "I can't share raw user-level contact data. Please contact your data team.",
} as const;

export interface WorkspaceAnalyticsDefaults {
  orgName: string;
  orgAbout: string;
  timezone: string;
  currency: string;
  languagePolicy: string;
  businessDefinitions: string;
  piiRefusal: string;
}

async function readOrDefault(key: string, fallback: string): Promise<string> {
  const fromDb = await adminGetSetting(key);
  if (fromDb == null) return fallback;
  return fromDb;
}

/** Wire shape for Admin API + ChatPayload.workspace. */
export function toWorkspaceAnalytics(w: WorkspaceAnalyticsDefaults): WorkspaceAnalytics {
  return {
    org_name: w.orgName,
    org_about: w.orgAbout,
    timezone: w.timezone,
    currency: w.currency,
    language_policy: w.languagePolicy,
    business_definitions: w.businessDefinitions,
    pii_refusal: w.piiRefusal,
  };
}

/** Resolve org analytics defaults from `app_settings` (empty strings allowed). */
export async function resolveWorkspaceAnalytics(): Promise<WorkspaceAnalyticsDefaults> {
  const [orgName, orgAbout, timezone, currency, languagePolicy, businessDefinitions, piiRefusal] =
    await Promise.all([
      readOrDefault(WORKSPACE_ANALYTICS_KEYS.orgName, WORKSPACE_ANALYTICS_DEFAULTS.orgName),
      readOrDefault(WORKSPACE_ANALYTICS_KEYS.orgAbout, WORKSPACE_ANALYTICS_DEFAULTS.orgAbout),
      readOrDefault(WORKSPACE_ANALYTICS_KEYS.timezone, WORKSPACE_ANALYTICS_DEFAULTS.timezone),
      readOrDefault(WORKSPACE_ANALYTICS_KEYS.currency, WORKSPACE_ANALYTICS_DEFAULTS.currency),
      readOrDefault(
        WORKSPACE_ANALYTICS_KEYS.languagePolicy,
        WORKSPACE_ANALYTICS_DEFAULTS.languagePolicy
      ),
      readOrDefault(
        WORKSPACE_ANALYTICS_KEYS.businessDefinitions,
        WORKSPACE_ANALYTICS_DEFAULTS.businessDefinitions
      ),
      readOrDefault(WORKSPACE_ANALYTICS_KEYS.piiRefusal, WORKSPACE_ANALYTICS_DEFAULTS.piiRefusal),
    ]);

  return {
    orgName: orgName.trim(),
    orgAbout: orgAbout.trim(),
    timezone: timezone.trim() || WORKSPACE_ANALYTICS_DEFAULTS.timezone,
    currency: currency.trim(),
    languagePolicy: languagePolicy.trim() || WORKSPACE_ANALYTICS_DEFAULTS.languagePolicy,
    businessDefinitions: businessDefinitions.trim(),
    piiRefusal: piiRefusal.trim() || WORKSPACE_ANALYTICS_DEFAULTS.piiRefusal,
  };
}
