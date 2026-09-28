alter table public.advertisers
  add column if not exists contact_phone text
  check (contact_phone is null or contact_phone ~ '^[0-9]{8,15}$');

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null default 'unspecified',
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
alter table public.listing_reports enable row level security;
create policy "reporters read their own reports" on public.listing_reports
  for select using (auth.uid() = reporter_id);
create policy "signed-in users submit reports" on public.listing_reports
  for insert with check (auth.uid() = reporter_id and status = 'pending');
