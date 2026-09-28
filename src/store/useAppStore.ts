import { create } from 'zustand';
import { properties, type PropertyType } from '../data/properties';

function inviteCodeFor(seed: string) {
  return `${seed}-${Math.random().toString(36).slice(2, 8)}`;
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
};

export const useAppStore = create<AppState>((set, get) => ({
  intent: 'buy',
  setIntent: (intent) => set({ intent }),

  savedIds: new Set(),
  toggleSaved: (id) =>
    set((state) => {
      const next = new Set(state.savedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { savedIds: next };
    }),
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

  filters: defaultFilters,
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: defaultFilters }),

  savedSearches: [],
  addSavedSearch: (search) =>
    set((state) => ({
      savedSearches: [
        { ...search, id: `ss_${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.savedSearches,
      ],
    })),
  removeSavedSearch: (id) =>
    set((state) => ({ savedSearches: state.savedSearches.filter((s) => s.id !== id) })),

  kprScenarios: [],
  addKprScenario: (scenario) =>
    set((state) => ({
      kprScenarios: [
        { ...scenario, id: `kpr_${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.kprScenarios,
      ],
    })),
  removeKprScenario: (id) =>
    set((state) => ({ kprScenarios: state.kprScenarios.filter((s) => s.id !== id) })),

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

  notificationPrefs: {
    savedSearchMatch: true,
    priceDrops: true,
    listingUpdates: true,
    projectPromotions: false,
    shortlistActivity: true,
    leadFollowUp: true,
  },
  setNotificationPref: (key, value) =>
    set((state) => ({ notificationPrefs: { ...state.notificationPrefs, [key]: value } })),

  shortlists: [],
  createShortlist: (name) => {
    const shortlist: Shortlist = {
      id: `sl_${Date.now()}`,
      name,
      propertyIds: [],
      inviteCode: inviteCodeFor('huni'),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ shortlists: [shortlist, ...state.shortlists] }));
    return shortlist;
  },
  addToShortlist: (shortlistId, propertyId) =>
    set((state) => ({
      shortlists: state.shortlists.map((sl) =>
        sl.id === shortlistId && !sl.propertyIds.includes(propertyId)
          ? { ...sl, propertyIds: [...sl.propertyIds, propertyId] }
          : sl
      ),
    })),
  removeFromShortlist: (shortlistId, propertyId) =>
    set((state) => ({
      shortlists: state.shortlists.map((sl) =>
        sl.id === shortlistId ? { ...sl, propertyIds: sl.propertyIds.filter((id) => id !== propertyId) } : sl
      ),
    })),
  deleteShortlist: (id) => set((state) => ({ shortlists: state.shortlists.filter((sl) => sl.id !== id) })),

  watchedPriceIds: new Set(),
  togglePriceWatch: (id) =>
    set((state) => {
      const next = new Set(state.watchedPriceIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { watchedPriceIds: next };
    }),
  isWatchingPrice: (id) => get().watchedPriceIds.has(id),
  priceAlerts: properties
    .filter((p) => p.previousPrice && p.previousPrice > p.price)
    .map((p) => ({
      propertyId: p.id,
      seenAt: p.lastConfirmed,
      fromPrice: p.previousPrice!,
      toPrice: p.price,
    })),
}));
