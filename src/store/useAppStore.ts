import { create } from 'zustand';

export type SearchIntent = 'buy' | 'rent' | 'new-projects';

type AppState = {
  intent: SearchIntent;
  setIntent: (intent: SearchIntent) => void;
  savedIds: Set<string>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
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
  recentlyViewed: [],
  addRecentlyViewed: (id) =>
    set((state) => ({
      recentlyViewed: [id, ...state.recentlyViewed.filter((x) => x !== id)].slice(0, 12),
    })),
}));
