-- Shortlist policies need a SECURITY DEFINER guard to avoid recursive RLS.
-- Keep it callable by those policies, but outside PostgREST's public schema.
create schema if not exists huni_internal;
revoke all on schema huni_internal from public;
grant usage on schema huni_internal to anon, authenticated;

alter function public.is_shortlist_member(uuid) set schema huni_internal;
revoke execute on function huni_internal.is_shortlist_member(uuid) from public;
grant execute on function huni_internal.is_shortlist_member(uuid) to anon, authenticated;
