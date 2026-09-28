import { expect, test, vi } from 'vitest';
import { fetchProperties, fetchProjectById } from '../src/data/repository';

vi.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({ data: null, error: new Error('database unavailable') }),
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
