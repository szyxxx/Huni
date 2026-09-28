create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  unique (user_id, status)
);
alter table public.account_deletion_requests enable row level security;
create policy "users manage their own deletion requests" on public.account_deletion_requests
  for all using (auth.uid() = user_id);
