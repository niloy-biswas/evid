import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/auth/require-role";
import { adminDeleteDashboardTable } from "@/lib/supabase/admin-queries";
import { handleRouteError } from "@/lib/api/route-response";

interface RouteParams {
  params: Promise<{ id: string; tableName: string }>;
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requireEditorOrAdmin();
    const { id, tableName } = await params;
    await adminDeleteDashboardTable(id, decodeURIComponent(tableName));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to remove table");
  }
}
