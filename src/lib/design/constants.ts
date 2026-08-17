/**
 * FF TRUST — Shared presentation constants.
 *
 * Single source of truth for the price-sort dropdown options and the
 * decorative no-media gradient so every catalogue, showroom, marketplace and
 * gallery renders identical copy and visuals.
 */

export type PriceSortValue = "price-asc" | "price-desc";

/** Options shared by the account catalogue, panel showroom, paid-push marketplace and Instagram pages. */
export const PRICE_SORT_OPTIONS: { value: PriceSortValue; label: string }[] = [
  { value: "price-desc", label: "Price · High to Low" },
  { value: "price-asc", label: "Price · Low to High" },
];

/** Crystalline fallback gradient used for no-media / broken-media states. */
export const DECORATIVE_GRADIENT =
  "linear-gradient(135deg, oklch(0.82 0.1 200 / 0.35) 0%, oklch(0.7 0.12 290 / 0.22) 50%, oklch(0.9 0.02 245 / 0.5) 100%)";
