import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorOrAdmin } from "@/lib/auth/require-role";
import { adminAddDashboardTable } from "@/lib/supabase/admin-queries";
import { emptyToNull } from "@/lib/utils";
import { handleRouteError } from "@/lib/api/route-response";

const tableSchema = z.object({
  table_name: z.string().trim().min(1),
  row_count: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requireEditorOrAdmin();
    const { id } = await params;
    const body = tableSchema.parse(await req.json());
    await adminAddDashboardTable(id, {
      table_name: body.table_name,
      row_count: emptyToNull(body.row_count),
      description: emptyToNull(body.description),
      notes: emptyToNull(body.notes),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to add table");
  }
}
