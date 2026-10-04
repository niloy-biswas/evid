"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader, FormError } from "@/components/admin/admin-form";
import { apiErrorMessage } from "@/lib/api/read-api-error";
import type { ProfileAdminRow } from "@/lib/supabase/admin-queries";

export function UsersManagement() {
  const [profiles, setProfiles] = useState<ProfileAdminRow[]>([]);
  const [positions, setPositions] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = currentUserRole === "admin";

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/settings/users");
    if (!res.ok) {
      setError("Failed to load users");
      setLoading(false);
      return;
    }
    const data = await res.json();
    const rows = (data.profiles ?? []) as ProfileAdminRow[];
    setProfiles(rows);
    setPositions(Object.fromEntries(rows.map((p) => [p.id, p.role ?? ""])));
    setCurrentUserId(data.current_user_id ?? null);
    setCurrentUserRole(data.current_user_role ?? "user");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccessRoleChange(profileId: string, user_role: string) {
    setError(null);
    setBusyId(profileId);
    const res = await fetch(`/api/admin/settings/users/${profileId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_role }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(apiErrorMessage(j, "Access role update failed"));
      await load();
      return;
    }
    await load();
  }

  async function handlePositionSave(profileId: string) {
    setError(null);
    setBusyId(profileId);
    const res = await fetch(`/api/admin/settings/users/${profileId}/position`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: positions[profileId] ?? "" }),
    });
    setBusyId(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(apiErrorMessage(j, "Position update failed"));
      await load();
      return;
    }
    await load();
  }

  return (
    <div className="w-full space-y-8">
      <AdminPageHeader
        title="Users"
        description="Manage profile positions and access roles. Editors can update only their own position."
      />

      {error ? <FormError>{error}</FormError> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User profiles</CardTitle>
          <CardDescription>
            <span className="font-mono text-xs">role</span> is the user position (for example Data
            Analyst). <span className="font-mono text-xs">access</span> controls app permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Position</th>
                    <th className="pb-2 pr-4 font-medium">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => {
                    const canEditPosition = isAdmin || p.id === currentUserId;
                    const hasPositionChanged = (positions[p.id] ?? "") !== (p.role ?? "");
                    return (
                      <tr key={p.id} className="border-b border-border/40">
                        <td className="py-2 pr-4">{p.name}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{p.email}</td>
                        <td className="py-2 pr-4 min-w-56">
                          <div className="flex items-center gap-2">
                            <Input
                              value={positions[p.id] ?? ""}
                              disabled={!canEditPosition || busyId === p.id}
                              onChange={(e) =>
                                setPositions((prev) => ({
                                  ...prev,
                                  [p.id]: e.target.value,
                                }))
                              }
                              className="h-9 rounded-md disabled:opacity-60"
                              placeholder="Data Analyst"
                            />
                            {canEditPosition ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!hasPositionChanged || busyId === p.id}
                                onClick={() => handlePositionSave(p.id)}
                                aria-label={`Save position for ${p.name}`}
                              >
                                <Save className="size-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-2">
                          <NativeSelect
                            value={p.user_role ?? "user"}
                            disabled={!isAdmin || busyId === p.id}
                            onChange={(e) => handleAccessRoleChange(p.id, e.target.value)}
                            className="h-9 w-auto px-2 rounded-md disabled:opacity-60"
                          >
                            <option value="user">user</option>
                            <option value="editor">editor</option>
                            <option value="admin">admin</option>
                          </NativeSelect>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
