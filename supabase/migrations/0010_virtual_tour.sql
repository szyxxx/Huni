-- Beta virtual tour: advertiser-supplied 3D model (.glb/.gltf, e.g. from a LiDAR
-- scan) or 360 panorama image, rendered client-side via a WebView (see
-- src/components/VirtualTourViewer.tsx) rather than a native 3D engine.
alter table public.properties add column if not exists virtual_tour_url text;
alter table public.properties add column if not exists virtual_tour_kind text
  check (virtual_tour_kind is null or virtual_tour_kind in ('model3d', 'panorama'));

-- Storage bucket for advertiser uploads (GLB/GLTF/JPG/PNG). Public read so the
-- WebView-based viewer (no auth header support) can load the asset directly;
-- writes are still gated by RLS-equivalent bucket policy below.
insert into storage.buckets (id, name, public)
values ('virtual-tours', 'virtual-tours', true)
on conflict (id) do nothing;

create policy "virtual tour assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'virtual-tours');

create policy "signed-in users upload their own virtual tour assets"
  on storage.objects for insert
  with check (bucket_id = 'virtual-tours' and auth.uid() is not null);
