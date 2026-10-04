import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-role";
import { envAllowedEmailDomain } from "@/lib/env";
import { adminGetSetting, adminUpsertSetting } from "@/lib/supabase/admin-queries";
import { handleRouteError } from "@/lib/api/route-response";

const putSchema = z.object({
  allowed_email_domain: z.string().min(1),
});

export async function GET() {
  try {
    await requireAdmin();
    const domain = (await adminGetSetting("allowed_email_domain")) ?? envAllowedEmailDomain() ?? "*";
    return NextResponse.json({ allowed_email_domain: domain });
  } catch (e) {
    return handleRouteError(e, "Failed to load auth settings");
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = putSchema.parse(await req.json());
    await adminUpsertSetting("allowed_email_domain", body.allowed_email_domain.trim());
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleRouteError(e, "Failed to save auth settings");
  }
}
