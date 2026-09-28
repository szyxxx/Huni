import { expect, test } from 'vitest';
import { GuestWorkspaceStorage, type GuestWorkspace } from '../src/store/guestWorkspace';

const example: GuestWorkspace = {
  savedIds: ['property-1'],
  watchedPriceIds: ['property-1'],
  hiddenIds: [],
  recentlyViewed: ['property-1'],
  searchHistory: ['rumah Bandung'],
  savedSearches: [],
  kprScenarios: [],
  shortlists: [],
  filters: { types: [], minPrice: null, maxPrice: null, bedrooms: null, bathrooms: null, maxInstallment: null, furnished: null, verifiedOnly: false, minArea: null, specialOfferOnly: false, videoOnly: false },
  notificationPrefs: { savedSearchMatch: true, priceDrops: true, listingUpdates: true, projectPromotions: false, shortlistActivity: true, leadFollowUp: true },
  intent: 'buy',
};

test('guest workspace survives a new storage instance and can be cleared', async () => {
  const values = new Map<string, string>();
  const adapter = {
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => { values.set(key, value); },
    removeItem: async (key: string) => { values.delete(key); },
  };
  await new GuestWorkspaceStorage(adapter).save(example);

  const reopened = new GuestWorkspaceStorage(adapter);
  expect(await reopened.load()).toEqual(example);
  await reopened.clear();
  expect(await reopened.load()).toBeNull();
});

test('malformed local data is ignored instead of replacing the workspace', async () => {
  const adapter = {
    getItem: async () => '{"savedIds":"wrong"}',
    setItem: async () => {},
    removeItem: async () => {},
  };
  expect(await new GuestWorkspaceStorage(adapter).load()).toBeNull();
});
