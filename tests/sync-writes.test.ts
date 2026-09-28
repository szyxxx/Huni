import { expect, test, vi } from 'vitest';
import { pushSavedProperty } from '../src/data/sync';

const state = vi.hoisted(() => ({
  operations: [] as string[],
  releaseFirst: null as null | (() => void),
}));

vi.mock('../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: () => ({
      upsert: () => {
        state.operations.push('save');
        return new Promise<{ error: null }>((resolve) => {
          state.releaseFirst = () => resolve({ error: null });
        });
      },
      delete: () => ({
        match: async () => {
          state.operations.push('remove');
          return { error: null };
        },
      }),
    }),
  },
}));

test('rapid changes to one saved property reach the server in user order', async () => {
  const first = pushSavedProperty('user-a', 'property-a', true);
  const second = pushSavedProperty('user-a', 'property-a', false);
  await vi.waitFor(() => expect(state.releaseFirst).toBeTypeOf('function'));
  expect(state.operations).toEqual(['save']);
  state.releaseFirst?.();
  await Promise.all([first, second]);
  expect(state.operations).toEqual(['save', 'remove']);
});
