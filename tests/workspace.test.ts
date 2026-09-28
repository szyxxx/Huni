import { beforeEach, expect, test, vi } from 'vitest';
import { defaultFilters, useAppStore } from '../src/store/useAppStore';

vi.mock('expo-crypto', () => ({ randomUUID: () => globalThis.crypto.randomUUID() }));
vi.mock('../src/data/sync', () => ({
  pushSavedProperty: vi.fn().mockResolvedValue(undefined),
  pushPriceWatch: vi.fn().mockResolvedValue(undefined),
  pushSavedSearch: vi.fn().mockResolvedValue(undefined),
  removeSavedSearchRemote: vi.fn().mockResolvedValue(undefined),
  pushKprScenario: vi.fn().mockResolvedValue(undefined),
  removeKprScenarioRemote: vi.fn().mockResolvedValue(undefined),
  pushShortlist: vi.fn().mockResolvedValue(undefined),
  pushShortlistProperty: vi.fn().mockResolvedValue(undefined),
  deleteShortlistRemote: vi.fn().mockResolvedValue(undefined),
  pushNotificationPrefs: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  useAppStore.setState({
    syncUserId: null,
    savedIds: new Set(),
    watchedPriceIds: new Set(),
    savedSearches: [],
    kprScenarios: [],
    shortlists: [],
    hiddenIds: new Set(),
    recentlyViewed: [],
    searchHistory: [],
    compareIds: [],
    filters: defaultFilters,
  });
});

test('new saved searches, KPR scenarios, and shortlists use distinct database UUIDs', () => {
  const store = useAppStore.getState();
  store.addSavedSearch({ label: 'Bandung', query: 'Bandung', intent: 'buy', filters: defaultFilters, notify: true });
  store.addKprScenario({ label: 'Rumah', price: 1_000_000_000, downPaymentPercent: 20, tenorYears: 20, ratePercent: 8, monthlyInstallment: 6_691_000 });
  store.createShortlist('Pilihan kami');

  const state = useAppStore.getState();
  const ids = [state.savedSearches[0].id, state.kprScenarios[0].id, state.shortlists[0].id];
  expect(ids).toHaveLength(new Set(ids).size);
  for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(state.shortlists[0].inviteCode).toMatch(/^[0-9a-f]{32}$/i);
});

test('changing account clears private workspace state before the next user loads', () => {
  const store = useAppStore.getState();
  store.setSyncUserId('user-a');
  store.toggleSaved('property-a');
  store.togglePriceWatch('property-a');
  store.toggleHidden('property-a');
  store.addRecentlyViewed('property-a');
  store.addSearchHistory('rumah Bandung');
  store.addSavedSearch({ label: 'Bandung', query: 'Bandung', intent: 'buy', filters: defaultFilters, notify: true });
  store.addKprScenario({ label: 'Rumah', price: 1_000_000_000, downPaymentPercent: 20, tenorYears: 20, ratePercent: 8, monthlyInstallment: 6_691_000 });
  store.createShortlist('Pilihan kami');

  store.setSyncUserId(null);
  const state = useAppStore.getState();
  expect(state.savedIds.size).toBe(0);
  expect(state.watchedPriceIds.size).toBe(0);
  expect(state.hiddenIds.size).toBe(0);
  expect(state.recentlyViewed).toEqual([]);
  expect(state.searchHistory).toEqual([]);
  expect(state.savedSearches).toEqual([]);
  expect(state.kprScenarios).toEqual([]);
  expect(state.shortlists).toEqual([]);
});
