/**
 * FF TRUST — Canonical seller references.
 *
 * REAL-DATA CONTRACT: `verifiedEvidence` lists honest evidence-state labels
 * (e.g. "Bound email on file") derived from real canonical state. NEVER fake
 * ratings, reviews, verification percentages, trust scores or sales counts.
 *
 * SAMPLE seller: SAMPLE-OWNER, used only by SAMPLE fixtures.
 */

import type { SellerReference } from "@/data/types";

export const sellers: SellerReference[] = [];

export const sampleSellers: SellerReference[] = [
  {
    id: "SAMPLE-OWNER",
    displayName: "SAMPLE Owner",
    verifiedEvidence: ["Bound email on file (SAMPLE)"],
    note: "SAMPLE — demonstration seller only.",
    demo: true,
  },
];

/** Combined pool (real + sample) for by-id lookups. */
export const allSellers: SellerReference[] = [...sellers, ...sampleSellers];
