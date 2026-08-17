/**
 * FF TRUST — Universal pricing helpers (PROMPT 02 Parts 5 / 10 / 12).
 *
 * Single source of truth for price math across every marketplace category:
 *  - savings = originalPrice - currentPrice
 *  - discountPercentage = ((originalPrice - currentPrice) / originalPrice) * 100
 *
 * A listing may be either:
 *  - single price (priceInr only)  → show the valid price, never a fake discount
 *  - package priced (packages[])   → each package carries its own original +
 *    current price, with savings/discount computed here
 *
 * Components never recompute savings themselves — they consume these helpers,
 * so one data record stays the single source of truth everywhere.
 */

/** INR formatter (Indian-style comma separators). */
export function formatPrice(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export interface Savings {
  /** Original price in INR. */
  originalPrice: number;
  /** Current (discounted) price in INR. */
  currentPrice: number;
  /** originalPrice - currentPrice. */
  savingAmount: number;
  /** Rounded integer percentage ((original - current) / original * 100). */
  savingPercentage: number;
}

/** Compute savings from an original + current price pair.
 *
 *  Returns `null` when no genuine discount exists (invalid/missing/zero
 *  prices or current >= original) so consumers can never render a fake
 *  "SAVE" badge or a negative saving. A real discount requires
 *  0 < currentPrice < originalPrice. */
export function computeSavings(
  originalPrice: number,
  currentPrice: number,
): Savings | null {
  if (!Number.isFinite(originalPrice) || !Number.isFinite(currentPrice)) {
    return null;
  }
  if (originalPrice <= 0 || currentPrice <= 0) return null;
  if (currentPrice >= originalPrice) return null;
  const savingAmount = originalPrice - currentPrice;
  const savingPercentage = Math.round((savingAmount / originalPrice) * 100);
  return { originalPrice, currentPrice, savingAmount, savingPercentage };
}

/** A listing that can carry either a single price or optional package tiers. */
export interface PriceableListing {
  priceInr: number;
  packages?: { originalPrice: number; currentPrice: number }[];
}

/**
 * The effective price shown on cards / headers:
 * - package priced → the lowest current package price ("Starting ₹X")
 * - single price   → priceInr
 */
export function getStartingPrice(record: PriceableListing): number {
  if (record.packages && record.packages.length > 0) {
    return Math.min(...record.packages.map((p) => p.currentPrice));
  }
  return record.priceInr;
}

/**
 * The package with the lowest current price (the "starting" tier). Used to
 * derive a real discount on cards/details: the starting tier's own
 * original/current pair feeds the SAVE badge. Returns null when there are
 * no valid packages.
 */
export function getBestPackage(
  record: PriceableListing,
): { originalPrice: number; currentPrice: number } | null {
  if (!record.packages || record.packages.length === 0) return null;
  let best: { originalPrice: number; currentPrice: number } | null = null;
  for (const p of record.packages) {
    if (!Number.isFinite(p.currentPrice) || p.currentPrice <= 0) continue;
    if (!best || p.currentPrice < best.currentPrice) {
      best = { originalPrice: p.originalPrice, currentPrice: p.currentPrice };
    }
  }
  return best;
}
