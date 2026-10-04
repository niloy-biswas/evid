import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireOwnedSession, requireSignedIn } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { toggleSessionSharing } from "@/lib/supabase/queries";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const shareSchema = z.object({
  sessionId: z.string().uuid(),
  isShared: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSignedIn();
    const { sessionId, isShared } = shareSchema.parse(await req.json());
    const supabase = await createClient();

    const session = await requireOwnedSession(supabase, sessionId, userId);
    const shareToken = await toggleSessionSharing(supabase, session.id, isShared);

    if (!shareToken) {
      return jsonError("Failed to update sharing", 500);
    }

    return NextResponse.json({ success: true, shareToken, isShared });
  } catch (e) {
    return handleRouteError(e, "Failed to update sharing");
  }
}
