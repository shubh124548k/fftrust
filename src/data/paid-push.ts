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
    published: true,
    featured: false,
    demo: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
];
