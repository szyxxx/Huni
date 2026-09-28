import { z } from 'zod';

const nullableNumber = z.number().finite().nonnegative().nullable();
const filters = z.object({
  types: z.array(z.enum(['house', 'apartment', 'villa', 'kost', 'land', 'ruko', 'office'])),
  minPrice: nullableNumber,
  maxPrice: nullableNumber,
  bedrooms: nullableNumber,
  bathrooms: nullableNumber,
  maxInstallment: nullableNumber,
  furnished: z.boolean().nullable(),
  verifiedOnly: z.boolean(),
  minArea: nullableNumber,
  specialOfferOnly: z.boolean(),
  videoOnly: z.boolean(),
});
const notificationPrefs = z.object({
  savedSearchMatch: z.boolean(),
  priceDrops: z.boolean(),
  listingUpdates: z.boolean(),
  projectPromotions: z.boolean(),
  shortlistActivity: z.boolean(),
  leadFollowUp: z.boolean(),
});
const workspace = z.object({
  savedIds: z.array(z.string()),
  watchedPriceIds: z.array(z.string()),
  hiddenIds: z.array(z.string()),
  recentlyViewed: z.array(z.string()),
  searchHistory: z.array(z.string()),
  savedSearches: z.array(z.object({
    id: z.string(), label: z.string(), query: z.string(), intent: z.enum(['buy', 'rent', 'new-projects']),
    filters, createdAt: z.string(), notify: z.boolean(),
  })),
  kprScenarios: z.array(z.object({
    id: z.string(), label: z.string(), price: z.number(), downPaymentPercent: z.number(),
    tenorYears: z.number(), ratePercent: z.number(), monthlyInstallment: z.number(), createdAt: z.string(),
  })),
  shortlists: z.array(z.object({
    id: z.string(), name: z.string(), propertyIds: z.array(z.string()), inviteCode: z.string(), ownerId: z.string().optional(), createdAt: z.string(),
  })),
  filters,
  notificationPrefs,
  intent: z.enum(['buy', 'rent', 'new-projects']),
});

export type GuestWorkspace = z.infer<typeof workspace>;

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<unknown>;
};

const STORAGE_KEY = 'huni_guest_workspace_v1';

export class GuestWorkspaceStorage {
  private pending: Promise<unknown> = Promise.resolve();

  constructor(private readonly storage: StorageAdapter) {}

  async load(): Promise<GuestWorkspace | null> {
    await this.pending.catch(() => {});
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = workspace.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  save(snapshot: GuestWorkspace): Promise<unknown> {
    this.pending = this.pending.catch(() => {}).then(() => this.storage.setItem(STORAGE_KEY, JSON.stringify(snapshot)));
    return this.pending;
  }

  clear(): Promise<unknown> {
    this.pending = this.pending.catch(() => {}).then(() => this.storage.removeItem(STORAGE_KEY));
    return this.pending;
  }
}

export function captureGuestWorkspace(state: Omit<GuestWorkspace, 'savedIds' | 'watchedPriceIds' | 'hiddenIds'> & {
  savedIds: Set<string>;
  watchedPriceIds: Set<string>;
  hiddenIds: Set<string>;
}): GuestWorkspace {
  return {
    savedIds: [...state.savedIds],
    watchedPriceIds: [...state.watchedPriceIds],
    hiddenIds: [...state.hiddenIds],
    recentlyViewed: state.recentlyViewed,
    searchHistory: state.searchHistory,
    savedSearches: state.savedSearches,
    kprScenarios: state.kprScenarios,
    shortlists: state.shortlists,
    filters: state.filters,
    notificationPrefs: state.notificationPrefs,
    intent: state.intent,
  };
}
