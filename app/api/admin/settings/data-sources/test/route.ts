import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { handleRouteError, jsonError } from "@/lib/api/route-response";
import { testBigQueryConnection } from "@/lib/admin/test-connections";
import {
  adminMarkDataSourceTested,
  adminResolveDataSourceCredentials,
} from "@/lib/supabase/admin-queries";

const testSchema = z
  .object({
    id: z.string().uuid().optional(),
    project_id: z.string().trim().min(1),
    location: z.string().trim().min(1).default("US"),
    credentials_json: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (!val.credentials_json?.trim() && !val.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "credentials_json is required when testing a new source",
        path: ["credentials_json"],
      });
    }
  });

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = testSchema.parse(await req.json());

    const credentialsJson = body.id
      ? await adminResolveDataSourceCredentials(body.id, body.credentials_json)
      : (body.credentials_json ?? "").trim();

    if (!credentialsJson) {
      return jsonError("credentials_json is required when testing a new source", 400);
    }

    await testBigQueryConnection({
      projectId: body.project_id,
      location: body.location,
      credentialsJson,
    });

    let last_tested_at: string | undefined;
    if (body.id) {
      last_tested_at = await adminMarkDataSourceTested(body.id);
    }

    return NextResponse.json({
      ok: true,
      last_tested_at,
    });
  } catch (e) {
    return handleRouteError(e, "Connection test failed", { exposeMessage: true, status: 400 });
  }
}
