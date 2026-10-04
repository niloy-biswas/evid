-- ============================================================
-- 003_workspace_analytics_settings.sql
-- Org-wide analytics defaults for the agent prompt (Admin → Workspace).
-- Safe to re-run: ON CONFLICT DO NOTHING.
-- ============================================================

INSERT INTO public.app_settings (key, value)
VALUES
  ('analytics_timezone', 'UTC'),
  ('analytics_currency', ''),
  (
    'analytics_language_policy',
    'Respond in the same language the user writes in. Default to English if unclear.'
  ),
  ('analytics_business_definitions', ''),
  (
    'analytics_pii_refusal',
    'I can''t share raw user-level contact data. Please contact your data team.'
  )
ON CONFLICT (key) DO NOTHING;
