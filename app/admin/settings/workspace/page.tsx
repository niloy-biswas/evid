"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkspaceForm {
  org_name: string;
  org_about: string;
  timezone: string;
  currency: string;
  language_policy: string;
  business_definitions: string;
  pii_refusal: string;
}

const EMPTY: WorkspaceForm = {
  org_name: "",
  org_about: "",
  timezone: "UTC",
  currency: "",
  language_policy: "",
  business_definitions: "",
  pii_refusal: "",
};

const TIMEZONE_OPTIONS = [
  "UTC",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
] as const;

const CURRENCY_OPTIONS = [
  { value: "", label: "None (no currency rule)" },
  { value: "BDT (৳)", label: "BDT — Bangladeshi Taka (৳)" },
  { value: "USD ($)", label: "USD — US Dollar ($)" },
  { value: "EUR (€)", label: "EUR — Euro (€)" },
  { value: "GBP (£)", label: "GBP — British Pound (£)" },
  { value: "INR (₹)", label: "INR — Indian Rupee (₹)" },
  { value: "AED (د.إ)", label: "AED — UAE Dirham" },
  { value: "SGD (S$)", label: "SGD — Singapore Dollar (S$)" },
  { value: "JPY (¥)", label: "JPY — Japanese Yen (¥)" },
  { value: "AUD (A$)", label: "AUD — Australian Dollar (A$)" },
  { value: "CAD (C$)", label: "CAD — Canadian Dollar (C$)" },
] as const;

const selectClassName =
  "w-full h-10 px-3 rounded-lg bg-input border border-border text-sm appearance-none";

function withCurrentOption(options: readonly string[], current: string): string[] {
  if (!current || options.includes(current as (typeof options)[number])) {
    return [...options];
  }
  return [current, ...options];
}

function formFromApi(data: Partial<WorkspaceForm>): WorkspaceForm {
  return {
    org_name: data.org_name ?? "",
    org_about: data.org_about ?? "",
    timezone: data.timezone ?? "UTC",
    currency: data.currency ?? "",
    language_policy: data.language_policy ?? "",
    business_definitions: data.business_definitions ?? "",
    pii_refusal: data.pii_refusal ?? "",
  };
}

export default function WorkspaceSettingsPage() {
  const [form, setForm] = useState<WorkspaceForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const load = useCallback(async () => {
    setStatus(null);
    const res = await fetch("/api/admin/settings/workspace");
    if (!res.ok) {
      setStatus({ type: "error", message: "Failed to load workspace settings" });
      setLoading(false);
      return;
    }
    const data = await res.json();
    setForm(formFromApi(data));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateField<K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) {
    setStatus(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: form.org_name.trim(),
          org_about: form.org_about.trim(),
          timezone: form.timezone.trim(),
          currency: form.currency.trim(),
          language_policy: form.language_policy.trim(),
          business_definitions: form.business_definitions.trim(),
          pii_refusal: form.pii_refusal.trim(),
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({
          type: "error",
          message: typeof j.error === "string" ? j.error : "Could not save workspace settings.",
        });
        return;
      }
      setForm(formFromApi(j));
      setStatus({ type: "success", message: "Workspace settings saved successfully." });
    } catch {
      setStatus({
        type: "error",
        message: "Could not save workspace settings. Check your connection.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">Workspace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Org-wide analytics defaults injected into every chat prompt. Per-dashboard overrides still
          live under{" "}
          <Link href="/admin/dashboards" className="underline underline-offset-2 hover:text-foreground">
            Dashboard registry → Context
          </Link>
          .
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics defaults</CardTitle>
          <CardDescription>
            Organization profile, timezone, currency, language policy, business definitions, and PII
            refusal copy. Leave optional fields empty if you do not want those rules in the prompt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Organization name (optional)
                </label>
                <input
                  value={form.org_name}
                  onChange={(e) => updateField("org_name", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-input border border-border text-sm"
                  placeholder="e.g. Acme Corp"
                />
                <p className="text-xs text-muted-foreground">
                  Shown to the agent as the company this deployment serves.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  About the organization (optional)
                </label>
                <textarea
                  value={form.org_about}
                  onChange={(e) => updateField("org_about", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm"
                  placeholder={
                    "Short company context, e.g. industry, products, geography, what teams use this data for."
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Basic background so the agent interprets questions in the right business context.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <select
                  value={form.timezone}
                  onChange={(e) => updateField("timezone", e.target.value)}
                  className={`${selectClassName} font-mono`}
                  required
                >
                  {withCurrentOption(TIMEZONE_OPTIONS, form.timezone).map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Used for the current datetime shown to the agent.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Currency (optional)</label>
                <select
                  value={
                    CURRENCY_OPTIONS.some((c) => c.value === form.currency)
                      ? form.currency
                      : form.currency
                        ? "__custom__"
                        : ""
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "__custom__") return;
                    updateField("currency", v);
                  }}
                  className={selectClassName}
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value || "none"} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                  {form.currency &&
                  !CURRENCY_OPTIONS.some((c) => c.value === form.currency) ? (
                    <option value="__custom__">{form.currency}</option>
                  ) : null}
                </select>
                <p className="text-xs text-muted-foreground">
                  If set, the agent is instructed to display monetary values in this currency.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Language policy</label>
                <textarea
                  value={form.language_policy}
                  onChange={(e) => updateField("language_policy", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Business definitions (optional)
                </label>
                <textarea
                  value={form.business_definitions}
                  onChange={(e) => updateField("business_definitions", e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm font-mono"
                  placeholder={
                    "Org-wide rules the agent should know, e.g.\n" +
                    "- Default user id column is user_id\n" +
                    "- Product groups are collections of SKUs, not single products\n" +
                    "- Revenue currency and attribution rules"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Replaces hardcoded company rules. Dashboard Context can still add or override for
                  one dashboard.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">PII refusal message</label>
                <textarea
                  value={form.pii_refusal}
                  onChange={(e) => updateField("pii_refusal", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-input border border-border text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Shown when the user asks for raw user-level contact data (phone numbers, etc.).
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {status ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className={
                      status.type === "success"
                        ? "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300"
                        : "rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    }
                  >
                    {status.message}
                  </div>
                ) : null}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
