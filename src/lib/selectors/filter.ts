/**
 * FF TRUST — Generic filter / search / sort primitives.
 *
 * Reusable building blocks so every listing-type selector shares the same
 * filtering semantics. New record types adopt these without rewriting filter
 * logic (future-proofing contract).
 */

import type { SortKey } from "@/data/types";

export interface PriceRangeFilter {
  minPrice?: number;
  maxPrice?: number;
}

export interface LevelRangeFilter {
  minLevel?: number;
  maxLevel?: number;
}

/** Case-insensitive, multi-field search against a set of string getters. */
export function searchBy<T>(
  records: T[],
  query: string | undefined,
  getFields: (r: T) => string[],
): T[] {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return records;
  return records.filter((r) =>
    getFields(r).some((f) => f.toLowerCase().includes(q)),
  );
}

export function sortByKey<T extends { priceInr: number; level: number; createdAt: string }>(
  records: T[],
  sort: SortKey,
): T[] {
  const copy = [...records];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceInr - b.priceInr);
    case "price-desc":
      return copy.sort((a, b) => b.priceInr - a.priceInr);
    case "level-desc":
      return copy.sort((a, b) => b.level - a.level);
    case "newest":
    default:
      return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
}

/** Within price range (inclusive). */
export function withinPrice<T extends { priceInr: number }>(
  records: T[],
  range: PriceRangeFilter,
): T[] {
  return records.filter((r) => {
    if (typeof range.minPrice === "number" && r.priceInr < range.minPrice) return false;
    if (typeof range.maxPrice === "number" && r.priceInr > range.maxPrice) return false;
    return true;
  });
}

/** Within level range (inclusive). */
export function withinLevel<T extends { level: number }>(
  records: T[],
  range: LevelRangeFilter,
): T[] {
  return records.filter((r) => {
    if (typeof range.minLevel === "number" && r.level < range.minLevel) return false;
    if (typeof range.maxLevel === "number" && r.level > range.maxLevel) return false;
    return true;
  });
}

/** Dynamic discovery of distinct values across a record set. */
export function discoverDistinct<T, K extends string | number>(
  records: T[],
  pick: (r: T) => K | K[] | undefined,
): K[] {
  const set = new Set<K>();
  for (const r of records) {
    const v = pick(r);
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((x) => set.add(x));
    else set.add(v);
  }
  return Array.from(set);
}
