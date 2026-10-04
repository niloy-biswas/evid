-- ============================================================
-- 007_shared_chat_lookup.sql
-- Token-based lookup for /share/[token]. Returns only the fields the
-- read-only view renders (no share_token, profile ids, feedback, tool
-- calls or dashboard context).
--
-- DEPLOY ORDER: additive and safe to apply BEFORE deploying the app version
-- that calls get_shared_chat(). 008 then removes the broad shared-read
-- policies once that version is live.
-- ============================================================

begin;

create index if not exists idx_chat_sessions_share_token
    on public.chat_sessions using btree (share_token);

create or replace function public.get_shared_chat(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session', jsonb_build_object(
      'session_number', s.session_number,
      'title', s.title
    ),
    'dashboard', jsonb_build_object(
      'dashboard_id', d.dashboard_id,
      'dashboard_name', d.dashboard_name
    ),
    'messages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'role', m.role,
          'content', m.content,
          'created_at', m.created_at
        )
        order by m.created_at
      )
      from public.chat_messages m
      where m.session_id = s.id
    ), '[]'::jsonb)
  )
  from public.chat_sessions s
  join public.dashboards d
    on d.id = s.dashboard_id
   and d.status = 'published'
  where s.share_token = p_token
    and s.is_shared = true
    and auth.role() = 'authenticated'
$$;

-- Supabase grants EXECUTE on new functions to anon explicitly, so revoking
-- from PUBLIC alone is not enough.
revoke all on function public.get_shared_chat(uuid) from public, anon;
grant execute on function public.get_shared_chat(uuid) to authenticated;

-- Same default grant applied to the 006 helper.
revoke all on function public.current_profile_id() from anon;

commit;
