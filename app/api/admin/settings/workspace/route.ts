import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminUpsertSetting } from "@/lib/supabase/admin-queries";
import {
  WORKSPACE_ANALYTICS_KEYS,
  resolveWorkspaceAnalytics,
  toWorkspaceAnalytics,
} from "@/lib/application/runtime/workspace-analytics";
import { handleRouteError } from "@/lib/api/route-response";

const putSchema = z.object({
  org_name: z.string(),
  org_about: z.string(),
  timezone: z.string().min(1),
  currency: z.string(),
  language_policy: z.string().min(1),
  business_definitions: z.string(),
  pii_refusal: z.string().min(1),
});

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(toWorkspaceAnalytics(await resolveWorkspaceAnalytics()));
  } catch (e) {
    return handleRouteError(e, "Failed to load workspace settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = putSchema.parse(await req.json());

    await Promise.all([
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.orgName, body.org_name.trim()),
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.orgAbout, body.org_about.trim()),
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.timezone, body.timezone.trim()),
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.currency, body.currency.trim()),
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.languagePolicy, body.language_policy.trim()),
      adminUpsertSetting(
        WORKSPACE_ANALYTICS_KEYS.businessDefinitions,
        body.business_definitions.trim()
      ),
      adminUpsertSetting(WORKSPACE_ANALYTICS_KEYS.piiRefusal, body.pii_refusal.trim()),
    ]);

    return NextResponse.json({
      ok: true,
      ...toWorkspaceAnalytics(await resolveWorkspaceAnalytics()),
    });
  } catch (e) {
    return handleRouteError(e, "Failed to save workspace settings");
  }
}
