/**
 * FF TRUST — Canonical account records (PROMPT 02 production schema).
 *
 * REAL-DATA CONTRACT: `accounts` is the production inventory (empty by default
 * — owner adds real listings). `sampleAccounts` holds explicitly SAMPLE
 * fixtures (demo:true, SAMPLE- prefixed) used ONLY to demonstrate the visual
 * constitution. Production selectors expose ONLY `published && !demo`.
 *
 * Owner workflow: edit canonical data here → normal build/deploy/refresh →
 * every consumer (Home, Explore, Search, Filters, Sort, Cards, Detail, Gallery,
 * Video, Compare, Favorites, Price Guide, related, metadata, WhatsApp) derives
 * automatically. No duplicated business data across pages.
 */

import type { AccountListing } from "@/data/types";

/** REAL canonical records (production inventory). Empty until owner publishes. */
export const accounts: AccountListing[] = [
  // Add real published accounts here, e.g.:
  // {
  //   id: "ACC-1001", title: "Heroic Account — Full Collection",
  //   category: "battleground", level: 78, rank: "Heroic", region: "India",
  //   priceInr: 4200, originalPrice: 5200, prime: true,
  //   collections: ["Summer Bundle"], weapons: ["AK Dragon"],
  //   evo: ["M1014 Dragon"], emotes: ["Top Up"], bundles: ["Anime Bundle"],
  //   pets: ["Falcon"], vehicles: ["Sports Car"], badges: ["Elite"],
  //   description: "...", tags: ["heroic", "anime-bundle"],
  //   sellerRef: "SELLER-001", evidence: { hasBoundEmail: true, hasOriginalReceipt: true, hasRecoveryAccess: false },
  //   media: [{ kind: "image", url: "/evidence/acc-1001/1.jpg", evidence: true, alt: "..." }],
  //   terms: "...", published: true, featured: true,
  //   createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z",
  // },
];

/**
 * SAMPLE fixtures — isolated, explicitly flagged. Demonstrate the FULL schema
 * (Prime, collections, weapons, evo, emotes, bundles, pets, vehicles, badges,
 * media, terms, featured). IDs prefixed SAMPLE- so they can never be mistaken
 * for real inventory. Media arrays are empty (no fake evidence images).
 */
export const sampleAccounts: AccountListing[] = [
  {
    id: "SAMPLE-ACC-001",
    title: "SAMPLE — Architect Account",
    category: "battleground",
    level: 78,
    rank: "Heroic",
    region: "India",
    priceInr: 4200,
    originalPrice: 5200,
    prime: true,
    collections: ["Anime Bundle", "Summer Collection"],
    weapons: ["AK — Dragon Roar", "MP40 — Genocidal Butterfly"],
    evo: ["M1014 — Dragon Roar (Evo 3)"],
    emotes: ["Top Up", "Battle Cry"],
    bundles: ["Anime Bundle", "Booyah Day"],
    pets: ["Falcon — Spirit"],
    vehicles: ["Sports Car — Blue Flame"],
    badges: ["Elite", "Pro"],
    description:
      "SAMPLE fixture demonstrating a Heroic-tier account with a full collection. This is not a real listing — it shows how canonical fields render across cards, detail and filters.",
    tags: ["heroic", "anime-bundle", "full-collection"],
    sellerRef: "SAMPLE-OWNER",
    evidence: {
      hasBoundEmail: true,
      hasOriginalReceipt: true,
      hasRecoveryAccess: false,
      provenanceNote: "SAMPLE — bound email + receipt on file (demonstration only).",
    },
    trustHighlights: [
      { icon: "check", label: "PROOF AVAILABLE" },
      { icon: "check", label: "VERIFIED EVIDENCE" },
    ],
    media: [],
    frontImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    terms:
      "SAMPLE terms — real listings carry the seller's actual transfer terms. Screen recording required.",
    published: true,
    featured: true,
    demo: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "SAMPLE-ACC-002",
    title: "SAMPLE — Prism Collection",
    category: "collection",
    level: 64,
    rank: "Grandmaster",
    region: "India",
    priceInr: 7800,
    prime: true,
    collections: ["Prism Collection", "Diamond Pass"],
    weapons: ["M1887 — Prism"],
    evo: [],
    emotes: ["Booyah"],
    bundles: ["Diamond Pass Bundle"],
    pets: ["Robo Dog"],
    vehicles: [],
    badges: ["Grandmaster"],
    description:
      "SAMPLE fixture demonstrating a Grandmaster collection-focused account with rare bundles.",
    tags: ["grandmaster", "rare-bundle", "diamond-pass"],
    sellerRef: "SAMPLE-OWNER",
    evidence: {
      hasBoundEmail: false,
      hasOriginalReceipt: true,
      hasRecoveryAccess: false,
      provenanceNote: "SAMPLE — receipt on file; bound email not included.",
    },
    trustHighlights: [
      { icon: "check", label: "PROOF AVAILABLE" },
    ],
    media: [],
    frontImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    terms: "SAMPLE terms — collection-focused listing.",
    published: true,
    featured: false,
    demo: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  {
    id: "SAMPLE-ACC-003",
    title: "SAMPLE — Starter Vault",
    category: "starter",
    level: 41,
    rank: "Diamond",
    region: "India",
    priceInr: 1500,
    prime: false,
    collections: [],
    weapons: ["AK — Default"],
    evo: [],
    emotes: [],
    bundles: [],
    pets: [],
    vehicles: [],
    badges: ["Diamond"],
    description:
      "SAMPLE fixture demonstrating a clean starter account at an entry-level price point.",
    tags: ["diamond", "clean-starter"],
    sellerRef: "SAMPLE-OWNER",
    evidence: {
      hasBoundEmail: true,
      hasOriginalReceipt: false,
      hasRecoveryAccess: false,
      provenanceNote: "SAMPLE — bound email only; no receipt.",
    },
    trustHighlights: [
      { icon: "check", label: "VERIFIED EVIDENCE" },
    ],
    media: [],
    frontImage: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    terms: "SAMPLE terms — starter listing.",
    published: true,
    featured: false,
    demo: true,
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z",
  },
];
