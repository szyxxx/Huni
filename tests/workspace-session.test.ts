import { expect, test, vi } from 'vitest';
import { createWorkspaceSessionController } from '../src/auth/workspaceSession';

test('a finished request cannot restore the previous account after logout', async () => {
  const pending = Promise.withResolvers<{ savedIds: string[] }>();
  const state = { syncUserId: null as string | null };
  const hydrateFromRemote = vi.fn();
  const store = {
    getState: () => state,
    setSyncUserId: (id: string | null) => { state.syncUserId = id; },
    hydrateFromRemote,
    setSyncError: vi.fn(),
  };
  const controller = createWorkspaceSessionController(store, () => pending.promise);

  const firstLoad = controller.setUser('user-a');
  await controller.setUser(null);
  pending.resolve({ savedIds: ['private-property'] });
  await firstLoad;

  expect(state.syncUserId).toBeNull();
  expect(hydrateFromRemote).not.toHaveBeenCalled();
});

test('repeated events for the same account do not reload and overwrite local edits', async () => {
  const state = { syncUserId: null as string | null };
  const pull = vi.fn(async () => ({ savedIds: [] }));
  const store = {
    getState: () => state,
    setSyncUserId: (id: string | null) => { state.syncUserId = id; },
    hydrateFromRemote: vi.fn(),
    setSyncError: vi.fn(),
  };
  const controller = createWorkspaceSessionController(store, pull);

  await controller.setUser('user-a');
  await controller.setUser('user-a');

  expect(pull).toHaveBeenCalledTimes(1);
});

test('an auth event reloads the account after a local privacy clear', async () => {
  const state = { syncUserId: null as string | null };
  const pull = vi.fn(async () => ({ savedIds: [] }));
  const store = {
    getState: () => state,
    setSyncUserId: (id: string | null) => { state.syncUserId = id; },
    hydrateFromRemote: vi.fn(),
    setSyncError: vi.fn(),
  };
  const controller = createWorkspaceSessionController(store, pull);

  await controller.setUser('user-a');
  state.syncUserId = null;
  await controller.setUser('user-a');

  expect(state.syncUserId).toBe('user-a');
  expect(pull).toHaveBeenCalledTimes(2);
});
