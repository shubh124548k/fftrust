"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RecentlyViewedItem {
  id: string;
  type: string;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addView: (id: string, type: string) => void;
  getItems: () => RecentlyViewedItem[];
  clearItems: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addView: (id, type) =>
        set((s) => {
          const filtered = s.items.filter((item) => item.id !== id);
          return { items: [{ id, type }, ...filtered].slice(0, MAX_ITEMS) };
        }),
      getItems: () => get().items,
      clearItems: () => set({ items: [] }),
    }),
    {
      name: "ff-trust-recently-viewed",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
