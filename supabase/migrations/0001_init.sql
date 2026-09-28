-- Huni core schema. Mirrors src/data/*.ts shapes so the client can switch
-- from mock arrays to Supabase queries with minimal reshaping.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth.users, created by the handle_new_user trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are self-readable" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles are self-writable" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Property taxonomy (configurable per PRD §10.1, not hard-coded to one screen)
-- ---------------------------------------------------------------------------
create table if not exists public.property_types (
  key text primary key,
  label text not null,
  category text not null check (category in ('residential', 'commercial'))
);

insert into public.property_types (key, label, category) values
  ('house', 'Rumah', 'residential'),
  ('apartment', 'Apartemen', 'residential'),
  ('villa', 'Villa', 'residential'),
  ('kost', 'Kost', 'residential'),
  ('land', 'Tanah', 'residential'),
  ('ruko', 'Ruko', 'commercial'),
  ('office', 'Kantor', 'commercial')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Advertisers (agents/agencies/developers) and listings
-- ---------------------------------------------------------------------------
create table if not exists public.advertisers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  name text not null,
  is_agency boolean not null default false,
  verification text not null default 'unverified'
    check (verification in ('unverified', 'verified_owner', 'verified_agent', 'verified_agency', 'official_developer')),
  created_at timestamptz not null default now()
);

alter table public.advertisers enable row level security;
create policy "advertisers are publicly readable" on public.advertisers for select using (true);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers (id) on delete cascade,
  title text not null,
  intent text not null check (intent in ('buy', 'rent')),
  type text not null references public.property_types (key),
  price bigint not null check (price >= 0),
  price_unit text not null default 'total' check (price_unit in ('total', 'month', 'year')),
  estimated_installment bigint,
  previous_price bigint,
  area text not null,
  city text not null,
  bedrooms int,
  bathrooms int,
  land_area numeric,
  building_area numeric,
  images text[] not null default '{}',
  promotion text not null default 'normal' check (promotion in ('normal', 'featured', 'premium', 'sponsored')),
  facilities text[] not null default '{}',
  description text not null default '',
  location_privacy text not null default 'approximate' check (location_privacy in ('exact', 'approximate', 'hidden')),
  lat double precision,
  lng double precision,
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'active', 'expired', 'sold', 'rented', 'archived')),
  last_confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists properties_status_idx on public.properties (status) where status = 'active';
create index if not exists properties_intent_type_idx on public.properties (intent, type);
create index if not exists properties_city_area_idx on public.properties (city, area);

alter table public.properties enable row level security;
create policy "active properties are publicly readable" on public.properties
  for select using (status = 'active');
create policy "advertisers manage their own properties" on public.properties
  for all using (
    exists (select 1 from public.advertisers a where a.id = advertiser_id and a.owner_id = auth.uid())
  );

create table if not exists public.property_nearby_places (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  label text not null,
  minutes int not null check (minutes >= 0)
);

alter table public.property_nearby_places enable row level security;
create policy "nearby places follow their property" on public.property_nearby_places
  for select using (
    exists (select 1 from public.properties p where p.id = property_id and p.status = 'active')
  );

-- ---------------------------------------------------------------------------
-- Development projects (developer -> project -> unit types)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers (id) on delete cascade,
  name text not null,
  city text not null,
  area text not null,
  images text[] not null default '{}',
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  progress_label text not null default '',
  facilities text[] not null default '{}',
  promo text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "projects are publicly readable" on public.projects for select using (true);
create policy "advertisers manage their own projects" on public.projects
  for all using (
    exists (select 1 from public.advertisers a where a.id = advertiser_id and a.owner_id = auth.uid())
  );

create table if not exists public.project_units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  building_area numeric not null,
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  price_from bigint not null,
  available int not null default 0
);

alter table public.project_units enable row level security;
create policy "project units follow their project" on public.project_units for select using (true);

create table if not exists public.project_nearby_places (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  label text not null,
  minutes int not null check (minutes >= 0)
);

alter table public.project_nearby_places enable row level security;
create policy "project nearby places are publicly readable" on public.project_nearby_places for select using (true);

-- ---------------------------------------------------------------------------
-- User decision workspace: saved properties, searches, KPR scenarios,
-- shortlists, price watches. All owner-scoped via RLS.
-- ---------------------------------------------------------------------------
create table if not exists public.saved_properties (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
alter table public.saved_properties enable row level security;
create policy "users manage their own saved properties" on public.saved_properties
  for all using (auth.uid() = user_id);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  query text not null default '',
  intent text not null default 'buy',
  filters jsonb not null default '{}'::jsonb,
  notify boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.saved_searches enable row level security;
create policy "users manage their own saved searches" on public.saved_searches
  for all using (auth.uid() = user_id);

create table if not exists public.kpr_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  price bigint not null,
  down_payment_percent numeric not null,
  tenor_years int not null,
  rate_percent numeric not null,
  monthly_installment bigint not null,
  created_at timestamptz not null default now()
);
alter table public.kpr_scenarios enable row level security;
create policy "users manage their own kpr scenarios" on public.kpr_scenarios
  for all using (auth.uid() = user_id);

create table if not exists public.price_watches (
  user_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);
alter table public.price_watches enable row level security;
create policy "users manage their own price watches" on public.price_watches
  for all using (auth.uid() = user_id);

create table if not exists public.price_change_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  from_price bigint not null,
  to_price bigint not null,
  created_at timestamptz not null default now()
);
alter table public.price_change_events enable row level security;
create policy "price change events are publicly readable" on public.price_change_events for select using (true);

-- Shortlists: collaborative, invite-code based (PRD §7.4).
create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  invite_code text not null unique default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now()
);
alter table public.shortlists enable row level security;

create table if not exists public.shortlist_members (
  shortlist_id uuid not null references public.shortlists (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (shortlist_id, user_id)
);
alter table public.shortlist_members enable row level security;

create table if not exists public.shortlist_properties (
  shortlist_id uuid not null references public.shortlists (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  added_by uuid references auth.users (id) on delete set null,
  added_at timestamptz not null default now(),
  primary key (shortlist_id, property_id)
);
alter table public.shortlist_properties enable row level security;

create or replace function public.is_shortlist_member(sl_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.shortlists s where s.id = sl_id and s.owner_id = auth.uid()
    union
    select 1 from public.shortlist_members m where m.shortlist_id = sl_id and m.user_id = auth.uid()
  );
$$;

create policy "members read their shortlists" on public.shortlists
  for select using (public.is_shortlist_member(id));
create policy "owners manage their shortlists" on public.shortlists
  for all using (owner_id = auth.uid());

create policy "members read shortlist membership" on public.shortlist_members
  for select using (public.is_shortlist_member(shortlist_id));
create policy "members join via invite (insert only self)" on public.shortlist_members
  for insert with check (user_id = auth.uid());

create policy "members read shortlist properties" on public.shortlist_properties
  for select using (public.is_shortlist_member(shortlist_id));
create policy "members add/remove shortlist properties" on public.shortlist_properties
  for all using (public.is_shortlist_member(shortlist_id));

-- ---------------------------------------------------------------------------
-- Notification preferences and leads (PRD §13)
-- ---------------------------------------------------------------------------
create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  saved_search_match boolean not null default true,
  price_drops boolean not null default true,
  listing_updates boolean not null default true,
  project_promotions boolean not null default false,
  shortlist_activity boolean not null default true,
  lead_follow_up boolean not null default true
);
alter table public.notification_prefs enable row level security;
create policy "users manage their own notification prefs" on public.notification_prefs
  for all using (auth.uid() = user_id);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  guest_session_id text,
  source_surface text not null,
  channel text not null check (channel in ('whatsapp', 'call', 'inquiry', 'brochure', 'project_interest')),
  created_at timestamptz not null default now(),
  constraint lead_has_subject check (property_id is not null or project_id is not null)
);
alter table public.leads enable row level security;
create policy "users read their own leads" on public.leads for select using (auth.uid() = user_id);
create policy "anyone may create a lead" on public.leads for insert with check (true);

create table if not exists public.push_tokens (
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, expo_push_token)
);
alter table public.push_tokens enable row level security;
create policy "users manage their own push tokens" on public.push_tokens
  for all using (auth.uid() = user_id);
