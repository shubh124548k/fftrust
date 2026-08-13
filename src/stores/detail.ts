"use client";

import { create } from "zustand";

/**
 * FF TRUST — Account Detail store (PROMPT 07).
 *
 * Tracks the currently-selected account ID for the detail overlay. When
 * non-null, the AccountDetailOverlay renders. Set to null to close.
 *
 * No persistence — detail state is ephemeral (not shared across reloads).
 */
interface DetailState {
  selectedId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const useDetailStore = create<DetailState>((set) => ({
  selectedId: null,
  open: (id) => set({ selectedId: id }),
  close: () => set({ selectedId: null }),
}));
