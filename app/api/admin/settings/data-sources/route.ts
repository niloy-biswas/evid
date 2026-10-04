import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminInsertBigQueryDataSource, adminListDataSources } from "@/lib/supabase/admin-queries";
import { isEncryptionConfigured } from "@/lib/secrets/credentials-crypto";
import { testBigQueryConnection } from "@/lib/admin/test-connections";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const createSchema = z.object({
  label: z.string().min(1),
  project_id: z.string().min(1),
  location: z.string().trim().min(1).default("US"),
  credentials_json: z.string().min(2),
});

export async function GET() {
  try {
    await requireAdmin();
    const list = await adminListDataSources();
    return NextResponse.json({ data_sources: list });
  } catch (e) {
    return handleRouteError(e, "Failed to list data sources");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!isEncryptionConfigured()) {
      return jsonError(
        "SETTINGS_ENCRYPTION_KEY is not set (min 16 chars). Required to store credentials securely.",
        400
      );
    }
    const body = createSchema.parse(await req.json());
    await testBigQueryConnection({
      projectId: body.project_id,
      location: body.location,
      credentialsJson: body.credentials_json,
    });
    const id = await adminInsertBigQueryDataSource({
      label: body.label,
      project_id: body.project_id,
      location: body.location,
      credentials_json: body.credentials_json,
      created_by: session.userId,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return handleRouteError(e, "Failed to create data source");
  }
}
