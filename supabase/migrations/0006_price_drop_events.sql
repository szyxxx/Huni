alter table public.price_change_events
  add column if not exists notification_claimed_at timestamptz,
  add column if not exists notification_sent_at timestamptz;

create or replace function public.remember_previous_price()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.price is distinct from old.price then
    new.previous_price := old.price;
  end if;
  return new;
end;
$$;

drop trigger if exists before_property_price_change on public.properties;
create trigger before_property_price_change
  before update of price on public.properties
  for each row execute procedure public.remember_previous_price();

create or replace function public.record_price_drop()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' and new.price < old.price then
    insert into public.price_change_events (property_id, from_price, to_price)
    values (new.id, old.price, new.price);
  end if;
  return new;
end;
$$;

drop trigger if exists on_property_price_drop on public.properties;
create trigger on_property_price_drop
  after update of price on public.properties
  for each row execute procedure public.record_price_drop();

create or replace function public.claim_price_change_event(event_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare claimed_id uuid;
begin
  update public.price_change_events
  set notification_claimed_at = now()
  where id = event_id
    and notification_sent_at is null
    and (notification_claimed_at is null or notification_claimed_at < now() - interval '15 minutes')
  returning id into claimed_id;
  return claimed_id is not null;
end;
$$;
revoke all on function public.claim_price_change_event(uuid) from public, anon, authenticated;
grant execute on function public.claim_price_change_event(uuid) to service_role;
