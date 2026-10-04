import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSignedIn } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { createChatSession, getPublishedDashboardById } from "@/lib/supabase/queries";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const createSessionSchema = z.object({
  dashboardId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSignedIn();
    const { dashboardId } = createSessionSchema.parse(await req.json());
    const supabase = await createClient();

    const dashboard = await getPublishedDashboardById(supabase, dashboardId);
    if (!dashboard) {
      return jsonError("Dashboard not found or not published", 404);
    }

    const session = await createChatSession(supabase, dashboard.id, userId);
    if (!session) {
      return jsonError("Failed to create session", 500);
    }

    return NextResponse.json({ sessionNumber: session.session_number, sessionId: session.id });
  } catch (e) {
    return handleRouteError(e, "Failed to create session");
  }
}
