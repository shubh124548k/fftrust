/**
 * FF TRUST — Canonical Panel Seller service records (PROMPT 02).
 *
 * Legitimate service marketplace (panel / top-up / diamond / bundle /
 * account-care). Full schema: service ID, title, category, priceInr, scope,
 * requirements, included/excluded, media, evidence, seller reference, terms,
 * tags, publication state.
 *
 * Same REAL/SAMPLE isolation contract as accounts.ts.
 */

import type { PanelSellerService } from "@/data/types";

/** REAL Panel Seller services (production). Empty until owner publishes. */
export const panelServices: PanelSellerService[] = [];

/** SAMPLE Panel Seller fixtures — constitution demonstration only. */
export const samplePanelServices: PanelSellerService[] = [
  {
    id: "SAMPLE-SVC-PANEL-001",
    title: "SAMPLE — Diamond Panel (Streaming)",
    category: "panel",
    scope: "Read-only streaming panel access for verification window only.",
    requirements: ["Screen recording ON", "Verification window agreed in advance"],
    included: ["Temporary view access", "Owner-assisted walkthrough"],
    excluded: ["Account login transfer", "Credential sharing", "Persistent access"],
    priceInr: 900,
    packages: [
      {
        id: "SAMPLE-SVC-PANEL-001-BASIC",
        label: "Basic",
        originalPrice: 999,
        currentPrice: 699,
        badge: "POPULAR",
        highlights: ["Temporary view access", "Owner-assisted walkthrough"],
        features: ["Read-only streaming panel", "Verification window"],
        duration: "Single session",
        delivery: "Within 1 hour",
        included: ["Temporary view access"],
        excluded: ["Persistent access"],
      },
      {
        id: "SAMPLE-SVC-PANEL-001-PRO",
        label: "Pro",
        originalPrice: 1999,
        currentPrice: 1299,
        highlights: ["Extended view window", "Priority scheduling"],
        features: ["Read-only streaming panel", "Extended verification window", "Owner-assisted walkthrough"],
        duration: "24-hour access",
        delivery: "Within 1 hour",
        included: ["Extended view access", "Priority scheduling"],
        excluded: ["Account login transfer"],
      },
      {
        id: "SAMPLE-SVC-PANEL-001-PREMIUM",
        label: "Premium",
        originalPrice: 3999,
        currentPrice: 2499,
        badge: "BEST VALUE",
        highlights: ["Full panel access", "Dedicated support", "Priority handling"],
        features: ["Full streaming panel access", "Extended verification window", "Owner-assisted walkthrough", "Dedicated support"],
        duration: "7-day access",
        delivery: "Within 1 hour",
        included: ["Full panel access", "Dedicated support", "Priority handling"],
        excluded: ["Account login transfer"],
      },
    ],
    tags: ["panel", "streaming", "verification"],
    sellerRef: "SAMPLE-OWNER",
    media: [],
    frontImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    evidenceNotes: "SAMPLE — verification-window panel access demonstration.",
    terms: "SAMPLE terms — streaming-panel access is temporary and read-only.",
    trustHighlights: [
      { icon: "check", label: "REAL SERVICE" },
      { icon: "check", label: "VERIFIED DETAILS" },
    ],
    published: true,
    featured: true,
    demo: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "SAMPLE-SVC-TOPUP-001",
    title: "SAMPLE — Diamond Top-Up (In-Game)",
    category: "topup",
    scope: "In-game diamond top-up to your own account via official channels.",
    requirements: ["Your own Player ID", "Screen recording ON"],
    included: ["Receipt", "Confirmation screenshot"],
    excluded: ["Account login transfer", "Password / OTP"],
    priceInr: 350,
    packages: [
      {
        id: "SAMPLE-SVC-TOPUP-001-BASIC",
        label: "Basic",
        originalPrice: 400,
        currentPrice: 350,
        highlights: ["Small diamond top-up", "Official channel"],
        features: ["In-game diamond delivery", "Confirmation screenshot"],
        duration: "One-time",
        delivery: "Within 30 minutes",
        included: ["Diamond top-up", "Receipt"],
        excluded: ["Account login transfer"],
      },
      {
        id: "SAMPLE-SVC-TOPUP-001-PRO",
        label: "Pro",
        originalPrice: 900,
        currentPrice: 750,
        badge: "POPULAR",
        highlights: ["Medium diamond top-up", "Priority processing"],
        features: ["In-game diamond delivery", "Priority processing", "Confirmation screenshot"],
        duration: "One-time",
        delivery: "Within 30 minutes",
        included: ["Diamond top-up", "Priority processing", "Receipt"],
        excluded: ["Account login transfer"],
      },
      {
        id: "SAMPLE-SVC-TOPUP-001-PREMIUM",
        label: "Premium",
        originalPrice: 2000,
        currentPrice: 1599,
        badge: "BEST VALUE",
        highlights: ["Large diamond top-up", "Dedicated support", "Fastest delivery"],
        features: ["Large in-game diamond delivery", "Dedicated support", "Fastest processing", "Confirmation screenshot"],
        duration: "One-time",
        delivery: "Within 15 minutes",
        included: ["Diamond top-up", "Dedicated support", "Priority handling"],
        excluded: ["Account login transfer"],
      },
    ],
    tags: ["topup", "diamond", "official"],
    sellerRef: "SAMPLE-OWNER",
    media: [],
    frontImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://vimeo.com/1084537",
    evidenceNotes: "SAMPLE — official-channel top-up demonstration.",
    terms: "SAMPLE terms — top-up to your own account only.",
    trustHighlights: [
      { icon: "check", label: "REAL SERVICE" },
      { icon: "check", label: "VERIFIED DETAILS" },
    ],
    published: true,
    featured: false,
    demo: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
];
