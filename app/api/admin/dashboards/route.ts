import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorOrAdmin } from "@/lib/auth/require-role";
import { adminCreateDashboard, adminListAllDashboards } from "@/lib/supabase/admin-queries";
import { emptyToNull } from "@/lib/utils";
import { handleRouteError } from "@/lib/api/route-response";

const dashboardSchema = z.object({
  dashboard_id: z.string().trim().min(1),
  dashboard_name: z.string().trim().min(1),
  vertical: z.string().trim().optional().nullable(),
  purpose: z.string().trim().optional().nullable(),
  link: z.string().trim().optional().nullable(),
  refresh_window: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  business_rules: z.string().trim().optional().nullable(),
  caveats: z.string().trim().optional().nullable(),
  custom_instructions: z.string().trim().optional().nullable(),
  example_questions: z.array(z.string().trim()).default([]),
  data_source_id: z.string().uuid().optional().nullable(),
});

export async function GET() {
  try {
    await requireEditorOrAdmin();
    const dashboards = await adminListAllDashboards();
    return NextResponse.json({ dashboards });
  } catch (e) {
    return handleRouteError(e, "Failed to list dashboards");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireEditorOrAdmin();
    const body = dashboardSchema.parse(await req.json());
    const id = await adminCreateDashboard({
      dashboard_id: body.dashboard_id,
      dashboard_name: body.dashboard_name,
      vertical: emptyToNull(body.vertical),
      purpose: emptyToNull(body.purpose),
      link: emptyToNull(body.link),
      refresh_window: emptyToNull(body.refresh_window),
      description: emptyToNull(body.description),
      business_rules: emptyToNull(body.business_rules),
      caveats: emptyToNull(body.caveats),
      custom_instructions: emptyToNull(body.custom_instructions),
      example_questions: body.example_questions.filter(Boolean),
      data_source_id: body.data_source_id ?? null,
    });
    return NextResponse.json({ id });
  } catch (e) {
    return handleRouteError(e, "Failed to create dashboard");
  }
}
