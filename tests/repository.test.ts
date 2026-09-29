import { expect, test, vi } from 'vitest';
import { fetchProperties, fetchProjectById } from '../src/data/repository';

const mockCatalogue = vi.hoisted(() => ({
  properties: { data: null as unknown[] | null, error: new Error('database unavailable') as Error | null },
}));

vi.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => mockCatalogue.properties,
          maybeSingle: async () => ({ data: null, error: new Error('database unavailable') }),
        }),
      }),
    }),
  },
}));

test('configured catalogue failures surface instead of showing demo data', async () => {
  await expect(fetchProperties()).rejects.toThrow('database unavailable');
  await expect(fetchProjectById('id')).rejects.toThrow('database unavailable');
});

test('the published seed listings have usable map coordinates before the database backfill', async () => {
  mockCatalogue.properties = {
    data: [{
      id: '10000000-0000-0000-0000-000000000001', title: 'Rumah Dago', intent: 'buy', type: 'house',
      price: 2_450_000_000, price_unit: 'total', estimated_installment: null, previous_price: null,
      area: 'Dago Atas', city: 'Bandung', bedrooms: 3, bathrooms: 2, land_area: 120,
      building_area: 150, images: [], furnished: null, video_url: null, promotion: 'normal',
      facilities: [], description: '', lat: null, lng: null, last_confirmed_at: '2026-09-24',
      advertisers: null, property_nearby_places: null,
    }], error: null,
  };

  const [property] = await fetchProperties();
  expect([property.lat, property.lng]).toEqual([-6.8619, 107.6186]);
});
