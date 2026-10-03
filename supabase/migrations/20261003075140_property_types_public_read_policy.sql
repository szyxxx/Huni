-- Property types are catalogue data used by signed-out and signed-in search.
-- Writes remain restricted by the grants in migration 0013.
alter table public.property_types enable row level security;

create policy "property types are publicly readable"
  on public.property_types for select to anon, authenticated using (true);
