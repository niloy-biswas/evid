import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireEditorOrAdmin } from "@/lib/auth/require-role";
import { adminUpdateProfilePosition } from "@/lib/supabase/admin-queries";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const schema = z.object({
  role: z.string().trim().min(1).max(120),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireEditorOrAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());

    if (session.userRole !== "admin" && session.userId !== id) {
      return jsonError("Editors can only change their own position", 403);
    }

    await adminUpdateProfilePosition(id, body.role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to update position");
  }
}
