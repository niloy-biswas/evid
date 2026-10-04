import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { adminUpdateUserRole } from "@/lib/supabase/admin-queries";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const schema = z.object({
  user_role: z.enum(["user", "editor", "admin"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = schema.parse(await req.json());

    if (id === session.userId && body.user_role !== "admin") {
      return jsonError("You cannot remove your own admin role", 400);
    }

    await adminUpdateUserRole(id, body.user_role);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to update role");
  }
}
