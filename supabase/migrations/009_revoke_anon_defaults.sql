-- ============================================================
-- 009_revoke_anon_defaults.sql
-- Supabase grants anon (and authenticated) direct privileges on new tables
-- and functions in `public`, so `REVOKE ... FROM PUBLIC` alone leaves anon
-- with access. This removes the leftovers and changes the defaults so new
-- objects start closed to anon. No app dependency: everything touched here
-- is used only through the service role. Safe to apply at any time.
--
-- Checked by `npm run lint:rls` (scripts/check-rls.mjs).
-- ============================================================

begin;

-- Admin overview RPC: service role only (002 revoked only from PUBLIC).
revoke all on function public.admin_top_dashboards_by_messages(integer) from anon, authenticated;

-- Settings tables: service role only. deny_all policies already hide rows;
-- this removes the table grants as well.
revoke all on public.app_settings from anon, authenticated;
revoke all on public.data_sources from anon, authenticated;

-- New tables, sequences and functions created by postgres no longer grant
-- anon anything. Grant explicitly in the migration that needs it.
alter default privileges for role postgres in schema public revoke all on tables from anon;
alter default privileges for role postgres in schema public revoke all on sequences from anon;
alter default privileges for role postgres in schema public revoke all on functions from anon;

commit;
