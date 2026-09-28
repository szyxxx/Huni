drop policy if exists "users manage their own deletion requests" on public.account_deletion_requests;

create policy "users read their own deletion requests" on public.account_deletion_requests
  for select using (auth.uid() = user_id);
create policy "users request their own deletion" on public.account_deletion_requests
  for insert with check (auth.uid() = user_id and status = 'pending');

insert into public.notification_prefs (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.create_notification_prefs_for_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_prefs (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_create_notification_prefs on auth.users;
create trigger on_auth_user_create_notification_prefs
  after insert on auth.users
  for each row execute procedure public.create_notification_prefs_for_new_user();

create table if not exists public.account_deletion_audit (
  request_id uuid primary key,
  processed_at timestamptz not null default now()
);
alter table public.account_deletion_audit enable row level security;
