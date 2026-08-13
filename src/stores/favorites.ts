"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * FF TRUST — Favorites & Compare store.
 *
 * Client-side persisted state for favorite and compare-tray listing IDs.
 * Uses Zustand + persist (localStorage) so favorites/compare survive reloads.
 *
 * REAL-DATA contract: stores only canonical record IDs — never fake metrics,
 * ratings, or counts. The count is derived from the stored IDs (honest).
 *
 * COMPARE TYPE-SAFETY: the compare tray tracks the listing TYPE of the first
 * item added. Subsequent items must match the same type — cross-type
 * comparison is blocked at the store level (e.g. you cannot compare an
 * Account with a Panel Seller). The UI shows a friendly message when a
 * cross-type attempt is made.
 */

export type ListingType = "account" | "panel" | "paid-push";

interface CompareEntry {
  id: string;
  type: ListingType;
}

interface FavoritesState {
  favorites: string[];
  compare: CompareEntry[];
  /** The listing type of the current compare tray (null when empty). */
  compareType: ListingType | null;
  /** Error message shown when a cross-type comparison is attempted. */
  compareError: string | null;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string, type: ListingType) => void;
  isFavorite: (id: string) => boolean;
  isComparing: (id: string) => boolean;
  clearFavorites: () => void;
  clearCompare: () => void;
  clearCompareError: () => void;
  /** Max 4 in compare tray to keep the comparison readable. */
  readonly compareMax: number;
}

const TYPE_LABELS: Record<ListingType, string> = {
  account: "Account ID",
  panel: "Panel Seller",
  "paid-push": "Paid Push",
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      compareType: null,
      compareError: null,
      compareMax: 4,
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      toggleCompare: (id, type) =>
        set((s) => {
          // If already in compare, remove it
          const existing = s.compare.find((e) => e.id === id);
          if (existing) {
            const newCompare = s.compare.filter((e) => e.id !== id);
            return {
              compare: newCompare,
              compareType: newCompare.length > 0 ? newCompare[0].type : null,
              compareError: null,
            };
          }
          // Check type compatibility
          if (s.compareType !== null && s.compareType !== type) {
            return {
              compareError: `Compare ${TYPE_LABELS[s.compareType]}s with other ${TYPE_LABELS[s.compareType]}s only.`,
            };
          }
          // Check max capacity
          if (s.compare.length >= s.compareMax) return s;
          return {
            compare: [...s.compare, { id, type }],
            compareType: type,
            compareError: null,
          };
        }),
      isFavorite: (id) => get().favorites.includes(id),
      isComparing: (id) => get().compare.some((e) => e.id === id),
      clearFavorites: () => set({ favorites: [] }),
      clearCompare: () => set({ compare: [], compareType: null, compareError: null }),
      clearCompareError: () => set({ compareError: null }),
    }),
    {
      name: "ff-trust-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
