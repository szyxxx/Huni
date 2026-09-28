-- Seed data mirroring src/data/properties.ts and src/data/projects.ts, so a
-- freshly created Supabase project isn't empty. Run after the migration:
--   supabase db reset   (local)
--   psql "$DATABASE_URL" -f supabase/seed/seed.sql   (remote)

insert into public.advertisers (id, name, is_agency, verification) values
  ('00000000-0000-0000-0000-000000000001', 'Sinta Property', true, 'verified_agent'),
  ('00000000-0000-0000-0000-000000000002', 'Metro Living', true, 'verified_agency'),
  ('00000000-0000-0000-0000-000000000003', 'Ubud Estates', true, 'official_developer'),
  ('00000000-0000-0000-0000-000000000004', 'Bu Ratna', false, 'verified_owner'),
  ('00000000-0000-0000-0000-000000000005', 'Gading Commercial', true, 'verified_agent'),
  ('00000000-0000-0000-0000-000000000006', 'Sinar Mas Land', true, 'official_developer')
on conflict (id) do nothing;

insert into public.properties (
  id, advertiser_id, title, intent, type, price, price_unit, estimated_installment, previous_price,
  area, city, bedrooms, bathrooms, land_area, building_area, images, promotion, facilities, description,
  status, last_confirmed_at
) values
  (
    '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
    'Rumah Minimalis 2 Lantai di Dago Atas', 'buy', 'house', 2450000000, 'total', 14200000, 2600000000,
    'Dago Atas', 'Bandung', 3, 2, 120, 150,
    array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'],
    'featured', array['Carport', 'Taman', 'Keamanan 24 jam'],
    'Hunian nyaman dengan sirkulasi udara baik, dekat kampus dan pusat kuliner Dago.',
    'active', '2026-09-24'
  ),
  (
    '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
    'Apartemen Studio Furnished Sudirman', 'rent', 'apartment', 5500000, 'month', null, null,
    'Sudirman', 'Jakarta Selatan', 1, 1, null, 28,
    array['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    'sponsored', array['Gym', 'Kolam renang', 'Laundry'],
    'Unit siap huni dengan pemandangan kota, akses mudah ke MRT Sudirman.',
    'active', '2026-09-26'
  ),
  (
    '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
    'Villa Tropis Ubud dengan Kolam Privat', 'buy', 'villa', 4800000000, 'total', 27800000, null,
    'Ubud', 'Gianyar', 4, 4, 400, 280,
    array['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=80'],
    'premium', array['Kolam renang privat', 'Taman tropis', 'Dapur outdoor'],
    'Villa desain kontemporer dikelilingi sawah, cocok untuk investasi maupun hunian.',
    'active', '2026-09-20'
  ),
  (
    '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004',
    'Kost Eksklusif Putri Dekat ITB', 'rent', 'kost', 2200000, 'month', null, null,
    'Coblong', 'Bandung', 1, 1, null, 12,
    array['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80'],
    'normal', array['WiFi', 'AC', 'Kamar mandi dalam'],
    'Kost putri dengan keamanan ketat, 5 menit jalan kaki ke Kampus ITB Ganesha.',
    'active', '2026-09-25'
  ),
  (
    '10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005',
    'Ruko 3 Lantai Strategis Kelapa Gading', 'buy', 'ruko', 6200000000, 'total', 35600000, null,
    'Kelapa Gading', 'Jakarta Utara', null, null, 90, 270,
    array['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1481253127861-534498168948?auto=format&fit=crop&w=1200&q=80'],
    'normal', array['Akses jalan utama', 'Area parkir luas'],
    'Cocok untuk kantor atau ritel, berada di jalur utama dengan lalu lintas tinggi.',
    'active', '2026-09-18'
  ),
  (
    '10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006',
    'Rumah Baru Cluster Modern BSD', 'buy', 'house', 1850000000, 'total', 10700000, 1950000000,
    'BSD City', 'Tangerang Selatan', 3, 2, 90, 100,
    array['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'],
    'featured', array['Clubhouse', 'Taman bermain', 'Keamanan 24 jam'],
    'Cluster baru dengan konsep hijau, dekat gerbang tol dan sekolah internasional.',
    'active', '2026-09-27'
  )
on conflict (id) do nothing;

insert into public.property_nearby_places (property_id, label, minutes) values
  ('10000000-0000-0000-0000-000000000001', 'Kantor tersimpan', 18),
  ('10000000-0000-0000-0000-000000000001', 'Sekolah tersimpan', 9),
  ('10000000-0000-0000-0000-000000000002', 'Kantor tersimpan', 12),
  ('10000000-0000-0000-0000-000000000006', 'Sekolah tersimpan', 6);

insert into public.projects (
  id, advertiser_id, name, city, area, images, progress_percent, progress_label, facilities, promo
) values
  (
    '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006',
    'Greenhaven Residence', 'Tangerang Selatan', 'BSD City',
    array['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80'],
    65, 'Struktur lantai 3 dari 5 selesai', array['Clubhouse', 'Kolam renang', 'Taman bermain', 'Keamanan 24 jam'],
    'DP 0% untuk 50 unit pertama'
  ),
  (
    '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
    'Ubud Hillside Villas', 'Gianyar', 'Ubud',
    array['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=80'],
    100, 'Siap huni', array['Kolam renang privat per unit', 'Taman tropis', 'Keamanan 24 jam'],
    null
  )
on conflict (id) do nothing;

insert into public.project_units (project_id, name, building_area, bedrooms, bathrooms, price_from, available) values
  ('20000000-0000-0000-0000-000000000001', 'Tipe Aster', 80, 2, 2, 1450000000, 12),
  ('20000000-0000-0000-0000-000000000001', 'Tipe Camelia', 100, 3, 2, 1850000000, 6),
  ('20000000-0000-0000-0000-000000000001', 'Tipe Dahlia', 130, 4, 3, 2400000000, 3),
  ('20000000-0000-0000-0000-000000000002', 'Villa 3BR', 220, 3, 3, 4200000000, 4),
  ('20000000-0000-0000-0000-000000000002', 'Villa 4BR', 280, 4, 4, 4800000000, 2);

insert into public.project_nearby_places (project_id, label, minutes) values
  ('20000000-0000-0000-0000-000000000001', 'Gerbang tol', 5),
  ('20000000-0000-0000-0000-000000000001', 'Sekolah internasional', 8),
  ('20000000-0000-0000-0000-000000000002', 'Pusat Ubud', 10);
