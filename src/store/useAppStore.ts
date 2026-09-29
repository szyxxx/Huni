import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { properties, type PropertyType } from '../data/properties';
import type { GuestWorkspace } from './guestWorkspace';
import {
  deleteShortlistRemote,
  pushKprScenario,
  pushNotificationPrefs,
  pushPriceWatch,
  pushSavedProperty,
  pushSavedSearch,
  pushShortlist,
  pushShortlistProperty,
  removeKprScenarioRemote,
  removeSavedSearchRemote,
  type RemoteUserData,
} from '../data/sync';

function inviteCodeFor() {
  return Crypto.randomUUID().replaceAll('-', '');
}

export type SearchIntent = 'buy' | 'rent' | 'new-projects';

export type FilterState = {
  types: PropertyType[];
  minPrice: number | null;
  maxPrice: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  maxInstallment: number | null;
  furnished: boolean | null;
  verifiedOnly: boolean;
  minArea: number | null;
  specialOfferOnly: boolean;
  videoOnly: boolean;
};

export const defaultFilters: FilterState = {
  types: [],
  minPrice: null,
  maxPrice: null,
  bedrooms: null,
  bathrooms: null,
  maxInstallment: null,
  furnished: null,
  verifiedOnly: false,
  minArea: null,
  specialOfferOnly: false,
  videoOnly: false,
};

export type SavedSearch = {
  id: string;
  label: string;
  query: string;
  intent: SearchIntent;
  filters: FilterState;
  createdAt: string;
  notify: boolean;
};

export type KprScenario = {
  id: string;
  label: string;
  price: number;
  downPaymentPercent: number;
  tenorYears: number;
  ratePercent: number;
  monthlyInstallment: number;
  createdAt: string;
};

export type Shortlist = {
  id: string;
  name: string;
  propertyIds: string[];
  inviteCode: string;
  ownerId?: string;
  createdAt: string;
};

export type PriceAlert = {
  propertyId: string;
  seenAt: string;
  fromPrice: number;
  toPrice: number;
};

export type NotificationPrefs = {
  savedSearchMatch: boolean;
  priceDrops: boolean;
  listingUpdates: boolean;
  projectPromotions: boolean;
  shortlistActivity: boolean;
  leadFollowUp: boolean;
};

function syncWrite(userId: string, action: Promise<void>) {
  useAppStore.getState().setSyncError(null);
  void action.catch((error) => {
    if (useAppStore.getState().syncUserId === userId) {
      useAppStore.getState().setSyncError(error instanceof Error ? error.message : 'Data gagal disinkronkan.');
    }
  });
}

const defaultNotificationPrefs: NotificationPrefs = {
  savedSearchMatch: true,
  priceDrops: true,
  listingUpdates: true,
  projectPromotions: false,
  shortlistActivity: true,
  leadFollowUp: true,
};

