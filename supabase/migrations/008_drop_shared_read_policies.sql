-- ============================================================
-- 008_drop_shared_read_policies.sql
-- Shared sessions are read only through get_shared_chat(token) (007), so
-- the table-level is_shared read policies are no longer needed.
--
-- DEPLOY ORDER: apply only AFTER the app version whose
-- getSharedChatByToken() calls get_shared_chat() is live; the previous
-- version reads chat_sessions/chat_messages directly and relies on these.
-- ============================================================

begin;

drop policy if exists "Authenticated read shared sessions" on public.chat_sessions;
drop policy if exists "Authenticated read shared messages" on public.chat_messages;

commit;
