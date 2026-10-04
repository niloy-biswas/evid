import { NextResponse } from "next/server";
import { requireEditorOrAdmin } from "@/lib/auth/require-role";
import { adminListProfiles } from "@/lib/supabase/admin-queries";
import { handleRouteError } from "@/lib/api/route-response";

export async function GET() {
  try {
    const session = await requireEditorOrAdmin();
    const profiles = await adminListProfiles();
    return NextResponse.json({
      profiles,
      current_user_id: session.userId,
      current_user_role: session.userRole,
    });
  } catch (e) {
    return handleRouteError(e, "Failed to list users");
  }
}