type AppState = {
  intent: SearchIntent;
  setIntent: (intent: SearchIntent) => void;

  savedIds: Set<string>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;

  hiddenIds: Set<string>;
  toggleHidden: (id: string) => void;

  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;

  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;

  savedSearches: SavedSearch[];
  addSavedSearch: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
  removeSavedSearch: (id: string) => void;

  kprScenarios: KprScenario[];
  addKprScenario: (scenario: Omit<KprScenario, 'id' | 'createdAt'>) => void;
  removeKprScenario: (id: string) => void;

  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  notificationPrefs: NotificationPrefs;
  setNotificationPref: (key: keyof NotificationPrefs, value: boolean) => void;

  shortlists: Shortlist[];
  createShortlist: (name: string) => Shortlist;
  addToShortlist: (shortlistId: string, propertyId: string) => void;
  removeFromShortlist: (shortlistId: string, propertyId: string) => void;
  deleteShortlist: (id: string) => void;

  watchedPriceIds: Set<string>;
  togglePriceWatch: (id: string) => void;
  isWatchingPrice: (id: string) => boolean;
  priceAlerts: PriceAlert[];

  syncUserId: string | null;
  syncError: string | null;
  setSyncUserId: (userId: string | null) => void;
  setSyncError: (message: string | null) => void;
  hydrateFromRemote: (data: RemoteUserData) => void;
  hydrateGuest: (data: GuestWorkspace) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  intent: 'buy',
  setIntent: (intent) => set((state) => ({
    intent,
    compareIds: state.intent === intent ? state.compareIds : [],
    filters: state.intent === intent ? state.filters : {
      ...state.filters,
      minPrice: null,
      maxPrice: null,
      maxInstallment: null,
    },
  })),

  savedIds: new Set(),
  toggleSaved: (id) => {
    const nowSaved = !get().savedIds.has(id);
    set((state) => {
      const next = new Set(state.savedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { savedIds: next };
    });
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushSavedProperty(userId, id, nowSaved));
  },
  isSaved: (id) => get().savedIds.has(id),

  hiddenIds: new Set(),
  toggleHidden: (id) =>
    set((state) => {
      const next = new Set(state.hiddenIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { hiddenIds: next };
    }),

  recentlyViewed: [],
  addRecentlyViewed: (id) =>
    set((state) => ({
      recentlyViewed: [id, ...state.recentlyViewed.filter((x) => x !== id)].slice(0, 12),
    })),

  searchHistory: [],
  addSearchHistory: (query) => {
    const q = query.trim();
    if (!q) return;
    set((state) => ({
      searchHistory: [q, ...state.searchHistory.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8),
    }));
  },
  clearSearchHistory: () => set({ searchHistory: [] }),

  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: defaultFilters }),

  savedSearches: [],
  addSavedSearch: (search) => {
    const entry: SavedSearch = { ...search, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    set((state) => ({ savedSearches: [entry, ...state.savedSearches] }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushSavedSearch(userId, entry));
  },
  removeSavedSearch: (id) => {
    set((state) => ({ savedSearches: state.savedSearches.filter((s) => s.id !== id) }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, removeSavedSearchRemote(id));
  },

  kprScenarios: [],
  addKprScenario: (scenario) => {
    const entry: KprScenario = { ...scenario, id: Crypto.randomUUID(), createdAt: new Date().toISOString() };
    set((state) => ({ kprScenarios: [entry, ...state.kprScenarios] }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushKprScenario(userId, entry));
  },
  removeKprScenario: (id) => {
    set((state) => ({ kprScenarios: state.kprScenarios.filter((s) => s.id !== id) }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, removeKprScenarioRemote(id));
  },

  compareIds: [],
  toggleCompare: (id) =>
    set((state) => {
      if (state.compareIds.includes(id)) {
        return { compareIds: state.compareIds.filter((x) => x !== id) };
      }
      if (state.compareIds.length >= 3) return state;
      return { compareIds: [...state.compareIds, id] };
    }),
  clearCompare: () => set({ compareIds: [] }),

  notificationPrefs: defaultNotificationPrefs,
  setNotificationPref: (key, value) => {
    set((state) => ({ notificationPrefs: { ...state.notificationPrefs, [key]: value } }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushNotificationPrefs(userId, get().notificationPrefs));
  },

  shortlists: [],
  createShortlist: (name) => {
    const shortlist: Shortlist = {
      id: Crypto.randomUUID(),
      name,
      propertyIds: [],
      inviteCode: inviteCodeFor(),
      ownerId: get().syncUserId ?? undefined,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ shortlists: [shortlist, ...state.shortlists] }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushShortlist(userId, shortlist));
    return shortlist;
  },
  addToShortlist: (shortlistId, propertyId) => {
    set((state) => ({
      shortlists: state.shortlists.map((sl) =>
        sl.id === shortlistId && !sl.propertyIds.includes(propertyId)
          ? { ...sl, propertyIds: [...sl.propertyIds, propertyId] }
          : sl
      ),
    }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushShortlistProperty(shortlistId, propertyId, userId, true));
  },
  removeFromShortlist: (shortlistId, propertyId) => {
    set((state) => ({
      shortlists: state.shortlists.map((sl) =>
        sl.id === shortlistId ? { ...sl, propertyIds: sl.propertyIds.filter((id) => id !== propertyId) } : sl
      ),
    }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushShortlistProperty(shortlistId, propertyId, userId, false));
  },
  deleteShortlist: (id) => {
    set((state) => ({ shortlists: state.shortlists.filter((sl) => sl.id !== id) }));
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, deleteShortlistRemote(id));
  },

  watchedPriceIds: new Set(),
  togglePriceWatch: (id) => {
    const nowWatching = !get().watchedPriceIds.has(id);
    set((state) => {
      const next = new Set(state.watchedPriceIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { watchedPriceIds: next };
    });
    const userId = get().syncUserId;
    if (userId) syncWrite(userId, pushPriceWatch(userId, id, nowWatching));
  },
  isWatchingPrice: (id) => get().watchedPriceIds.has(id),
  priceAlerts: properties
    .filter((p) => p.previousPrice && p.previousPrice > p.price)
    .map((p) => ({
      propertyId: p.id,
      seenAt: p.lastConfirmed,
      fromPrice: p.previousPrice!,
      toPrice: p.price,
    })),

  syncUserId: null,
  syncError: null,
  setSyncUserId: (userId) => {
    if (get().syncUserId === userId) return;
    set({
      syncUserId: userId,
      syncError: null,
      intent: 'buy',
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
      notificationPrefs: defaultNotificationPrefs,
    });
  },
  setSyncError: (message) => set({ syncError: message }),
  hydrateFromRemote: (data) =>
    set({
      savedIds: new Set(data.savedIds),
      watchedPriceIds: new Set(data.watchedPriceIds),
      savedSearches: data.savedSearches,
      kprScenarios: data.kprScenarios,
      shortlists: data.shortlists,
      notificationPrefs: data.notificationPrefs ?? defaultNotificationPrefs,
    }),
  hydrateGuest: (data) =>
    set({
      savedIds: new Set(data.savedIds),
      watchedPriceIds: new Set(data.watchedPriceIds),
      hiddenIds: new Set(data.hiddenIds),
      recentlyViewed: data.recentlyViewed,
      searchHistory: data.searchHistory,
      savedSearches: data.savedSearches,
      kprScenarios: data.kprScenarios,
      shortlists: data.shortlists,
      filters: data.filters,
      notificationPrefs: data.notificationPrefs,
      intent: data.intent,
    }),
}));
