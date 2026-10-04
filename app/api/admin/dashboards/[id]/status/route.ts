import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminTransitionDashboardStatus } from "@/lib/supabase/admin-queries";
import { handleRouteError } from "@/lib/api/route-response";

const schema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());
    await adminTransitionDashboardStatus(id, body.status, session.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to update status");
  }
}
