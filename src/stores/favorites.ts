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

export type ListingType = "account" | "panel" | "paid-push" | "instagram";

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
  /**
   * Max 2 in compare tray — keeps the comparison readable and the tray
   * compact (PROMPT 4: "Compare up to 2 X" message contract).
   */
  readonly compareMax: number;
}

/**
 * Single source of truth for type-specific compare labels used across the
 * tray, compare page and store errors (PROMPT 4: "Compare up to 2 Free Fire
 * IDs", "Add another Free Fire ID" / "Add another Panel" / "Add another Paid
 * Push").
 */
export const COMPARE_TYPE_LABELS: Record<ListingType, string> = {
  account: "Free Fire ID",
  panel: "Panel",
  "paid-push": "Paid Push",
  instagram: "Instagram package",
};

/** Proper plural forms for the type labels — naive `+ "s"` breaks "Paid Push". */
export const COMPARE_TYPE_PLURALS: Record<ListingType, string> = {
  account: "Free Fire IDs",
  panel: "Panels",
  "paid-push": "Paid Pushes",
  instagram: "Instagram packages",
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      compareType: null,
      compareError: null,
      compareMax: 2,
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
              compareError: `Compare ${COMPARE_TYPE_PLURALS[s.compareType]} with other ${COMPARE_TYPE_PLURALS[s.compareType]} only.`,
            };
          }
          // Check max capacity
          if (s.compare.length >= s.compareMax) {
            return {
              compareError: `Compare is limited to ${s.compareMax} ${COMPARE_TYPE_PLURALS[s.compareType ?? type]} at once.`,
            };
          }
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
