"use client";

import { create } from "zustand";

export type PendingActionType =
  | "wishlist"
  | "contact"
  | "order"
  | "inquiry"
  | "list-account"
  | "seller-dashboard"
  | "report";

export interface PendingAction {
  type: PendingActionType;
  listingId?: string;
  listingType?: string;
  selectedPackageId?: string;
  message?: string;
  url?: string;
}

const PENDING_KEY = "ff-trust-pending-action";

export function savePendingAction(action: PendingAction) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(action));
  } catch { /* noop */ }
}

export function consumePendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as PendingAction;
  } catch {
    return null;
  }
}

interface AuthState {
  showLoginModal: boolean;
  pendingAction: PendingAction | null;
  openLoginModal: (action?: PendingAction) => void;
  closeLoginModal: () => void;
  clearPendingAction: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  showLoginModal: false,
  pendingAction: null,
  openLoginModal: (action) => set({ showLoginModal: true, pendingAction: action ?? null }),
  closeLoginModal: () => set({ showLoginModal: false }),
  clearPendingAction: () => set({ pendingAction: null }),
}));
