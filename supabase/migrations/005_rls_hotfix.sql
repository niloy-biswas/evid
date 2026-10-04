-- ============================================================
-- 005_rls_hotfix.sql
-- Closes the RLS holes that the app never relied on, without any app change:
--   * profiles: self-promotion via user_role, and anon profile inserts
--   * dashboard_tables: public insert (feeds the agent system prompt)
--   * chat_sessions / chat_messages: public delete
--   * n8n_chat_histories: legacy, unused
-- Applied to production manually on 2026-10-05. Chat read/write lockdown
-- follows in 006 once the app queries Supabase as the signed-in user.
-- ============================================================

begin;

-- ─── profiles ───────────────────────────────────────────────
-- app/auth/callback/route.ts inserts and updates the caller's own row as
-- `authenticated`; handle_new_user (SECURITY DEFINER) and the service role
-- bypass RLS. user_role is writable only through the service role.
drop policy if exists "Service can insert profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (email = auth.email());
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (email = auth.email()) with check (email = auth.email());

revoke insert, update on public.profiles from anon, authenticated;
grant insert (id, name, email, role, avatar_url) on public.profiles to authenticated;
grant update (name, avatar_url) on public.profiles to authenticated;

-- ─── dashboard_tables ───────────────────────────────────────
-- Admin writes go through the service role.
drop policy if exists "Public insert dashboard tables" on public.dashboard_tables;

-- ─── chat delete ────────────────────────────────────────────
-- The app never deletes sessions or messages; FK cascades bypass RLS.
drop policy if exists "Public delete sessions" on public.chat_sessions;
drop policy if exists "Public delete chat messages" on public.chat_messages;

-- ─── n8n_chat_histories (legacy) ────────────────────────────
-- Production names differ from 000_current_schema.sql; drop both.
drop policy if exists "Public read" on public.n8n_chat_histories;
drop policy if exists "Public insert" on public.n8n_chat_histories;
drop policy if exists "Public delete" on public.n8n_chat_histories;
drop policy if exists "Public read n8n histories" on public.n8n_chat_histories;
drop policy if exists "Public insert n8n histories" on public.n8n_chat_histories;
drop policy if exists "Public delete n8n histories" on public.n8n_chat_histories;

commit;
