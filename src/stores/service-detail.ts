"use client";

import { create } from "zustand";

/**
 * FF TRUST — Service Detail store (PROMPT 10).
 * Tracks the currently-selected service ID for the detail overlay.
 */
interface ServiceDetailState {
  selectedId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export const useServiceDetailStore = create<ServiceDetailState>((set) => ({
  selectedId: null,
  open: (id) => set({ selectedId: id }),
  close: () => set({ selectedId: null }),
}));
