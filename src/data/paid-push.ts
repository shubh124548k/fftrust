/**
 * FF TRUST — Canonical Paid Push service records (PROMPT 02).
 *
 * Legitimate rank-push packages supporting CS Rank Push and BR Rank Push.
 * NEVER promises guaranteed rank, wins, completion, anti-ban or safety.
 * Schedule is set ONLY when real — never fabricated.
 *
 * Same REAL/SAMPLE isolation contract as accounts.ts.
 */

import type { PaidPushService } from "@/data/types";

/** REAL Paid Push packages (production). Empty until owner publishes. */
export const rankPushPackages: PaidPushService[] = [];

/** SAMPLE Paid Push fixtures — constitution demonstration only. */
export const sampleRankPushPackages: PaidPushService[] = [
  {
    id: "SAMPLE-PUSH-CS-001",
    mode: "CS",
    title: "SAMPLE — CS Rank Push · Gold IV → Heroic",
    fromRank: "Gold IV",
    toRank: "Heroic",
    packageTier: "Standard",
    scope: "Rank-push assistance for the CS mode package. Scope and effort only — no guaranteed outcome.",
    requirements: ["Screen recording ON", "Agreed play schedule"],
    priceInr: 1200,
    packages: [
      {
        id: "SAMPLE-PUSH-CS-001-SILVER",
        label: "Gold IV → Gold I",
        originalPrice: 1500,
        currentPrice: 999,
        badge: "POPULAR",
        highlights: ["CS rank push", "Screen recording required"],
        features: ["CS mode rank push assistance", "Agreed play schedule"],
        duration: "Per session",
        delivery: "Scheduled",
        included: ["Rank push assistance"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
      {
        id: "SAMPLE-PUSH-CS-001-GOLD",
        label: "Platinum IV → Diamond",
        originalPrice: 2600,
        currentPrice: 1799,
        highlights: ["Extended CS push", "Priority scheduling"],
        features: ["Extended CS rank push", "Priority play scheduling", "Screen recording required"],
        duration: "Multi-session",
        delivery: "Scheduled",
        included: ["Extended rank push", "Priority scheduling"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
      {
        id: "SAMPLE-PUSH-CS-001-HEROIC",
        label: "Diamond → Heroic",
        originalPrice: 4200,
        currentPrice: 2999,
        badge: "BEST VALUE",
        highlights: ["Full CS push to Heroic", "Dedicated scheduling", "Priority handling"],
        features: ["Full CS rank push to Heroic", "Dedicated play schedule", "Priority handling", "Screen recording required"],
        duration: "Full season",
        delivery: "Scheduled",
        included: ["Full rank push", "Dedicated scheduling", "Priority handling"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
    ],
    tags: ["cs", "rank-push"],
    sellerRef: "SAMPLE-OWNER",
    media: [],
    frontImage: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    evidenceNotes: "No rank/win guarantee. No anti-ban claim. No cheats or exploits.",
    schedule: undefined,
    terms: "SAMPLE terms — scope & effort only, no guaranteed rank outcome.",
    trustHighlights: [
      { icon: "check", label: "REAL SERVICE" },
    ],
    published: true,
    featured: true,
    demo: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "SAMPLE-PUSH-BR-001",
    mode: "BR",
    title: "SAMPLE — BR Rank Push · Diamond → Grandmaster",
    fromRank: "Diamond",
    toRank: "Grandmaster",
    packageTier: "Extended",
    scope: "Rank-push assistance for the BR mode package. Scope and effort only — no guaranteed outcome.",
    requirements: ["Screen recording ON", "Agreed play schedule"],
    priceInr: 2100,
    packages: [
      {
        id: "SAMPLE-PUSH-BR-001-SILVER",
        label: "Diamond III → Diamond I",
        originalPrice: 2500,
        currentPrice: 1699,
        badge: "POPULAR",
        highlights: ["BR rank push", "Screen recording required"],
        features: ["BR mode rank push assistance", "Agreed play schedule"],
        duration: "Per session",
        delivery: "Scheduled",
        included: ["Rank push assistance"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
      {
        id: "SAMPLE-PUSH-BR-001-GOLD",
        label: "Diamond I → Masters",
        originalPrice: 4500,
        currentPrice: 3199,
        highlights: ["Extended BR push", "Priority scheduling"],
        features: ["Extended BR rank push", "Priority play scheduling", "Screen recording required"],
        duration: "Multi-session",
        delivery: "Scheduled",
        included: ["Extended rank push", "Priority scheduling"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
      {
        id: "SAMPLE-PUSH-BR-001-HEROIC",
        label: "Masters → Grandmaster",
        originalPrice: 6000,
        currentPrice: 4499,
        badge: "BEST VALUE",
        highlights: ["Full BR push to Grandmaster", "Dedicated scheduling", "Priority handling"],
        features: ["Full BR rank push to Grandmaster", "Dedicated play schedule", "Priority handling", "Screen recording required"],
        duration: "Full season",
        delivery: "Scheduled",
        included: ["Full rank push", "Dedicated scheduling", "Priority handling"],
        excluded: ["Guaranteed rank", "Anti-ban"],
      },
    ],
    tags: ["br", "rank-push"],
    sellerRef: "SAMPLE-OWNER",
    media: [],
    frontImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=400&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop",
    ],
    videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    evidenceNotes: "No rank/win guarantee. No anti-ban claim. No cheats or exploits.",
    schedule: undefined,
    terms: "SAMPLE terms — scope & effort only, no guaranteed rank outcome.",
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
