"use client";

import { create } from "zustand";
import type { SellerType } from "@/components/seller/seller-contact-popup";

/**
 * FF TRUST — Seller Contact popup store.
 *
 * Global store so the SellerContactPopup (mounted once in page.tsx) can be
 * opened from anywhere — the page CTA, the navbar, and the mobile command
 * center — without prop drilling.
 *
 * No persistence — popup state is ephemeral.
 */
interface SellerContactState {
  open: boolean;
  sellerType: SellerType;
  openPopup: (type?: SellerType) => void;
  closePopup: () => void;
}

export const useSellerContactStore = create<SellerContactState>((set) => ({
  open: false,
  sellerType: "account",
  openPopup: (type = "account") => set({ open: true, sellerType: type }),
  closePopup: () => set({ open: false }),
}));
