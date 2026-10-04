-- ============================================================
-- 006_rls_owner_scoped_chat.sql
-- Replaces the remaining USING (true) policies with owner-scoped ones and
-- removes all anon access to app tables.
--
-- DEPLOY ORDER: apply only AFTER the app version that queries Supabase with
-- the signed-in user's client (lib/supabase/queries.ts takes a `client`
-- argument) is live. The previous version used a JWT-less anon client and
-- would see no rows under these policies.
--
-- Service role (admin APIs, chat runtime), SECURITY DEFINER functions and FK
-- cascades bypass RLS and are unaffected.
-- ============================================================

begin;

-- ─── Identity helper ────────────────────────────────────────
-- Looks up by email, not auth.uid(): handle_new_user keeps the existing
-- profiles.id on an email conflict, so profiles.id can differ from auth.uid().
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where email = auth.email()
$$;

revoke all on function public.current_profile_id() from public;
grant execute on function public.current_profile_id() to authenticated;

-- ─── No anon access to app tables ───────────────────────────
revoke all on public.profiles           from anon;
revoke all on public.dashboards         from anon;
revoke all on public.dashboard_tables   from anon;
revoke all on public.chat_sessions      from anon;
revoke all on public.chat_messages      from anon;
revoke all on public.n8n_chat_histories from anon, authenticated;

-- ─── profiles ───────────────────────────────────────────────
-- Insert/update policies and column grants were set in 005.
drop policy if exists "Public read profiles" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (email = auth.email());

-- ─── dashboards ─────────────────────────────────────────────
-- Drafts and archived rows are admin-only (service role).
drop policy if exists "Public read dashboards" on public.dashboards;
create policy "Authenticated read published dashboards" on public.dashboards
  for select to authenticated using (status = 'published');

-- ─── dashboard_tables ───────────────────────────────────────
drop policy if exists "Public read dashboard tables" on public.dashboard_tables;
create policy "Authenticated read dashboard tables" on public.dashboard_tables
  for select to authenticated using (true);

-- ─── chat_sessions ──────────────────────────────────────────
drop policy if exists "Public read sessions" on public.chat_sessions;
drop policy if exists "Public insert sessions" on public.chat_sessions;
drop policy if exists "Public update sessions" on public.chat_sessions;
-- "Authenticated read shared sessions" (is_shared = true) is kept for /share/[token].

create policy "Users read own sessions" on public.chat_sessions
  for select to authenticated using (profile_id = public.current_profile_id());
create policy "Users create own sessions" on public.chat_sessions
  for insert to authenticated with check (profile_id = public.current_profile_id());
create policy "Users update own sessions" on public.chat_sessions
  for update to authenticated
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

-- Only title and sharing are mutable; share_token, owner and dashboard are fixed.
revoke update on public.chat_sessions from authenticated;
grant update (title, is_shared, updated_at) on public.chat_sessions to authenticated;

-- ─── chat_messages ──────────────────────────────────────────
drop policy if exists "Public read chat messages" on public.chat_messages;
drop policy if exists "Public insert chat messages" on public.chat_messages;
drop policy if exists "Public update chat messages" on public.chat_messages;
-- "Authenticated read shared messages" is kept for /share/[token].

create policy "Users read own messages" on public.chat_messages
  for select to authenticated using (profile_id = public.current_profile_id());
create policy "Users add messages to own sessions" on public.chat_messages
  for insert to authenticated
  with check (
    profile_id = public.current_profile_id()
    and exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.profile_id = public.current_profile_id()
        and s.dashboard_id = chat_messages.dashboard_id
    )
  );
create policy "Users react to own messages" on public.chat_messages
  for update to authenticated
  using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

-- Reactions are the only client-side edit.
revoke update on public.chat_messages from authenticated;
grant update (reaction, feedback) on public.chat_messages to authenticated;

commit;
