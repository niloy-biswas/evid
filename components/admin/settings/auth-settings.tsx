"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, FormError } from "@/components/admin/admin-form";
import { apiErrorMessage } from "@/lib/api/read-api-error";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthSettings() {
  const [domain, setDomain] = useState("*");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/settings/auth");
    if (!res.ok) {
      setError("Failed to load auth settings");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setDomain(data.allowed_email_domain ?? "*");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/settings/auth", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowed_email_domain: domain.trim() }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(apiErrorMessage(j, "Save failed"));
      return;
    }
    await load();
  }

  return (
    <div className="w-full space-y-8">
      <AdminPageHeader
        title="Auth"
        description={
          <>
            Controls the signup email domain check (database trigger). Use{" "}
            <span className="font-mono text-xs">*</span> to allow all domains (self-host default).
          </>
        }
      />

      {error ? <FormError>{error}</FormError> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Allowed email domain</CardTitle>
          <CardDescription>
            Store plain domain without @ (e.g. <span className="font-mono">company.com</span>
            ). Requires <span className="font-mono text-xs">enforce_email_domain</span> trigger on{" "}
            <span className="font-mono text-xs">auth.users</span> in Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="font-mono"
                placeholder="* or company.com"
              />
              <Button type="submit">Save</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
