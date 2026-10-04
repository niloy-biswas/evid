import { apiErrorMessage } from "@/lib/api/read-api-error";
import type { DashboardStatus } from "@/lib/types";

/** Publish / unpublish / archive. Returns an error message, or `null` on success. */
export async function updateDashboardStatus(
  id: string,
  status: DashboardStatus
): Promise<string | null> {
  const res = await fetch(`/api/admin/dashboards/${id}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (res.ok) return null;
  return apiErrorMessage(await res.json().catch(() => ({})), "Failed to update status");
}
