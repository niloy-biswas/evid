-- ============================================================
-- 004_workspace_org_profile.sql
-- Organization name + about for the agent prompt (Admin → Workspace).
-- Safe to re-run: ON CONFLICT DO NOTHING.
-- ============================================================

INSERT INTO public.app_settings (key, value)
VALUES
  ('analytics_org_name', ''),
  ('analytics_org_about', '')
ON CONFLICT (key) DO NOTHING;
