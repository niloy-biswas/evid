import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSignedIn } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { saveMessageReaction } from "@/lib/supabase/queries";
import { handleRouteError, jsonError } from "@/lib/api/route-response";

const reactionSchema = z.object({
  messageId: z.string().uuid(),
  reaction: z.enum(["liked", "disliked"]),
  feedback: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await requireSignedIn();
    const { messageId, reaction, feedback } = reactionSchema.parse(await req.json());
    const supabase = await createClient();

    const saved = await saveMessageReaction(supabase, messageId, userId, reaction, feedback);

    if (saved === null) {
      return jsonError("Failed to save reaction", 500);
    }
    if (!saved) {
      return jsonError("Message not found", 404);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleRouteError(e, "Failed to save reaction");
  }
}
