-- Backfill only the published demo catalogue. Never overwrite an advertiser's own location.
update public.properties as p
set lat = coords.lat, lng = coords.lng
from (values
  ('10000000-0000-0000-0000-000000000001'::uuid, -6.8619, 107.6186),
  ('10000000-0000-0000-0000-000000000002'::uuid, -6.2088, 106.8228),
  ('10000000-0000-0000-0000-000000000003'::uuid, -8.5069, 115.2625),
  ('10000000-0000-0000-0000-000000000004'::uuid, -6.8915, 107.6107),
  ('10000000-0000-0000-0000-000000000005'::uuid, -6.1588, 106.9056),
  ('10000000-0000-0000-0000-000000000006'::uuid, -6.3021, 106.6528)
) as coords(id, lat, lng)
where p.id = coords.id and p.lat is null and p.lng is null;

update public.projects as p
set lat = coords.lat, lng = coords.lng
from (values
  ('20000000-0000-0000-0000-000000000001'::uuid, -6.3021, 106.6528),
  ('20000000-0000-0000-0000-000000000002'::uuid, -8.5069, 115.2625)
) as coords(id, lat, lng)
where p.id = coords.id and p.lat is null and p.lng is null;
